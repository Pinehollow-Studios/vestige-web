import { getAllCounties, getAllCourseSummaries } from "@/lib/directory/data";
import { DIRECTORY_COVERAGE } from "@/lib/directory/config";
import { directoryShareCard, shareCardContentType, shareCardSize } from "../_components/ShareCard";

/**
 * The directory's shared share card - the front door, and (inherited down
 * the segments) every county, style and list page. A course page has its
 * own card in courses/[slug]/. Static, refreshed with the `courses` tag or
 * daily; without data it still draws, just without the counts.
 */

export const alt = `Golf courses in ${DIRECTORY_COVERAGE}, on Vestige`;
export const size = shareCardSize;
export const contentType = shareCardContentType;
export const revalidate = 86400;

export default async function Image() {
  let counts: { courses: number; counties: number } | null = null;
  try {
    const [courses, counties] = await Promise.all([getAllCourseSummaries(), getAllCounties()]);
    counts = { courses: courses.length, counties: counties.filter((c) => c.course_count > 0).length };
  } catch (err) {
    console.warn("[directory] share card data unavailable:", (err as Error).message);
  }
  return directoryShareCard(counts, DIRECTORY_COVERAGE);
}
