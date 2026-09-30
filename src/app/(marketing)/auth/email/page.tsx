import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { StickyNav } from "@/components/marketing/StickyNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";

/**
 * /auth/email - where a link in an account email lands when it has no app
 * redirect of its own: the two "change your email" links (Settings › Account ›
 * Change email), which Supabase sends to the Site URL, vestige.golf.
 *
 * Supabase appends what happened to that URL - a message after the first of
 * the two links, an auth code after the second, an error for a spent or
 * expired link - and until 2026-09-30 the reader landed on the marketing
 * homepage with none of it explained. `AuthLinkCatcher` on the homepage reads
 * those parameters, drops them (the code and any token never stay in the
 * address bar), and sends the reader here with one word: `s`.
 *
 * Not in the apple-app-site-association: this page is for the browser the link
 * opened in, and it must render there.
 */

export const metadata: Metadata = {
  title: "Email address",
  robots: { index: false, follow: false },
};

const STATES = {
  partial: {
    heading: "One link down.",
    body: "Now open the link we sent to your other address. Your email changes once both are opened, in either order.",
  },
  done: {
    heading: "Your email is changed.",
    body: `Head back to ${siteConfig.brandName} - the app picks up the new address on its own. We've sent a note to your old address to say so.`,
  },
  error: {
    heading: "That link didn't work.",
    body: `It may have been used already, or it expired. In ${siteConfig.brandName}, go to Settings › Account › Change email and send new links.`,
  },
} as const;

type State = keyof typeof STATES;

export default async function AuthEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s } = await searchParams;
  const state: State = s === "partial" || s === "error" ? s : "done";
  const { heading, body } = STATES[state];

  return (
    <div className="fw-root">
      <div className="fw-ambient" aria-hidden="true" />
      <StickyNav />
      <main className="fw-app-main">
        <section className="fw-app-hero" aria-label="Email address">
          <h1
            style={{
              fontSize: "clamp(34px, 8vw, 56px)",
              lineHeight: 1.05,
              letterSpacing: "-1.2px",
              fontWeight: 500,
              margin: 0,
            }}
          >
            {heading}
          </h1>
          <p className="fw-lede">{body}</p>
          <p className="fw-lede" style={{ fontSize: 15 }}>
            Something not right? Email{" "}
            <Link href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
