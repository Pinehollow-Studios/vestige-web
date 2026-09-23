import type { Metadata } from "next";
import { LinkLanding } from "@/components/LinkLanding";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Web fallback for `https://vestige.golf/society/join/<token>` - a
 * society invite link (CLAUDE.md §5.3). With Vestige installed, iOS
 * opens the app, which redeems the token and lands on the society.
 *
 * The token in the path is the society's `join_token` and is never
 * rendered or echoed here: it is a capability, not a label. The page
 * says only that an invite was sent. Societies are behind a feature
 * flag for beta 1, so in practice this page is dormant - it exists so
 * the invite link is never a 404 the day the flag flips.
 */

export const metadata: Metadata = {
  title: "A society invite",
  description: `You have been invited to a golf society on ${siteConfig.brandName}.`,
};

export default function SocietyJoinLinkPage() {
  return (
    <LinkLanding
      eyebrow="Society invite"
      headline="You have been invited"
      blurb={`Someone invited you to their golf society on ${siteConfig.brandName}. Open this link again once the app is installed and the invite will be waiting.`}
    />
  );
}
