/**
 * Mirror a signup into Supabase (`subscribe_to_waitlist`, anon-granted and
 * idempotent) so the list is owned and visible from the bunker, not only in
 * Resend. Best-effort: failures are logged and never block the signup.
 */
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "astro:env/server";
import type { WaitlistSource } from "./sources";

export async function mirrorToDb(email: string, source: WaitlistSource): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/subscribe_to_waitlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_email: email, p_source: source, p_first_name: null }),
    });
    if (!res.ok) console.error("[list-db:error]", res.status, (await res.text()).slice(0, 300));
  } catch (err) {
    console.error("[list-db:exception]", err);
  }
}
