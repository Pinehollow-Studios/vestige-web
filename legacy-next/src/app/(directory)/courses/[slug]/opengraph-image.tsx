import { getCourse } from "@/lib/directory/data";
import { DIRECTORY_COVERAGE } from "@/lib/directory/config";
import { isSlug, styleLabel } from "@/lib/directory/format";
import {
  courseShareCard,
  directoryShareCard,
  shareCardContentType,
  shareCardSize,
} from "../../_components/ShareCard";

/**
 * A course's share card: its name, county, style, founding year, and the
 * Vestige Index only when the view returns one. Our own text and shapes -
 * no map imagery, no outline (plan §2.5, §5.2).
 *
 * None are built up front (1,811 images would be minutes of build time):
 * each renders on its first request and is then cached like the page,
 * refreshed daily. If the data can't be read it falls back to the shared
 * directory card rather than erroring; an unknown slug is a 404.
 */

export const alt = "A golf course on Vestige";
export const size = shareCardSize;
export const contentType = shareCardContentType;
export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) return new Response("Not found", { status: 404 });

  let course: Awaited<ReturnType<typeof getCourse>>;
  try {
    course = await getCourse(slug);
  } catch (err) {
    console.warn("[directory] course share card data unavailable:", (err as Error).message);
    return directoryShareCard(null, DIRECTORY_COVERAGE);
  }
  if (!course) return new Response("Not found", { status: 404 });

  return courseShareCard({
    name: course.name,
    county: course.county_name,
    style: styleLabel(course.style),
    founded: course.established,
    index: course.vestige_index,
  });
}
