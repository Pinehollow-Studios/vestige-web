import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { inter, manrope } from "./fonts";
import "./(marketing)/marketing.css";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The 404 for every URL that matches no route at all. The app has two root
 * layouts - `(marketing)` and `(directory)` - so there is no single layout
 * a root `not-found.tsx` could render inside; Next's `global-not-found`
 * (enabled by `experimental.globalNotFound` in next.config.ts) is the
 * documented answer for that case. It bypasses every layout, so it loads
 * the marketing stylesheet and fonts itself and returns the whole document.
 *
 * Styled to match the privacy page's quiet, dark register - the same page
 * the site served for a missing URL before the route groups. A `notFound()`
 * thrown inside the course directory renders the directory's own
 * not-found instead, in the reader's light / dark.
 */

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: `Page not found · ${siteConfig.brandName}`,
  description: `That page doesn't exist on ${siteConfig.domain}.`,
};

export const viewport: Viewport = {
  themeColor: "#06090E",
};

export default function GlobalNotFound() {
  const { brandName } = siteConfig;

  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${manrope.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <main
          style={{
            minHeight: "100dvh",
            background: "#06090E",
            color: "#F6F4EE",
            fontFamily: "var(--font-ui)",
            WebkitFontSmoothing: "antialiased",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ maxWidth: 560, padding: "48px 24px 96px", textAlign: "center" }}>
            <Image
              src="/brand/vestige-globe.png"
              alt=""
              aria-hidden="true"
              width={64}
              height={64}
              priority
              style={{ display: "block", width: 64, height: 64, margin: "0 auto 26px" }}
            />

            <p
              style={{
                fontSize: 13,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#5BE4C3",
                margin: 0,
              }}
            >
              404
            </p>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px, 7vw, 64px)",
                fontWeight: 500,
                letterSpacing: "-2px",
                lineHeight: 1.05,
                margin: "18px 0 0",
              }}
            >
              This page doesn&rsquo;t exist
            </h1>

            <p
              style={{
                fontSize: 16,
                lineHeight: 1.72,
                color: "#A8B3C0",
                margin: "20px 0 0",
              }}
            >
              Whatever you were looking for isn&rsquo;t here. It may have moved, or the
              address may be mistyped. The rest of {brandName} is where it
              should be.
            </p>

            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: 36,
                padding: "12px 24px",
                borderRadius: 999,
                border: "1px solid rgba(91,228,195,0.35)",
                color: "#5BE4C3",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ← Back to {brandName}
            </Link>
          </div>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
