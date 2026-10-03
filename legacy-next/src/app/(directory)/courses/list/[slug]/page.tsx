import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getAllLists, getList, getListCourses } from "@/lib/directory/data";
import { excerpt, isSlug, plural } from "@/lib/directory/format";
import { directoryMetadata } from "@/lib/directory/config";
import { breadcrumbList, courseItemList, graph } from "@/lib/directory/jsonLd";
import { CallToAction, Crumbs, Section } from "../../../_components/Frame";
import { JsonLd } from "../../../_components/JsonLd";
import { CourseRows, indexNote } from "../../../_components/CourseRows";

/**
 * A curated list - `/courses/list/<slug>` (`list` is a reserved path word).
 * Jack's editorial lists, in `position` order; the numbers show only when
 * the list is ranked (`is_ordered`). Tagged `courses` + `list:<slug>`.
 * Structured data: an ItemList (ascending when ranked) + a BreadcrumbList.
 */

export const dynamicParams = true;
export const revalidate = 86400;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const lists = await getAllLists();
    return lists.map((l) => ({ slug: l.slug }));
  } catch (err) {
    console.warn("[directory] list params unavailable:", (err as Error).message);
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Params },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const list = await getList(slug);
  if (!list) return {};
  const own = list.description?.trim() || list.bio?.trim();
  return directoryMetadata({
    title: list.name,
    description: own
      ? excerpt(own)
      : `${list.name}, a list of ${plural(list.course_count, "course", "courses")} on Vestige.`,
    path: `/courses/list/${list.slug}`,
    parent,
  });
}

export default async function ListPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  const [list, courses] = await Promise.all([getList(slug), getListCourses(slug)]);
  if (!list) notFound();

  const paragraphs = [list.description, list.bio]
    .map((t) => t?.trim())
    .filter((t): t is string => Boolean(t))
    .filter((t, i, all) => all.indexOf(t) === i)
    .flatMap((t) => t.split(/\n\s*\n/).map((p) => p.trim()))
    .filter(Boolean);

  const counties = new Set(courses.map((c) => c.county_slug));
  const path = `/courses/list/${list.slug}`;
  const structured = graph([
    courseItemList(list.name, path, courses, list.is_ordered),
    breadcrumbList([
      { name: "Courses", path: "/courses" },
      { name: list.name, path },
    ]),
  ]);

  return (
    <article>
      <JsonLd data={structured} />
      <Crumbs items={[{ label: "Courses", href: "/courses" }, { label: list.name }]} />

      <h1 className="dx-title">{list.name}</h1>
      <p className="dx-sub">{plural(courses.length, "course", "courses")}</p>

      {paragraphs.map((p, i) => (
        <p className="dx-lede" key={i}>
          {p}
        </p>
      ))}

      {courses.length > 0 ? (
        <Section title={list.is_ordered ? "The list, in order" : "The courses"} note={indexNote(courses)}>
          <CourseRows courses={courses} numbered={list.is_ordered} showCounty={counties.size > 1} />
        </Section>
      ) : null}

      {courses.length > 0 ? <CallToAction pageType="list" label="Played any? Put them on your map" /> : null}
    </article>
  );
}
