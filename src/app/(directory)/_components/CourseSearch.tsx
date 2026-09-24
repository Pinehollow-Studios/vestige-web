"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";

/**
 * The front door's search: an in-page filter over every course's name and
 * county. No request leaves the page - the list arrives with it, lean:
 * `[name, slug, countyIndex]` per course and the county names once.
 * Enter opens the top result. Without JavaScript the box is inert and the
 * county, style and list links below still reach every course.
 */

export type SearchRow = readonly [name: string, slug: string, county: number];

const MAX_RESULTS = 12;

function normalise(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function CourseSearch({
  rows,
  counties,
}: {
  rows: readonly SearchRow[];
  counties: readonly string[];
}) {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState("");

  const index = useMemo(
    () =>
      rows.map(([name, slug, county]) => ({
        name,
        slug,
        county: counties[county] ?? "",
        key: normalise(name),
        countyKey: normalise(counties[county] ?? ""),
      })),
    [rows, counties]
  );

  const q = normalise(query);
  const results = useMemo(() => {
    if (!q) return [];
    const tokens = q.split(" ");
    const scored: Array<{ score: number; row: (typeof index)[number] }> = [];
    for (const row of index) {
      const hay = `${row.key} ${row.countyKey}`;
      if (!tokens.every((t) => hay.includes(t))) continue;
      const score = row.key.startsWith(q)
        ? 0
        : row.key.split(" ").some((w) => w.startsWith(tokens[0]))
          ? 1
          : row.key.includes(tokens[0])
            ? 2
            : 3;
      scored.push({ score, row });
    }
    scored.sort(
      (a, b) =>
        a.score - b.score ||
        a.row.name.localeCompare(b.row.name, "en-GB", { sensitivity: "base" })
    );
    return scored.map((s) => s.row);
  }, [q, index]);

  const shown = results.slice(0, MAX_RESULTS);

  return (
    <div className="dx-search">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (shown[0]) router.push(`/courses/${shown[0].slug}`);
        }}
      >
        <label className="dx-search-label" htmlFor={inputId}>
          Find a course
        </label>
        <input
          id={inputId}
          className="dx-search-input"
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Course name or county"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <p className="dx-search-status" role="status" aria-live="polite">
        {!q
          ? ""
          : results.length === 0
            ? `No course matches “${query.trim()}”.`
            : results.length > MAX_RESULTS
              ? `The first ${MAX_RESULTS} of ${results.length.toLocaleString("en-GB")} matches.`
              : `${results.length} ${results.length === 1 ? "match" : "matches"}.`}
      </p>

      {shown.length > 0 ? (
        <ul className="dx-rows">
          {shown.map((c) => (
            <li className="dx-row" key={c.slug}>
              <Link className="dx-row-inner" href={`/courses/${c.slug}`}>
                <span className="dx-row-body">
                  <span className="dx-row-name">{c.name}</span>
                  <span className="dx-row-meta">{c.county}</span>
                </span>
                <span className="dx-chevron" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
