import Link from "next/link";
import type { CourseSummary } from "@/lib/directory/types";
import { plural, styleLabel } from "@/lib/directory/format";

/**
 * A row group of courses - the county and list pages. Name, then style and
 * holes (and the county, where the page spans more than one); the Vestige
 * Index on the right only where the view returns it.
 */
export function CourseRows({
  courses,
  showCounty = false,
  showShort = true,
  numbered = false,
}: {
  courses: Array<CourseSummary & { position?: number }>;
  showCounty?: boolean;
  /** "Short course" in the meta line - off where the group itself says so. */
  showShort?: boolean;
  numbered?: boolean;
}) {
  return (
    <ol className="dx-rows">
      {courses.map((c) => {
        const meta = [
          styleLabel(c.style),
          showShort && c.tier === "short" ? "Short course" : null,
          c.hole_count != null ? plural(c.hole_count, "hole", "holes") : null,
          showCounty ? c.county_name : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <li className="dx-row" key={c.slug}>
            <Link className="dx-row-inner" href={`/courses/${c.slug}`}>
              {numbered && c.position != null ? (
                <span className="dx-row-pos">{c.position}</span>
              ) : null}
              <span className="dx-row-body">
                <span className="dx-row-name">{c.name}</span>
                {meta ? <span className="dx-row-meta">{meta}</span> : null}
              </span>
              {c.vestige_index != null ? (
                <span
                  className="dx-row-end dx-num"
                  aria-label={`Vestige Index ${c.vestige_index}`}
                  title="Vestige Index"
                >
                  {c.vestige_index}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** The caption under a group, only when a number on the right needs explaining. */
export function indexNote(courses: CourseSummary[]): string | undefined {
  return courses.some((c) => c.vestige_index != null)
    ? "Where a number shows, it is the course's Vestige Index, out of 100."
    : undefined;
}
