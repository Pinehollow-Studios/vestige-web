/**
 * The course directory's data, read at BUILD time from the public Supabase
 * views (web_directory_courses / _counties / _lists) and held in memory, so
 * every directory page is prerendered from one read and no visitor request
 * ever touches the database.
 *
 * Env (build): DIRECTORY_SUPABASE_URL + DIRECTORY_SUPABASE_ANON_KEY if set
 * (local dev against the dev project), else SUPABASE_URL +
 * SUPABASE_ANON_KEY (production; public values in .env.production).
 */
import type { CourseSummary, DirectoryCounty, DirectoryCourse, DirectoryList } from "./types";

export type Directory = {
  courses: DirectoryCourse[];
  counties: DirectoryCounty[];
  lists: DirectoryList[];
};

function source(): { url: string; key: string } {
  const url = process.env.DIRECTORY_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.DIRECTORY_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("The course directory has no data source: set SUPABASE_URL and SUPABASE_ANON_KEY.");
  }
  return { url: url.replace(/\/+$/, ""), key };
}

async function readAll<T>(view: string, query: Record<string, string>): Promise<T[]> {
  const { url, key } = source();
  const rows: T[] = [];
  for (;;) {
    const qs = new URLSearchParams({ ...query, limit: "1000", offset: String(rows.length) });
    const res = await fetch(`${url}/rest/v1/${view}?${qs}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Reading ${view} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    }
    const batch = (await res.json()) as T[];
    if (batch.length === 0) return rows;
    rows.push(...batch);
    if (rows.length > 20000) throw new Error(`Reading ${view} did not end after 20,000 rows.`);
  }
}

let loaded: Promise<Directory> | null = null;

/** Everything, read once per build. */
export function loadDirectory(): Promise<Directory> {
  loaded ??= Promise.all([
    readAll<DirectoryCourse>("web_directory_courses", { select: "*", order: "slug.asc" }),
    readAll<DirectoryCounty>("web_directory_counties", { select: "*", order: "name.asc" }),
    readAll<DirectoryList>("web_directory_lists", { select: "*", order: "name.asc" }),
  ]).then(([courses, counties, lists]) => ({ courses, counties, lists }));
  return loaded;
}

/** The slim summary of a course, for listings and the nearby sum. */
export function summary(c: DirectoryCourse): CourseSummary {
  const { slug, name, county_name, county_slug, course_type, hole_count, style, tier, lat, lng, vestige_index, lists } = c;
  return { slug, name, county_name, county_slug, course_type, hole_count, style, tier, lat, lng, vestige_index, lists };
}

/** A list's courses in list order. */
export function listCourses(dir: Directory, slug: string): Array<DirectoryCourse & { position: number }> {
  return dir.courses
    .flatMap((c) => {
      const m = c.lists.find((l) => l.slug === slug);
      return m ? [{ ...c, position: m.position }] : [];
    })
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, "en-GB"));
}
