import type { Metadata } from "next";
import { LinkLanding } from "@/components/LinkLanding";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Web fallback for `https://vestige.golf/society/join/<token>`, the old
 * society invite link. Societies were removed from the app on
 * 2026-09-23 (they return, rebuilt, in 2027), so no invite behind this
 * link can be redeemed any more. The route stays so an old link is never
 * a 404, but it says nothing about societies: it is the plain link
 * landing, one way into Vestige.
 *
 * The token in the path is never rendered or echoed here.
 */

export const metadata: Metadata = {
  title: "A link to Vestige",
  description: `${siteConfig.brandName}. ${siteConfig.tagline}`,
};

export default function SocietyJoinLinkPage() {
  return (
    <LinkLanding
      eyebrow={siteConfig.brandName}
      headline={siteConfig.tagline}
      blurb={siteConfig.description}
    />
  );
}
