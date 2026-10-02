import "server-only";

import { siteConfig } from "@/lib/siteConfig";
import { getAllCounties, getAllLists } from "./data";
import { readView } from "./source";
import type { DirectoryCounty, DirectoryList } from "./types";

/**
 * What the marketing pages (dark, `(marketing)`) read from the course
 * directory to link into it: the homepage's courses section, the marquee's
 * course links and the /progress map's county links.
 *
 * Every read here is optional to the page that asks. A failure, or a
 * deployment without directory env (Preview today), returns null, and the
 * page renders as it did before the directory existed: no section, plain
 * marquee names, an unlinked map. The marketing pages must never go down
 * because the directory can't be reached.
 */

/** The homepage's courses section: the counts and the ways in. */
export type DirectoryOverview = {
  courses: number;
  counties: DirectoryCounty[];
  lists: DirectoryList[];
};

export async function getDirectoryOverview(): Promise<DirectoryOverview | null> {
  try {
    const [counties, lists] = await Promise.all([getAllCounties(), getAllLists()]);
    const courses = counties.reduce((sum, c) => sum + c.course_count, 0);
    if (courses === 0) return null;
    return { courses, counties, lists };
  } catch (err) {
    console.error("[directory:overview]", err);
    return null;
  }
}

/**
 * The marquee's links, name -> slug, for the slugs in siteConfig.marquee
 * that resolve to a course. One small read (`slug=in.(...)`) rather than
 * the whole course list. A configured slug that doesn't resolve is logged
 * and left out, so it renders as plain text instead of a dead link.
 */
export async function getMarqueeLinks(): Promise<Record<string, string> | null> {
  const wanted = siteConfig.marquee.flatMap((m) => (m.slug ? [m] : []));
  if (wanted.length === 0) return {};
  try {
    const query = new URLSearchParams({
      select: "slug",
      slug: `in.(${wanted.map((m) => m.slug).join(",")})`,
    });
    const rows = await readView<{ slug: string }>("web_directory_courses", query, ["courses"]);
    const found = new Set(rows.map((r) => r.slug));
    const links: Record<string, string> = {};
    for (const m of wanted) {
      if (m.slug && found.has(m.slug)) links[m.name] = m.slug;
      else console.error(`[directory:marquee] no course with slug "${m.slug}" (${m.name})`);
    }
    return links;
  } catch (err) {
    console.error("[directory:marquee]", err);
    return null;
  }
}

/**
 * The progress map's county names that differ from the directory's. The
 * map's 47 shapes come from ONS boundaries; the directory's counties from
 * the app's data. Everything else matches exactly.
 */
const MAP_TO_DIRECTORY_COUNTY: Record<string, string> = {
  "County Durham": "Durham",
};

/**
 * County page links for the /progress map, keyed by the map's own county
 * names (counties.ts): name -> `/courses/county/<slug>`. A map county with
 * no directory match is logged and left unlinked.
 */
export async function getCountyHrefs(
  mapNames: readonly string[]
): Promise<Record<string, string> | null> {
  try {
    const counties = await getAllCounties();
    const byName = new Map(counties.map((c) => [c.name, c.slug]));
    const hrefs: Record<string, string> = {};
    for (const name of mapNames) {
      const slug = byName.get(MAP_TO_DIRECTORY_COUNTY[name] ?? name);
      if (slug) hrefs[name] = `/courses/county/${slug}`;
      else console.error(`[directory:counties] no directory county for map county "${name}"`);
    }
    return hrefs;
  } catch (err) {
    console.error("[directory:counties]", err);
    return null;
  }
}
