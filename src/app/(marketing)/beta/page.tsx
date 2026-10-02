import type { Metadata } from "next";
import { LinkLanding } from "@/components/LinkLanding";
import { TESTFLIGHT_PUBLIC_URL, siteConfig } from "@/lib/siteConfig";

/**
 * `vestige.golf/beta` - the link Tom texts to people, so a forwarded
 * invite arrives as a Vestige preview card (this folder's
 * opengraph-image.tsx) rather than TestFlight's generic one. One tap
 * here goes to the public TestFlight link. Since 2 Oct 2026 this is the
 * only page on the site that offers TestFlight.
 *
 * Shared by hand, never advertised: not in the sitemap and noindex,
 * because the testers are asked not to post the link publicly
 * (2026-09-26). Once the App Store listing is live (or the TestFlight
 * link is cleared) the page falls back to LinkLanding's own way in,
 * so a link sent today never dead-ends.
 */

const title = `The ${siteConfig.brandName} beta is open`;
const description =
  "Mark the golf courses you’ve played and watch your map fill in. Free on iPhone, iOS 26 or later.";

export const metadata: Metadata = {
  title: "Join the beta",
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    url: `https://${siteConfig.domain}/beta`,
    siteName: siteConfig.brandName,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function BetaInvitePage() {
  const testFlight =
    TESTFLIGHT_PUBLIC_URL !== "" && siteConfig.appStoreUrl === null;

  return (
    <LinkLanding
      eyebrow="Public beta"
      headline="How many have you played?"
      blurb={`${siteConfig.brandName} keeps every golf course you’ve played on one map, and shows how your collection compares with your friends’.`}
      cta={
        testFlight
          ? {
              href: TESTFLIGHT_PUBLIC_URL,
              label: "Get the beta on TestFlight",
              note: "It needs an iPhone on iOS 26 or later and Apple’s free TestFlight app. Places are limited.",
            }
          : undefined
      }
    />
  );
}
