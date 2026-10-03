/**
 * Resend: the 1.0 list (contacts in the waitlist segment), unsubscribes and
 * the welcome email. Ported from the Next site (legacy-next/src/lib/resend.ts,
 * email.tsx); behaviour unchanged.
 *
 * - A new contact gets `last_name` = its source tag (first touch wins); the
 *   contacts export is how sources are reconciled. Never use {{LAST_NAME}}
 *   in a broadcast.
 * - api.resend.com sits behind Cloudflare, which rejects requests without a
 *   real User-Agent; keep the header.
 */
import { getSecret } from "astro:env/server";
import { site } from "../../config/site";
import type { WaitlistSource } from "./sources";
import { unsubscribeUrl } from "./unsubscribe";
import { welcomeEmail } from "./welcome-email";

const RESEND_API = "https://api.resend.com";
const USER_AGENT = "vestige-web/2.0 (+https://vestige.golf)";

function headers(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "User-Agent": USER_AGENT,
  };
}

export type JoinResult =
  | { ok: true; mode: "live" | "noop"; isNew: boolean; rejoined: boolean }
  | { ok: false; error: string };

export async function addToList(email: string, source: WaitlistSource): Promise<JoinResult> {
  const apiKey = getSecret("RESEND_API_KEY");
  const segmentId = getSecret("RESEND_WAITLIST_SEGMENT_ID");
  if (!apiKey || !segmentId) {
    console.log("[list:noop]", `source=${source}`);
    return { ok: true, mode: "noop", isNew: true, rejoined: false };
  }
  try {
    let isNew = true;
    let rejoined = false;
    try {
      const existing = await fetch(`${RESEND_API}/contacts/${encodeURIComponent(email)}`, {
        headers: headers(apiKey),
      });
      if (existing.ok) {
        isNew = false;
        const body = (await existing.json().catch(() => null)) as { unsubscribed?: boolean } | null;
        rejoined = body?.unsubscribed === true;
      }
    } catch {
      /* a blip: treat as new */
    }
    const contact: Record<string, unknown> = { email, unsubscribed: false };
    if (isNew) contact.last_name = source;
    const created = await fetch(`${RESEND_API}/contacts`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify(contact),
    });
    if (!created.ok) {
      console.error("[list:create-error]", created.status, (await created.text()).slice(0, 300));
      return { ok: false, error: "We couldn’t save your email. Try again in a moment." };
    }
    const id = ((await created.json().catch(() => null)) as { id?: string } | null)?.id;
    if (id) {
      const seg = await fetch(`${RESEND_API}/contacts/${id}/segments/${segmentId}`, {
        method: "POST",
        headers: headers(apiKey),
      });
      if (!seg.ok) console.error("[list:segment-error]", seg.status, (await seg.text()).slice(0, 300));
    }
    return { ok: true, mode: "live", isNew, rejoined };
  } catch (err) {
    console.error("[list:exception]", err);
    return { ok: false, error: "Something went wrong. Try again in a moment." };
  }
}

export async function unsubscribeContact(email: string): Promise<boolean> {
  const apiKey = getSecret("RESEND_API_KEY");
  if (!apiKey) return true;
  try {
    const res = await fetch(`${RESEND_API}/contacts/${encodeURIComponent(email.trim().toLowerCase())}`, {
      method: "PATCH",
      headers: headers(apiKey),
      body: JSON.stringify({ unsubscribed: true }),
    });
    if (!res.ok && res.status !== 404) {
      console.error("[unsubscribe:error]", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[unsubscribe:exception]", err);
    return false;
  }
}

/** The welcome email; failures are logged, never thrown. */
export async function sendWelcomeEmail(email: string): Promise<void> {
  const apiKey = getSecret("RESEND_API_KEY");
  if (!apiKey) return;
  try {
    const unsub = await unsubscribeUrl(email);
    const { html, text } = welcomeEmail(unsub);
    const res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify({
        from: `${site.name} <hello@${site.domain}>`,
        to: email,
        reply_to: site.email.hello,
        subject: `Welcome to ${site.name}: you’re on the list`,
        html,
        text,
        headers: unsub
          ? {
              "List-Unsubscribe": `<${unsub}>, <mailto:${site.email.hello}?subject=Unsubscribe>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            }
          : { "List-Unsubscribe": `<mailto:${site.email.hello}?subject=Unsubscribe>` },
      }),
    });
    if (!res.ok) console.error("[welcome:error]", res.status, (await res.text()).slice(0, 300));
  } catch (err) {
    console.error("[welcome:exception]", err);
  }
}

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/**
 * Send one transactional email (club claims and the like). Returns false on
 * any failure, logged; never throws. Without a key (local dev) it logs the
 * email instead, so the flow can be followed end to end.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const apiKey = getSecret("RESEND_API_KEY");
  if (!apiKey) {
    console.log("[email:noop]", JSON.stringify({ to: email.to, subject: email.subject }), "\n" + email.text);
    return true;
  }
  try {
    const res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: headers(apiKey),
      body: JSON.stringify({
        from: `${site.name} <hello@${site.domain}>`,
        to: email.to,
        reply_to: email.replyTo ?? site.email.hello,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    if (!res.ok) {
      console.error("[email:error]", res.status, (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email:exception]", err);
    return false;
  }
}
