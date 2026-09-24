import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCourseSummaries, getAllLists, getCourse } from "@/lib/directory/data";
import {
  courseKind,
  excerpt,
  formatMiles,
  formatNumber,
  isSlug,
  nearestCourses,
  safeHttpUrl,
  styleLabel,
  websiteHost,
} from "@/lib/directory/format";
import { directoryMetadata } from "@/lib/directory/config";
import { breadcrumbList, golfCourse, graph } from "@/lib/directory/jsonLd";
import { CallToAction, Crumbs, Section } from "../../_components/Frame";
import { JsonLd } from "../../_components/JsonLd";

/**
 * A course - `/courses/<slug>`, flat and permanent (plan §1, §3). Phase 1
 * carries the §3 minimum without the map or the course shape (Tom,
 * 2026-09-23): name, county, facts, Jack's description, where it sits, the
 * Index only when the view returns it, the four nearest courses, the club's
 * website and one CTA.
 *
 * Static: every slug is prerendered at build; a course added since renders
 * on first request and is then cached (`dynamicParams`). Data is tagged
 * `courses` + `course:<slug>`, refreshed by the webhook
 * (app/api/revalidate), with `revalidate` as the daily backstop. The share
 * image is the sibling opengraph-image.tsx; the structured data is a
 * GolfCourse + BreadcrumbList.
 */

export const dynamicParams = true;
export const revalidate = 86400;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const courses = await getAllCourseSummaries();
    return courses.map((c) => ({ slug: c.slug }));
  } catch (err) {
    // No data source at build (unset env, or the views not on this project
    // yet): build nothing up front and render on request instead.
    console.warn("[directory] course params unavailable:", (err as Error).message);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  const course = await getCourse(slug);
  if (!course) return {};
  const fallback = `${course.name} is a ${
    styleLabel(course.style)?.toLowerCase() ?? "golf"
  } course in ${course.county_name}.`;
  return directoryMetadata({
    title: `${course.name}, ${course.county_name}`,
    description: excerpt(course.description?.trim() || fallback),
    path: `/courses/${course.slug}`,
  });
}

export default async function CoursePage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  const course = await getCourse(slug);
  if (!course) notFound();

  const [all, lists] = await Promise.all([getAllCourseSummaries(), getAllLists()]);

  const inCounty = all.filter((c) => c.county_slug === course.county_slug).length;
  const nearby = nearestCourses(course, all, 4);
  const orderedList = new Map(lists.map((l) => [l.slug, l.is_ordered]));
  const memberships = [...course.lists].sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
  const website = safeHttpUrl(course.website);
  const style = styleLabel(course.style);
  const description = course.description?.trim();

  const facts: Array<{ label: string; value: string; word?: boolean }> = [];
  if (course.par != null) facts.push({ label: "Par", value: String(course.par) });
  if (course.yards != null) facts.push({ label: "Yards", value: formatNumber(course.yards) });
  if (course.hole_count != null) facts.push({ label: "Holes", value: String(course.hole_count) });
  if (style) facts.push({ label: "Style", value: style, word: true });
  if (course.established != null) facts.push({ label: "Founded", value: String(course.established) });

  const structured = graph([
    golfCourse(course, website),
    breadcrumbList([
      { name: "Courses", path: "/courses" },
      { name: course.county_name, path: `/courses/county/${course.county_slug}` },
      { name: course.name, path: `/courses/${course.slug}` },
    ]),
  ]);

  return (
    <article>
      <JsonLd data={structured} />
      <Crumbs
        items={[
          { label: "Courses", href: "/courses" },
          { label: course.county_name, href: `/courses/county/${course.county_slug}` },
          { label: course.name },
        ]}
      />

      <h1 className="dx-title">{course.name}</h1>
      <p className="dx-sub">
        {courseKind(course)} in{" "}
        <Link href={`/courses/county/${course.county_slug}`}>{course.county_name}</Link>
      </p>

      {facts.length > 0 ? (
        <dl className="dx-facts">
          {facts.map((f) => (
            <div className="dx-fact" key={f.label}>
              <dt>{f.label}</dt>
              <dd className={f.word ? "dx-fact-word" : undefined}>{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {description
        ? description
            .split(/\n\s*\n/)
            .map((para, i) => (
              <p className="dx-lede" key={i}>
                {para.trim()}
              </p>
            ))
        : null}

      {course.vestige_index != null ? (
        <div className="dx-index">
          <span className="dx-index-num">{course.vestige_index}</span>
          <span className="dx-index-label">
            <strong>Vestige Index</strong>
            out of 100
          </span>
        </div>
      ) : null}

      <Section title="Where it sits">
        <ul className="dx-rows">
          <li className="dx-row">
            <Link className="dx-row-inner" href={`/courses/county/${course.county_slug}`}>
              <span className="dx-row-body">
                <span className="dx-row-name">
                  {inCounty > 1
                    ? `1 of ${formatNumber(inCounty)} courses in ${course.county_name}`
                    : `The only course in ${course.county_name}`}
                </span>
              </span>
              <span className="dx-chevron" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
          {memberships.map((m) => (
            <li className="dx-row" key={m.slug}>
              <Link className="dx-row-inner" href={`/courses/list/${m.slug}`}>
                <span className="dx-row-body">
                  <span className="dx-row-name">{m.name}</span>
                </span>
                {orderedList.get(m.slug) !== false ? (
                  <span className="dx-row-end dx-num" aria-label={`Number ${m.position}`}>
                    No. {m.position}
                  </span>
                ) : null}
                <span className="dx-chevron" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {nearby.length > 0 ? (
        <Section title="Nearby" note="The nearest courses, as the crow flies.">
          <ul className="dx-rows">
            {nearby.map(({ course: near, km }) => (
              <li className="dx-row" key={near.slug}>
                <Link className="dx-row-inner" href={`/courses/${near.slug}`}>
                  <span className="dx-row-body">
                    <span className="dx-row-name">{near.name}</span>
                    <span className="dx-row-meta">
                      {[styleLabel(near.style), near.county_slug !== course.county_slug ? near.county_name : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="dx-row-end">{formatMiles(km)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {website ? (
        <Section title="The club">
          <ul className="dx-rows">
            <li className="dx-row">
              <a className="dx-row-inner" href={website} rel="noopener">
                <span className="dx-row-body">
                  <span className="dx-row-name">Club website</span>
                  <span className="dx-row-meta">{websiteHost(website) ?? website}</span>
                </span>
                <span className="dx-chevron" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          </ul>
        </Section>
      ) : null}

      <CallToAction pageType="course" />
    </article>
  );
}
