import type { APIRoute } from "astro";
import { addToList, sendWelcomeEmail } from "../../lib/server/resend";
import { normalizeSource } from "../../lib/server/sources";
import { mirrorToDb } from "../../lib/server/waitlist-db";

/**
 * The 1.0 list signup. Posted by the signup form (Signup.astro): with
 * JavaScript as a fetch (JSON back), without it as a plain form post (a
 * redirect back to the page). New contacts, and returning ones who had
 * unsubscribed, get the welcome email.
 */
export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, url }) => {
  // Only this site's own form may sign people up: a browser always sends
  // Origin on a POST, and a different one means another site's form.
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) {
    return new Response("Forbidden.", { status: 403 });
  }

  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  const form = await request.formData().catch(() => null);
  const email = String(form?.get("email") ?? "").trim().toLowerCase();
  const honeypot = String(form?.get("website") ?? "");
  const source = normalizeSource(form?.get("source"));

  const reply = (status: number, body: Record<string, unknown>) =>
    wantsJson
      ? Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
      : new Response(null, {
          status: 303,
          headers: { Location: body.ok ? "/?joined=1#notify" : "/?joined=0#notify" },
        });

  // A bot filled the hidden field: say yes, do nothing.
  if (honeypot) return reply(200, { ok: true });
  if (!email || email.length > 254 || !EMAIL.test(email)) {
    return reply(400, { ok: false, error: "That doesn’t look like an email address." });
  }

  const result = await addToList(email, source);
  if (!result.ok) return reply(502, { ok: false, error: result.error });

  await mirrorToDb(email, source);
  if (result.mode === "live" && (result.isNew || result.rejoined)) {
    await sendWelcomeEmail(email);
  }
  return reply(200, { ok: true });
};
