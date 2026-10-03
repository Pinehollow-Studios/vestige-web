import type { MetadataRoute } from "next";
import { getAllCounties, getAllLists, getCourseStamps } from "@/lib/directory/data";
import { isSlug, latest, styleSlug } from "@/lib/directory/format";
import { absoluteUrl } from "@/lib/directory/config";

/**
 * The directory's own sitemap, served at `/courses/sitemap.xml` (a nested
 * `sitemap.ts` is served under its segment; the `(directory)` route group
 * adds nothing to the path). The front door, every style, course, county
 * and list, each with `lastModified` from the views' `updated_at` - Google
 * uses lastmod only when it is accurate, and ignores priority and
 * changefreq, so neither is set. About 1,870 URLs, well inside one file.
 *
 * robots.ts lists this file only once DIRECTORY_INDEXABLE is true. Cached
 * like the pages: tagged `courses` by its reads, a daily backstop. If the
 * data can't be read (the views aren't on prod yet) it lists the front
 * door alone rather than failing the build.
 */

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [courses, counties, lists] = await Promise.all([
      getCourseStamps(),
      getAllCounties(),
      getAllLists(),
    ]);

    const byStyle = new Map<string, string[]>();
    for (const c of courses) {
      if (!c.style) continue;
      const slug = styleSlug(c.style);
      byStyle.set(slug, [...(byStyle.get(slug) ?? []), c.updated_at]);
    }

    const frontDoor = latest([
      ...courses.map((c) => c.updated_at),
      ...counties.map((c) => c.updated_at),
      ...lists.map((l) => l.updated_at),
    ]);

    return [
      { url: absoluteUrl("/courses"), lastModified: frontDoor },
      ...[...byStyle.entries()]
        .filter(([slug]) => isSlug(slug))
        .map(([slug, stamps]) => ({
          url: absoluteUrl(`/courses/style/${slug}`),
          lastModified: latest(stamps),
        })),
      ...counties
        .filter((c) => c.course_count > 0)
        .map((c) => ({
          url: absoluteUrl(`/courses/county/${c.slug}`),
          lastModified: c.updated_at,
        })),
      ...lists.map((l) => ({
        url: absoluteUrl(`/courses/list/${l.slug}`),
        lastModified: l.updated_at,
      })),
      ...courses.map((c) => ({
        url: absoluteUrl(`/courses/${c.slug}`),
        lastModified: c.updated_at,
      })),
    ];
  } catch (err) {
    console.warn("[directory] sitemap data unavailable:", (err as Error).message);
    return [{ url: absoluteUrl("/courses") }];
  }
}
