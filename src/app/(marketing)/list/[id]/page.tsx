import type { Metadata } from "next";
import { LinkLanding } from "@/components/LinkLanding";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Web fallback for `https://vestige.golf/list/<uuid>` - the link the
 * app's list-share action produces, for both a user's own list and a
 * curated collection (CLAUDE.md §5.3). With Vestige installed, iOS
 * opens the list and this never renders.
 *
 * Deliberately unnamed. A user list's title is content its author
 * wrote, and a shared link gets logged by the CDN and can be indexed;
 * putting the title in the URL would leak it to anyone who never opened
 * the app. Whether the viewer may see the list at all is the app's call
 * (RLS), not this page's - so this page shows nothing but the way in.
 */

export const metadata: Metadata = {
  title: "A collection",
  description: `Someone shared a collection of golf courses on ${siteConfig.brandName}.`,
};

export default function ListLinkPage() {
  return (
    <LinkLanding
      eyebrow="Collection"
      headline="A collection of courses"
      blurb={`Someone shared a list of golf courses with you on ${siteConfig.brandName}. ${siteConfig.tagline}`}
    />
  );
}
