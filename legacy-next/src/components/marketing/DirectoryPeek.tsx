import Link from "next/link";
import { DIRECTORY_COVERAGE } from "@/lib/directory/config";
import type { DirectoryOverview } from "@/lib/directory/marketing";
import { Reveal } from "./Reveal";

/**
 * The homepage's way into the course directory (/courses): a course search
 * and the shortest routes in, the curated lists and the counties. The
 * homepage keeps its pitch (Tom, 2026-10-02); this section sits after the
 * stats strip and hands over to the directory rather than repeating it.
 *
 * The search is a plain GET form to /courses?q=, so it works before (or
 * without) JavaScript, and the directory's own search picks the query up.
 * Moving to /courses is a full page load either way: the directory has
 * its own root layout.
 *
 * Renders nothing without `overview` (the directory couldn't be read), so
 * the homepage never shows a half-empty section or links that lead nowhere.
 */
export function DirectoryPeek({ overview }: { overview: DirectoryOverview | null }) {
  if (!overview) return null;
  const { courses, counties } = overview;
  // Biggest list first, so the Top 100 leads the row.
  const lists = [...overview.lists].sort(
    (a, b) => b.course_count - a.course_count || a.name.localeCompare(b.name, "en-GB")
  );

  return (
    <section className="fw-peek fw-dir" aria-labelledby="fw-dir-title">
      <div className="fw-peek-inner">
        <Reveal>
          <div className="fw-peek-head">
            <p className="fw-page-eyebrow">The courses</p>
            <h2 id="fw-dir-title" className="fw-peek-title">
              Every course, <span className="fw-peek-ital">one place</span>.
            </h2>
            <p className="fw-peek-sub">
              All {courses.toLocaleString("en-GB")} golf courses in {DIRECTORY_COVERAGE},
              county by county, with the facts for each: holes, par, yards,
              style and the year it was founded. Scotland and Wales follow as
              they&rsquo;re mapped.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <form className="fw-email fw-dir-search" action="/courses" method="get" role="search">
            <div className="fw-email-shell">
              <label className="fw-dir-label" htmlFor="fw-dir-q">
                Find a course
              </label>
              <input
                id="fw-dir-q"
                name="q"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Course name or county"
              />
              <button type="submit">Search</button>
            </div>
          </form>
        </Reveal>

        <Reveal delay={200}>
          <nav className="fw-dir-ways" aria-label="Browse the courses">
            {lists.map((l) => (
              <Link key={l.slug} className="fw-dir-chip" href={`/courses/list/${l.slug}`}>
                {l.name}
                <span>{l.course_count}</span>
              </Link>
            ))}
            <Link className="fw-dir-chip" href="/courses#s-by-county">
              By county
              <span>{counties.length}</span>
            </Link>
            <Link className="fw-dir-chip" href="/courses#s-by-style">
              By style
            </Link>
          </nav>
        </Reveal>

        <Link href="/courses" className="fw-peek-more">
          Browse every course →
        </Link>
      </div>
    </section>
  );
}
