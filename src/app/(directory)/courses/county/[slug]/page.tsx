import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCounties, getCounty, getCountyCourses } from "@/lib/directory/data";
import { byName, formatNumber, isSlug, plural } from "@/lib/directory/format";
import { CallToAction, Crumbs, Section } from "../../../_components/Frame";
import { CourseRows, indexNote } from "../../../_components/CourseRows";

/**
 * A county - `/courses/county/<slug>` (`county` is a reserved path word, never
 * a course slug). Every course in it, full-length courses first and short
 * courses after, each group A to Z. Tagged `courses` + `county:<slug>`.
 */

export const dynamicParams = true;
export const revalidate = 86400;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const counties = await getAllCounties();
    return counties.filter((c) => c.course_count > 0).map((c) => ({ slug: c.slug }));
  } catch (err) {
    console.warn("[directory] county params unavailable:", (err as Error).message);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const [county, courses] = await Promise.all([getCounty(slug), getCountyCourses(slug)]);
  if (!county) return {};
  return {
    title: `Golf courses in ${county.name}`,
    description:
      courses.length > 0
        ? `The ${plural(courses.length, "golf course", "golf courses")} in ${county.name} on Vestige, with the style and holes of each.`
        : `Golf courses in ${county.name}.`,
    alternates: { canonical: `/courses/county/${county.slug}` },
  };
}

export default async function CountyPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  const [county, courses] = await Promise.all([getCounty(slug), getCountyCourses(slug)]);
  if (!county) notFound();

  const full = courses.filter((c) => c.tier !== "short").sort(byName);
  const short = courses.filter((c) => c.tier === "short").sort(byName);

  return (
    <article>
      <Crumbs items={[{ label: "Courses" }, { label: county.name }]} />

      <h1 className="dx-title">{county.name}</h1>
      <p className="dx-sub">
        {courses.length === 0
          ? "No courses here yet."
          : short.length > 0 && full.length > 0
            ? `${plural(courses.length, "course", "courses")}, ${formatNumber(short.length)} of them short`
            : plural(courses.length, "course", "courses")}
      </p>

      {full.length > 0 ? (
        <Section title={short.length > 0 ? "Courses" : "Every course"} note={indexNote(full)}>
          <CourseRows courses={full} showShort={false} />
        </Section>
      ) : null}

      {short.length > 0 ? (
        <Section title="Short courses" note={full.length === 0 ? indexNote(short) : undefined}>
          <CourseRows courses={short} showShort={false} />
        </Section>
      ) : null}

      {courses.length > 0 ? <CallToAction label="Played any? Put them on your map" /> : null}
    </article>
  );
}
