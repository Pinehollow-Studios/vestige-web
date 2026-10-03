import "server-only";

import type { WaitlistSource } from "@/lib/sources";

/**
 * Resend waitlist integration.
 *
 * Resend retired "Audiences" in 2025 — contacts are now global and grouped by
 * "segments". A waitlist signup therefore (1) upserts a global contact — tagged
 * with its acquisition source (see addToWaitlist) — and (2) adds it to the
 * launch-waitlist segment, which the launch broadcast will target.
 *
 * To wire this up:
 *   1. Sign up at https://resend.com, verify your sending domain.
 *   2. Create a Segment (Dashboard → Contacts → Segments) for the waitlist.
 *   3. Create a *Full access* API key — writing contacts needs more than the
 *      send-only scope. (Server-side only; never exposed to the browser.)
 *   4. Set RESEND_API_KEY + RESEND_WAITLIST_SEGMENT_ID in .env.local (dev)
 *      and in the Vercel project env vars (prod).
 *
 * Until both env vars are set, addToWaitlist() is a no-op that logs and returns
 * success — so the form works end-to-end locally before Resend is configured.
 */

const RESEND_API = "https://api.resend.com";

// api.resend.com is fronted by Cloudflare, which blocks requests with a missing
// or bot-like User-Agent (HTTP 403, "error code: 1010"). Send an explicit one.
const USER_AGENT = "vestige-web/1.0 (+https://vestige.golf)";

export type WaitlistResult =
  // isNew: contact didn't exist before this signup. rejoined: contact existed
  // but had unsubscribed and is opting back in. Both deserve a welcome email;
  // an active subscriber re-submitting (both false) does not.
  | { ok: true; mode: "live" | "noop"; isNew: boolean; rejoined: boolean }
  | { ok: false; error: string };

export async function addToWaitlist(
  email: string,
  source: WaitlistSource = "organic"
): Promise<WaitlistResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_WAITLIST_SEGMENT_ID;

  if (!apiKey || !segmentId) {
    // Local-dev / pre-Resend fallback: log the email and pretend it worked.
    // Switches to live mode the moment both env vars are populated.
    console.log("[waitlist:noop]", email, `source=${source}`);
    return { ok: true, mode: "noop", isNew: true, rejoined: false };
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "User-Agent": USER_AGENT,
  };

  try {
    // Has this email already joined? Drives the welcome email: genuinely new
    // signups get one, and so does an existing contact who had unsubscribed —
    // they're opting back in, not duplicating an active subscription. (GET 200
    // = exists, and the body says whether they're unsubscribed; 404/anything
    // else = treat as new — a possible double-welcome beats never welcoming
    // anyone.)
    let isNew = true;
    let rejoined = false;
    try {
      const existing = await fetch(
        `${RESEND_API}/contacts/${encodeURIComponent(email)}`,
        { method: "GET", headers }
      );
      if (existing.ok) {
        isNew = false;
        const body = (await existing.json().catch(() => null)) as {
          unsubscribed?: boolean;
        } | null;
        rejoined = body?.unsubscribed === true;
      }
    } catch {
      /* network blip — fall back to treating as new */
    }

    // 1. Upsert the global contact, tagging where the signup came from (the
    //    source). Resend is idempotent: a repeat email returns the existing
    //    contact's id (201) rather than erroring. We only set the source on a
    //    genuinely new contact, so the *first* touch wins — a later re-signup via
    //    a different link can't overwrite how someone originally came in.
    //
    //    Why last_name: Resend contacts have no custom-field/metadata support,
    //    and the free tier caps segments at 3 (too few for one per source). We
    //    never collect a real name, so the field is otherwise unused. It's
    //    queryable later (contact export / GET contact) to reconcile the beta
    //    "Founding Member" badges. NB: don't reference {{LAST_NAME}} in a
    //    broadcast template, or it'll render the source. See src/lib/sources.ts.
    const contactBody: Record<string, unknown> = { email, unsubscribed: false };
    if (isNew) contactBody.last_name = source;
    const createRes = await fetch(`${RESEND_API}/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify(contactBody),
    });

    if (!createRes.ok) {
      const body = await createRes.text().catch(() => "");
      console.error("[waitlist:create-error]", createRes.status, body);
      return {
        ok: false,
        error: "We couldn't save your email. Try again in a moment.",
      };
    }

    const contact = (await createRes.json().catch(() => null)) as {
      id?: string;
    } | null;

    // 2. Add the contact to the launch-waitlist segment (what the launch
    //    broadcast targets). Also idempotent. The email is already captured as
    //    a contact, so a failure here is logged but not surfaced to the user —
    //    segment membership can be backfilled.
    if (contact?.id) {
      const segRes = await fetch(
        `${RESEND_API}/contacts/${contact.id}/segments/${segmentId}`,
        { method: "POST", headers }
      );
      if (!segRes.ok) {
        const body = await segRes.text().catch(() => "");
        console.error("[waitlist:segment-error]", segRes.status, body);
      }
    } else {
      console.error("[waitlist:no-contact-id]", email);
    }

    return { ok: true, mode: "live", isNew, rejoined };
  } catch (err) {
    console.error("[waitlist:exception]", err);
    return { ok: false, error: "Something went wrong. Try again in a moment." };
  }
}

export type UnsubscribeResult = { ok: boolean; mode: "live" | "noop" };

/**
 * Mark a contact as unsubscribed. Contacts are global (Resend retired Audiences
 * — see addToWaitlist), so this is a single PATCH /contacts/{email} setting
 * `unsubscribed: true`; Resend then suppresses future broadcasts to them.
 *
 * Idempotent and tolerant: a missing contact (404) or an already-unsubscribed
 * one is still a "success" from the user's point of view — they wanted out, and
 * they're out. Only a genuine API failure returns ok:false (the /unsubscribe
 * route then tells them to email us so we can remove them by hand).
 *
 * Without RESEND_API_KEY this is a logged no-op, mirroring addToWaitlist so the
 * flow works end-to-end locally before Resend is wired up.
 */
export async function unsubscribeContact(
  email: string
): Promise<UnsubscribeResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[unsubscribe:noop]", email);
    return { ok: true, mode: "noop" };
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "User-Agent": USER_AGENT,
  };

  try {
    const res = await fetch(
      `${RESEND_API}/contacts/${encodeURIComponent(email.trim().toLowerCase())}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ unsubscribed: true }),
      }
    );

    // 404 = we never had them (e.g. a noop-mode signup); treat as done.
    if (!res.ok && res.status !== 404) {
      const body = await res.text().catch(() => "");
      console.error("[unsubscribe:error]", res.status, body);
      return { ok: false, mode: "live" };
    }

    return { ok: true, mode: "live" };
  } catch (err) {
    console.error("[unsubscribe:exception]", err);
    return { ok: false, mode: "live" };
  }
}
