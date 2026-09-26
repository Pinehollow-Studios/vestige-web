import type { Metadata } from "next";
import { LinkLanding } from "@/components/LinkLanding";
import { BETA_LINK_SENT, TESTFLIGHT_PUBLIC_URL, siteConfig } from "@/lib/siteConfig";

/**
 * Web fallback for the `https://vestige.golf/u/<username>` universal
 * link (CLAUDE.md §10.1). When the Vestige app is installed, iOS opens
 * the app straight to the profile and this page never renders.
 * Otherwise the link lands here: a graceful "@username is on Vestige"
 * card pointing at the waiting list (pre-launch) or the App Store. Once
 * the public beta link has gone out (BETA_LINK_SENT with
 * TESTFLIGHT_PUBLIC_URL set, flipped by hand in siteConfig), the card
 * points at TestFlight instead, until the App Store listing takes over.
 *
 * The chrome is `LinkLanding`, shared with the course / list / society
 * fallbacks so the four cannot drift apart (share audit, 2026-08-30).
 */

type Params = { username: string };

/**
 * Strip a stray leading `@` and cap length defensively. This value is
 * only ever rendered as text — never trusted for a lookup (the app does
 * the real username → profile resolution on its side).
 */
function cleanUsername(raw: string): string {
  return decodeURIComponent(raw).replace(/^@+/, "").slice(0, 40);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  const handle = cleanUsername(username);
  return {
    title: `@${handle}`,
    description: `@${handle} is keeping their golf collection on ${siteConfig.brandName}.`,
  };
}

export default async function ProfileInvitePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  const handle = cleanUsername(username);
  const testFlight =
    BETA_LINK_SENT && TESTFLIGHT_PUBLIC_URL !== "" && siteConfig.appStoreUrl === null;

  return (
    <LinkLanding
      eyebrow={siteConfig.brandName}
      headline={`@${handle}`}
      blurb={`is keeping their golf collection on ${siteConfig.brandName}. ${siteConfig.tagline}`}
      cta={
        testFlight
          ? {
              href: TESTFLIGHT_PUBLIC_URL,
              label: "Get the beta on TestFlight",
              note: `${siteConfig.brandName} is in beta. It needs an iPhone on iOS 26 or later and Apple’s free TestFlight app. Once it’s installed, open this link again to go straight to @${handle}.`,
            }
          : undefined
      }
    />
  );
}
