import "server-only";
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/welcome";
import { siteConfig } from "@/lib/siteConfig";
import { unsubscribeUrl } from "@/lib/unsubscribe";

/**
 * Transactional email sends. Renders a React Email template to HTML + text at
 * call time and posts it to Resend. Self-contained error handling: a failed
 * send is logged but never thrown, so it can't break the signup it follows.
 */

const RESEND_API = "https://api.resend.com";
// Cloudflare fronts api.resend.com and 403s bot-like User-Agents. (See resend.ts.)
const USER_AGENT = "vestige-web/1.0 (+https://vestige.golf)";

export async function sendWelcomeEmail(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // dev/no-key: silently skip

  try {
    // Per-recipient signed one-click unsubscribe link (see lib/unsubscribe.ts).
    // Always present here — sendWelcomeEmail and unsubscribeUrl share the same
    // key fallback — but guarded so a misconfig degrades to the mailto instead
    // of advertising a one-click header we can't honour.
    const unsub = unsubscribeUrl(email);

    const [html, text] = await Promise.all([
      render(<WelcomeEmail unsubscribeUrl={unsub ?? undefined} />),
      render(<WelcomeEmail unsubscribeUrl={unsub ?? undefined} />, {
        plainText: true,
      }),
    ]);

    // List-Unsubscribe powers the mail client's native unsubscribe button.
    // With a signed URL we also send List-Unsubscribe-Post for RFC 8058
    // one-click (Gmail/Apple POST it and we unsubscribe with no further click).
    const unsubHeaders: Record<string, string> = unsub
      ? {
          "List-Unsubscribe": `<${unsub}>, <mailto:${siteConfig.contactEmail}?subject=Unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      : {
          "List-Unsubscribe": `<mailto:${siteConfig.contactEmail}?subject=Unsubscribe>`,
        };

    const res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        from: `${siteConfig.brandName} <hello@${siteConfig.domain}>`,
        to: email,
        reply_to: siteConfig.contactEmail,
        subject: `You're on the list — welcome to ${siteConfig.brandName}`,
        html,
        text,
        headers: unsubHeaders,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[welcome-email:error]", res.status, body);
    }
  } catch (err) {
    console.error("[welcome-email:exception]", err);
  }
}
