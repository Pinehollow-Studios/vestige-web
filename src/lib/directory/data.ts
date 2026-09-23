import "server-only";

import { cache } from "react";
import { readAllRows, readView } from "./source";
import {
  COURSE_SUMMARY_COLUMNS,
  type CourseSummary,
  type DirectoryCounty,
  type DirectoryCourse,
  type DirectoryList,
} from "./types";

/**
 * The directory's reads. Each is wrapped in React's `cache` so a page that
 * asks twice in one render (generateMetadata + the page) decodes once; the
 * `fetch` underneath is memoised and data-cached by Next as well.
 *
 * Tags - the names phase 2's webhook revalidates:
 *   courses          everything; the umbrella tag on every read
 *   course:<slug>    one course's full row
 *   county:<slug>    a county's row and its course listing
 *   list:<slug>      a list's row and its course listing
 */

const SUMMARY_SELECT = COURSE_SUMMARY_COLUMNS.join(",");

/** Every course, slim columns, in slug order - the static params and the nearby sum. */
export const getAllCourseSummaries = cache(async (): Promise<CourseSummary[]> => {
  const query = new URLSearchParams({ select: SUMMARY_SELECT, order: "slug.asc" });
  return readAllRows<CourseSummary>("web_directory_courses", query, ["courses"]);
});

/** One course's full row, or null when no course has that slug. */
export const getCourse = cache(async (slug: string): Promise<DirectoryCourse | null> => {
  const query = new URLSearchParams({ select: "*", slug: `eq.${slug}`, limit: "1" });
  const rows = await readView<DirectoryCourse>("web_directory_courses", query, [
    "courses",
    `course:${slug}`,
  ]);
  return rows[0] ?? null;
});

export const getAllCounties = cache(async (): Promise<DirectoryCounty[]> => {
  const query = new URLSearchParams({ select: "*", order: "name.asc" });
  return readAllRows<DirectoryCounty>("web_directory_counties", query, ["courses"]);
});

export const getCounty = cache(async (slug: string): Promise<DirectoryCounty | null> => {
  const query = new URLSearchParams({ select: "*", slug: `eq.${slug}`, limit: "1" });
  const rows = await readView<DirectoryCounty>("web_directory_counties", query, [
    "courses",
    `county:${slug}`,
  ]);
  return rows[0] ?? null;
});

/** A county's courses, read by the county's own tag so an edit there refreshes the page. */
export const getCountyCourses = cache(async (slug: string): Promise<CourseSummary[]> => {
  const query = new URLSearchParams({
    select: SUMMARY_SELECT,
    county_slug: `eq.${slug}`,
    order: "slug.asc",
  });
  return readAllRows<CourseSummary>("web_directory_courses", query, [
    "courses",
    `county:${slug}`,
  ]);
});

export const getAllLists = cache(async (): Promise<DirectoryList[]> => {
  const query = new URLSearchParams({ select: "*", order: "name.asc" });
  return readAllRows<DirectoryList>("web_directory_lists", query, ["courses"]);
});

export const getList = cache(async (slug: string): Promise<DirectoryList | null> => {
  const query = new URLSearchParams({ select: "*", slug: `eq.${slug}`, limit: "1" });
  const rows = await readView<DirectoryList>("web_directory_lists", query, [
    "courses",
    `list:${slug}`,
  ]);
  return rows[0] ?? null;
});

/**
 * A list's courses in list order. Membership lives in each course's `lists`
 * jsonb, so this is PostgREST's jsonb "contains" filter; the position comes
 * off the same membership entry.
 */
export const getListCourses = cache(
  async (slug: string): Promise<Array<CourseSummary & { position: number }>> => {
    const query = new URLSearchParams({
      select: SUMMARY_SELECT,
      lists: `cs.${JSON.stringify([{ slug }])}`,
      order: "slug.asc",
    });
    const rows = await readAllRows<CourseSummary>("web_directory_courses", query, [
      "courses",
      `list:${slug}`,
    ]);
    return rows
      .map((course) => ({
        ...course,
        position: course.lists.find((l) => l.slug === slug)?.position ?? Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, "en-GB"));
  }
);
