import type { Metadata } from "next";
import { LinkLanding, cleanNameHint } from "@/components/LinkLanding";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Web fallback for `https://vestige.golf/course/<uuid>` - the link the
 * app's course-share button produces (CLAUDE.md §5.2). With Vestige
 * installed, iOS opens the course spotlight and this never renders.
 *
 * The course id in the path is a UUID, which says nothing to a human,
 * so the app appends `?n=<course name>` - editorial, public data. The
 * name is display-only; the app does the real id -> course resolution
 * on its side.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const name = cleanNameHint((await searchParams).n);
  return {
    title: name ?? "A course",
    description: name
      ? `${name} is on ${siteConfig.brandName}.`
      : `This course is on ${siteConfig.brandName}.`,
  };
}

export default async function CourseLinkPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const name = cleanNameHint((await searchParams).n);

  return (
    <LinkLanding
      eyebrow="Course"
      headline={name ?? "A course on Vestige"}
      blurb={
        name
          ? `${name} is one of the courses on ${siteConfig.brandName}. ${siteConfig.tagline}`
          : `This course is on ${siteConfig.brandName}. ${siteConfig.tagline}`
      }
    />
  );
}
