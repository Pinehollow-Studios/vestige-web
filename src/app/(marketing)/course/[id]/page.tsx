import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { LinkLanding, cleanNameHint } from "@/components/LinkLanding";
import { siteConfig } from "@/lib/siteConfig";
import { DIRECTORY_INDEXABLE } from "@/lib/directory/config";
import { isUuid, slugForCourseId } from "@/lib/directory/lookup";

/**
 * Web fallback for `https://vestige.golf/course/<uuid>` - the link the
 * app's course-share button produces (CLAUDE.md §5.2). With Vestige
 * installed, iOS opens the course spotlight and this never renders.
 *
 * The course id in the path is a UUID, which says nothing to a human,
 * so the app appends `?n=<course name>` - editorial, public data. The
 * name is display-only; the app does the real id -> course resolution
 * on its side.
 *
 * Once the course directory is live (DIRECTORY_INDEXABLE), a uuid that
 * resolves to a course 308s to its permanent page, `/courses/<slug>`. Any
 * miss - the switch off, not a uuid, an unknown course, the lookup failing
 * or not on this project yet - renders exactly the landing page below.
 */

type Params = Promise<{ id: string }>;
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
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  if (DIRECTORY_INDEXABLE) {
    const { id } = await params;
    // slugForCourseId never throws; the redirect sits outside any try.
    const slug = isUuid(id) ? await slugForCourseId(id) : null;
    if (slug) permanentRedirect(`/courses/${slug}`);
  }

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
