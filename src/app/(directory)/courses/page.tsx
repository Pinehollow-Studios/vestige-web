import type { Metadata } from "next";
import Link from "next/link";
import { getAllCounties, getAllCourseSummaries, getAllLists } from "@/lib/directory/data";
import { byName, formatNumber, plural, styleLabel, styleSlug } from "@/lib/directory/format";
import { DIRECTORY_COVERAGE, directoryMetadata } from "@/lib/directory/config";
import type { CourseSummary, DirectoryCounty, DirectoryList } from "@/lib/directory/types";
import { CallToAction, Section } from "../_components/Frame";
import { CourseSearch, type SearchRow } from "../_components/CourseSearch";

/**
 * The front door - `/courses`. The count, a search over every course's name
 * and county, then three ways to browse: by style (`/courses/style/<slug>`),
 * by county, and the curated lists. One CTA.
 *
 * Static, built once and kept until the `courses` tag is revalidated by the
 * webhook (every read carries it) or a day passes. If the data can't be
 * read - no source, or the views not on this project yet (prod, today) -
 * it renders a quiet holding page rather than failing the build.
 */

export const revalidate = 86400;

type FrontDoor = {
  courses: CourseSummary[];
  counties: DirectoryCounty[];
  lists: DirectoryList[];
};

async function load(): Promise<FrontDoor | null> {
  try {
    const [courses, counties, lists] = await Promise.all([
      getAllCourseSummaries(),
      getAllCounties(),
      getAllLists(),
    ]);
    return { courses, counties, lists };
  } catch (err) {
    console.warn("[directory] front door data unavailable:", (err as Error).message);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await load();
  const count = data ? `${formatNumber(data.courses.length)} ` : "";
  return directoryMetadata({
    title: `Golf courses in ${DIRECTORY_COVERAGE}`,
    description: `${count}golf courses in ${DIRECTORY_COVERAGE}, with the holes, par, yards, style and founding year of each. Search by name, or browse by county, style or list.`,
    path: "/courses",
  });
}

export default async function CoursesFrontDoor() {
  const data = await load();

  if (!data) {
    return (
      <div className="dx-empty">
        <h1 className="dx-title">Golf courses</h1>
        <p>The course directory isn&rsquo;t available just now. Please try again soon.</p>
        <p>
          <Link href="/">Back to Vestige</Link>
        </p>
      </div>
    );
  }

  const { courses, counties, lists } = data;

  // The search's lean payload: county names once, each course a tuple.
  const countyNames = counties.map((c) => c.name);
  const countyIndex = new Map(counties.map((c, i) => [c.slug, i]));
  const rows: SearchRow[] = [...courses]
    .sort(byName)
    .map((c) => [c.name, c.slug, countyIndex.get(c.county_slug) ?? -1] as const);

  const styles = new Map<string, { label: string; count: number }>();
  for (const c of courses) {
    if (!c.style) continue;
    const slug = styleSlug(c.style);
    const entry = styles.get(slug) ?? { label: styleLabel(c.style) ?? c.style, count: 0 };
    entry.count += 1;
    styles.set(slug, entry);
  }
  const styleRows = [...styles.entries()].sort((a, b) => b[1].count - a[1].count);

  const countyRows = [...counties].sort(byName);
  const listRows = [...lists].sort((a, b) => b.course_count - a.course_count || byName(a, b));

  return (
    <article>
      <h1 className="dx-title">Golf courses</h1>
      <p className="dx-sub">
        {plural(courses.length, "course", "courses")} in {DIRECTORY_COVERAGE}
      </p>
      <p className="dx-lede">
        Every course on Vestige, with the facts for each: holes, par, yards, style and the year
        it was founded. Search by name, or browse by style, county or list.
      </p>

      <CourseSearch rows={rows} counties={countyNames} />

      {styleRows.length > 0 ? (
        <Section title="By style">
          <ul className="dx-rows">
            {styleRows.map(([slug, s]) => (
              <li className="dx-row" key={slug}>
                <Link className="dx-row-inner" href={`/courses/style/${slug}`}>
                  <span className="dx-row-body">
                    <span className="dx-row-name">{s.label}</span>
                  </span>
                  <span className="dx-row-end">{formatNumber(s.count)}</span>
                  <span className="dx-chevron" aria-hidden="true">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="By county" note={`All ${counties.length} counties, A to Z.`}>
        <ul className="dx-rows dx-rows-2">
          {countyRows.map((c) => (
            <li className="dx-row" key={c.slug}>
              {c.course_count > 0 ? (
                <Link className="dx-row-inner" href={`/courses/county/${c.slug}`}>
                  <span className="dx-row-body">
                    <span className="dx-row-name">{c.name}</span>
                  </span>
                  <span className="dx-row-end">{formatNumber(c.course_count)}</span>
                </Link>
              ) : (
                <span className="dx-row-inner">
                  <span className="dx-row-body">
                    <span className="dx-row-name">{c.name}</span>
                  </span>
                  <span className="dx-row-end">0</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {listRows.length > 0 ? (
        <Section title="Curated lists">
          <ul className="dx-rows">
            {listRows.map((l) => (
              <li className="dx-row" key={l.slug}>
                <Link className="dx-row-inner" href={`/courses/list/${l.slug}`}>
                  <span className="dx-row-body">
                    <span className="dx-row-name">{l.name}</span>
                    <span className="dx-row-meta">
                      {plural(l.course_count, "course", "courses")}
                      {l.is_ordered ? ", in order" : null}
                    </span>
                  </span>
                  <span className="dx-chevron" aria-hidden="true">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CallToAction pageType="front" label="Played any? Put them on your map" />
    </article>
  );
}
