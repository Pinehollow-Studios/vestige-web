import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getAllCourseSummaries } from "@/lib/directory/data";
import { byName, formatNumber, isSlug, plural, styleLabel, styleSlug } from "@/lib/directory/format";
import { DIRECTORY_COVERAGE, directoryMetadata } from "@/lib/directory/config";
import { breadcrumbList, courseItemList, graph } from "@/lib/directory/jsonLd";
import type { CourseSummary } from "@/lib/directory/types";
import { CallToAction, Crumbs, Section } from "../../../_components/Frame";
import { CourseRows, indexNote } from "../../../_components/CourseRows";
import { JsonLd } from "../../../_components/JsonLd";

/**
 * A style - `/courses/style/<slug>` (`style` is a reserved path word, like
 * `county` and `list`). Every course of that style across every county,
 * full-length first and short courses after, each A to Z, the county on
 * each row. The front door's "By style" links here.
 *
 * The styles are whatever the data holds (Parkland, Heathland, Links,
 * Downland, Pitch and Putt today), so a new one gets its page without a
 * code change. Built from the all-courses read, tagged `courses`.
 */

export const dynamicParams = true;
export const revalidate = 86400;

type Params = Promise<{ slug: string }>;

async function coursesOfStyle(slug: string): Promise<{ label: string; courses: CourseSummary[] } | null> {
  const all = await getAllCourseSummaries();
  const courses = all.filter((c) => c.style && styleSlug(c.style) === slug);
  if (courses.length === 0) return null;
  return { label: styleLabel(courses[0].style) ?? slug, courses };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const all = await getAllCourseSummaries();
    const slugs = new Set(all.flatMap((c) => (c.style ? [styleSlug(c.style)] : [])));
    return [...slugs].filter(isSlug).map((slug) => ({ slug }));
  } catch (err) {
    console.warn("[directory] style params unavailable:", (err as Error).message);
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Params },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const style = await coursesOfStyle(slug);
  if (!style) return {};
  return directoryMetadata({
    title: `${style.label} golf courses in ${DIRECTORY_COVERAGE}`,
    description: `The ${plural(style.courses.length, `${style.label.toLowerCase()} course`, `${style.label.toLowerCase()} courses`)} in ${DIRECTORY_COVERAGE} on Vestige, with the county and holes of each.`,
    path: `/courses/style/${slug}`,
    parent,
  });
}

export default async function StylePage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  const style = await coursesOfStyle(slug);
  if (!style) notFound();

  const full = style.courses.filter((c) => c.tier !== "short").sort(byName);
  const short = style.courses.filter((c) => c.tier === "short").sort(byName);
  const counties = new Set(style.courses.map((c) => c.county_slug));
  const path = `/courses/style/${slug}`;
  const structured = graph([
    courseItemList(`${style.label} golf courses`, path, [...full, ...short], false),
    breadcrumbList([
      { name: "Courses", path: "/courses" },
      { name: style.label, path },
    ]),
  ]);

  return (
    <article>
      <JsonLd data={structured} />
      <Crumbs items={[{ label: "Courses", href: "/courses" }, { label: style.label }]} />

      <h1 className="dx-title">{style.label}</h1>
      <p className="dx-sub">
        {plural(style.courses.length, "course", "courses")} in {DIRECTORY_COVERAGE}, across{" "}
        {plural(counties.size, "county", "counties")}
        {short.length > 0 && full.length > 0 ? `, ${formatNumber(short.length)} of them short` : null}
      </p>

      {full.length > 0 ? (
        <Section title={short.length > 0 ? "Courses" : "Every course"} note={indexNote(full)}>
          <CourseRows courses={full} showShort={false} showCounty />
        </Section>
      ) : null}

      {short.length > 0 ? (
        <Section
          title={full.length > 0 ? "Short courses" : "Every course"}
          note={full.length === 0 ? indexNote(short) : undefined}
        >
          <CourseRows courses={short} showShort={false} showCounty />
        </Section>
      ) : null}

      <CallToAction pageType="style" label="Played any? Put them on your map" />
    </article>
  );
}
