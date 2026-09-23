import { siteConfig } from "@/lib/siteConfig";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { unsubscribeContact } from "@/lib/resend";

/**
 * One-click unsubscribe for the transactional welcome email.
 *
 * The welcome email carries a signed link, /unsubscribe?email=<e>&token=<hmac>
 * (minted in lib/unsubscribe.ts), in both its footer and its List-Unsubscribe
 * header. This handler:
 *
 *   GET  — verifies the token and shows a confirmation page with a button.
 *          GET never mutates, so corporate link-scanners / mail prefetchers
 *          that auto-follow links can't unsubscribe anyone by accident.
 *   POST — verifies the token and flips the Resend contact to unsubscribed.
 *          Serves both the confirmation-page form submit (human → HTML page)
 *          and RFC 8058 one-click (Gmail/Apple POST `List-Unsubscribe=One-Click`
 *          → bare 200). Both read email+token from the query string.
 */

// Reads request.url + mutates Resend — never prerender or cache it.
export const dynamic = "force-dynamic";

const { brandName, domain, contactEmail } = siteConfig;
const supportMailto = `mailto:${contactEmail}`;

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      // Defence in depth: this page is never meant to be framed.
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
    },
  });
}

/** Minimal on-brand shell. Self-contained — route handlers get no app CSS. */
function page(opts: {
  title: string;
  heading: string;
  body: string;
  /** Optional trailing HTML (e.g. a form or button). */
  action?: string;
}): string {
  const { title, heading, body, action } = opts;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${escapeHtml(title)} · ${escapeHtml(brandName)}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100dvh;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    background: #06090E; color: #F6F4EE;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .card {
    width: 100%; max-width: 460px;
    background: #0E1822; border: 1px solid rgba(255,255,255,0.10);
    border-radius: 16px; padding: 36px 32px;
  }
  .lockup { display: flex; align-items: center; gap: 10px; margin: 0 0 18px; }
  .lockup img { display: block; width: 26px; height: 26px; }
  .eyebrow {
    margin: 0; font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; color: #5BE4C3;
  }
  h1 {
    margin: 0; font-size: 27px; line-height: 1.15; font-weight: 500;
    letter-spacing: -0.4px;
    font-family: 'New York', Georgia, 'Times New Roman', serif;
  }
  p { margin: 16px 0 0; font-size: 15px; line-height: 1.6; color: #A8B3C0; }
  a { color: #5BE4C3; }
  .btn {
    appearance: none; cursor: pointer; margin-top: 24px;
    display: inline-block; border: 0; border-radius: 999px;
    background: #5BE4C3; color: #0A1A22;
    font-size: 15px; font-weight: 700; padding: 12px 22px;
    font-family: inherit;
  }
  .muted { display: inline-block; margin-top: 18px; font-size: 13px; color: #6E7A89; }
  .muted a { color: #9BA7B5; }
</style>
</head>
<body>
  <main class="card">
    <div class="lockup">
      <img src="/brand/vestige-globe.png" alt="" width="26" height="26" />
      <p class="eyebrow">${escapeHtml(brandName)}</p>
    </div>
    <h1>${escapeHtml(heading)}</h1>
    <p>${body}</p>
    ${action ?? ""}
  </main>
</body>
</html>`;
}

function confirmPage(email: string, token: string): string {
  const qs = new URLSearchParams({ email, token }).toString();
  return page({
    title: "Unsubscribe",
    heading: "Leaving the list?",
    body: `Tap below to stop the ${escapeHtml(
      brandName
    )} waiting-list emails to <strong style="color:#F3F0E5">${escapeHtml(
      email
    )}</strong>. You can always rejoin at ${escapeHtml(domain)}.`,
    action: `<form method="POST" action="/unsubscribe?${qs}">
      <button class="btn" type="submit">Unsubscribe</button>
    </form>
    <span class="muted"><a href="https://${escapeHtml(
      domain
    )}">No, keep me on the list →</a></span>`,
  });
}

function donePage(email: string): string {
  return page({
    title: "Unsubscribed",
    heading: "You're unsubscribed.",
    body: `We've removed <strong style="color:#F3F0E5">${escapeHtml(
      email
    )}</strong> from the ${escapeHtml(
      brandName
    )} waiting list. You won't hear from us again unless you join again at ${escapeHtml(
      domain
    )}.`,
    action: `<span class="muted"><a href="https://${escapeHtml(
      domain
    )}">Back to ${escapeHtml(brandName)} →</a></span>`,
  });
}

function invalidPage(): string {
  return page({
    title: "Link invalid",
    heading: "This link didn't check out.",
    body: `We couldn't verify this unsubscribe link. It may be incomplete or out of date. Email <a href="${supportMailto}">${escapeHtml(
      contactEmail
    )}</a> and we'll take you off the list straight away.`,
  });
}

function errorPage(): string {
  return page({
    title: "Something went wrong",
    heading: "That didn't go through.",
    body: `We couldn't update your preferences just now. Please email <a href="${supportMailto}">${escapeHtml(
      contactEmail
    )}</a> and we'll remove you by hand.`,
  });
}

function readParams(request: Request): { email: string; token: string | null } {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const token = searchParams.get("token");
  return { email, token };
}

export async function GET(request: Request): Promise<Response> {
  const { email, token } = readParams(request);
  if (!email || !verifyUnsubscribeToken(email, token)) {
    return htmlResponse(invalidPage(), 400);
  }
  return htmlResponse(confirmPage(email, token!));
}

export async function POST(request: Request): Promise<Response> {
  const { email, token } = readParams(request);

  // RFC 8058 one-click bodies are `List-Unsubscribe=One-Click`. Reading the body
  // tells a mail-client one-click POST (wants a bare 200) from a human form
  // submit (wants the styled page).
  const body = await request.text().catch(() => "");
  const oneClick = body.includes("List-Unsubscribe=One-Click");

  if (!email || !verifyUnsubscribeToken(email, token)) {
    return oneClick
      ? new Response("Invalid unsubscribe link.", { status: 400 })
      : htmlResponse(invalidPage(), 400);
  }

  const result = await unsubscribeContact(email);

  if (oneClick) {
    return new Response(result.ok ? "Unsubscribed." : "Unsubscribe failed.", {
      status: result.ok ? 200 : 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return result.ok
    ? htmlResponse(donePage(email))
    : htmlResponse(errorPage(), 502);
}
