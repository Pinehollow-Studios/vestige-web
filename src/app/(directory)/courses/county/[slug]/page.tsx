import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getAllCounties, getCounty, getCountyCourses } from "@/lib/directory/data";
import { byName, formatNumber, isSlug, plural } from "@/lib/directory/format";
import { directoryMetadata } from "@/lib/directory/config";
import { breadcrumbList, courseItemList, graph } from "@/lib/directory/jsonLd";
import { CallToAction, Crumbs, Section } from "../../../_components/Frame";
import { JsonLd } from "../../../_components/JsonLd";
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

export async function generateMetadata(
  { params }: { params: Params },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const [county, courses] = await Promise.all([getCounty(slug), getCountyCourses(slug)]);
  if (!county) return {};
  return directoryMetadata({
    title: `Golf courses in ${county.name}`,
    description:
      courses.length > 0
        ? `The ${plural(courses.length, "golf course", "golf courses")} in ${county.name} on Vestige, with the style and holes of each.`
        : `Golf courses in ${county.name}.`,
    path: `/courses/county/${county.slug}`,
    parent,
  });
}

export default async function CountyPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  const [county, courses] = await Promise.all([getCounty(slug), getCountyCourses(slug)]);
  if (!county) notFound();

  const full = courses.filter((c) => c.tier !== "short").sort(byName);
  const short = courses.filter((c) => c.tier === "short").sort(byName);
  const path = `/courses/county/${county.slug}`;
  const structured = graph([
    courseItemList(`Golf courses in ${county.name}`, path, [...full, ...short], false),
    breadcrumbList([
      { name: "Courses", path: "/courses" },
      { name: county.name, path },
    ]),
  ]);

  return (
    <article>
      <JsonLd data={structured} />
      <Crumbs items={[{ label: "Courses", href: "/courses" }, { label: county.name }]} />

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

      {courses.length > 0 ? <CallToAction pageType="county" label="Played any? Put them on your map" /> : null}
    </article>
  );
}
