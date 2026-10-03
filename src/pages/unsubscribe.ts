import type { APIRoute } from "astro";
import { site } from "../config/site";
import { unsubscribeContact } from "../lib/server/resend";
import { verifyUnsubscribeToken } from "../lib/server/unsubscribe";

/**
 * One-click unsubscribe for the welcome email's signed links.
 *   GET  - verifies the token and shows a confirm button (never mutates, so
 *          mail scanners that follow links can't unsubscribe anyone).
 *   POST - verifies and unsubscribes: a human form submit gets a page, an
 *          RFC 8058 one-click POST (Gmail, Apple Mail) gets a bare 200.
 */
export const prerender = false;

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const support = `<a href="mailto:${site.email.hello}">${site.email.hello}</a>`;

function page(title: string, heading: string, body: string, action = "", status = 200): Response {
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escape(title)} · ${site.name}</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;background:#f2f5fa;color:#0b0f14;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:460px;background:#fff;border-radius:20px;box-shadow:inset 0 0 0 1px rgb(31 58 95/.1);padding:32px 28px}
.lockup{display:flex;align-items:center;gap:8px;margin:0 0 20px;font-weight:600;font-size:18px}.lockup img{width:28px;height:28px}
h1{margin:0;font-size:26px;line-height:1.15;font-weight:600;letter-spacing:-.01em}p{margin:14px 0 0;font-size:16px;line-height:1.6;color:#4a5662}a{color:#0faf88}
button{margin-top:22px;border:0;border-radius:20px;min-height:52px;padding:0 24px;background:#14cca0;color:#06231c;font:inherit;font-size:16px;font-weight:600;cursor:pointer}
.muted{display:block;margin-top:16px;font-size:14px}.muted a{color:#4a5662}
</style></head><body><main><div class="lockup"><img src="/brand/vestige-globe-256.png" alt="">${site.name}</div><h1>${escape(heading)}</h1><p>${body}</p>${action}</main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
    },
  });
}

function params(request: Request) {
  const { searchParams } = new URL(request.url);
  return {
    email: (searchParams.get("email") ?? "").trim().toLowerCase(),
    token: searchParams.get("token"),
  };
}

const invalid = () =>
  page(
    "Link invalid",
    "This link didn’t check out.",
    `We couldn’t verify this unsubscribe link. It may be incomplete or out of date. Email ${support} and we’ll take you off the list straight away.`,
    "",
    400
  );

export const GET: APIRoute = async ({ request }) => {
  const { email, token } = params(request);
  if (!email || !(await verifyUnsubscribeToken(email, token))) return invalid();
  const qs = new URLSearchParams({ email, token: token! }).toString();
  return page(
    "Unsubscribe",
    "Leaving the list?",
    `Tap below to stop ${site.name} emails to <strong>${escape(email)}</strong>. You can always sign up again at ${site.domain}.`,
    `<form method="post" action="/unsubscribe?${escape(qs)}"><button type="submit">Unsubscribe</button></form><span class="muted"><a href="/">No, keep me on the list</a></span>`
  );
};

export const POST: APIRoute = async ({ request }) => {
  const { email, token } = params(request);
  const body = await request.text().catch(() => "");
  const oneClick = body.includes("List-Unsubscribe=One-Click");
  const valid = !!email && (await verifyUnsubscribeToken(email, token));
  if (!valid) return oneClick ? new Response("Invalid unsubscribe link.", { status: 400 }) : invalid();

  const ok = await unsubscribeContact(email);
  if (oneClick) {
    return new Response(ok ? "Unsubscribed." : "Unsubscribe failed.", {
      status: ok ? 200 : 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
  return ok
    ? page(
        "Unsubscribed",
        "You’re unsubscribed.",
        `We’ve taken <strong>${escape(email)}</strong> off the ${site.name} list. You won’t hear from us again unless you sign up again at ${site.domain}.`,
        `<span class="muted"><a href="/">Back to ${site.name}</a></span>`
      )
    : page(
        "Something went wrong",
        "That didn’t go through.",
        `We couldn’t update your preferences just now. Email ${support} and we’ll remove you by hand.`,
        "",
        502
      );
};
