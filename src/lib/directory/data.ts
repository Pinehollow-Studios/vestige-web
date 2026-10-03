/**
 * The course directory's data for the prerendered pages: the copy the
 * vestige-directory integration (integrations/directory.mjs) fetched through
 * the keyed export before the build began, held in memory. No visitor request
 * ever touches the database, and the database is closed to the public key.
 *
 * Read with fs at build time on purpose: the full file must never be bundled
 * into anything a browser or the Worker ships.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CourseSummary, DirectoryCounty, DirectoryCourse, DirectoryList } from "./types";

export type Directory = {
  courses: DirectoryCourse[];
  counties: DirectoryCounty[];
  lists: DirectoryList[];
};

let loaded: Promise<Directory> | null = null;

/** Everything, read once per build. */
export function loadDirectory(): Promise<Directory> {
  loaded ??= Promise.resolve().then(() => {
    const file = join(process.cwd(), "src/generated/directory.json");
    return JSON.parse(readFileSync(file, "utf8")) as Directory;
  });
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
