import "server-only";

import type { WaitlistSource } from "@/lib/sources";

/**
 * Mirror waitlist signups into our own Supabase (`waitlist_subscribers`), so the
 * list is owned + sendable + measurable from the bunker — not only living inside
 * Resend. This runs *alongside* addToWaitlist (Resend), never instead of it.
 *
 * It calls the anon-granted `subscribe_to_waitlist(p_email, p_source, p_first_name)`
 * RPC over plain REST (no @supabase/supabase-js dependency needed). The RPC is
 * idempotent and reactivates a previously-unsubscribed email.
 *
 * Best-effort by design: any failure is logged and swallowed. A signup must
 * still succeed for the user even if this mirror write blips — Resend remains the
 * primary capture. Points at PROD (the live app's Supabase).
 *
 * Env (server-only, set in Vercel):
 *   SUPABASE_URL          e.g. https://ujbnupjrbroskzwaeulj.supabase.co
 *   SUPABASE_ANON_KEY     the prod anon (public) key
 * Until both are set this is a logged no-op.
 */
export async function mirrorWaitlistToDb(
  email: string,
  source: WaitlistSource = "organic"
): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.log("[waitlist-db:noop]", email, `source=${source}`);
    return;
  }

  try {
    const res = await fetch(`${url}/rest/v1/rpc/subscribe_to_waitlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ p_email: email, p_source: source, p_first_name: null }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[waitlist-db:error]", res.status, body.slice(0, 300));
    }
  } catch (err) {
    console.error("[waitlist-db:exception]", err);
  }
}
