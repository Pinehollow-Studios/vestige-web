/**
 * The Worker's private index of courses: name, slug and county only, written
 * at build by integrations/directory.mjs and bundled into the Worker (never a
 * public file). Backs /api/search and the claim pages.
 */
import index from "../../generated/search-index.json";

export type IndexedCourse = { name: string; slug: string; county: string };

const normalise = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const rows = (index.rows as Array<[string, string, number]>).map(([name, slug, c]) => {
  const county = index.counties[c] ?? "";
  return { name, slug, county, key: normalise(name), hay: `${normalise(name)} ${normalise(county)}` };
});
const bySlug = new Map(rows.map((r) => [r.slug, r]));

export function findCourse(slug: unknown): IndexedCourse | null {
  if (typeof slug !== "string") return null;
  const r = bySlug.get(slug.trim());
  return r ? { name: r.name, slug: r.slug, county: r.county } : null;
}

/** Up to `max` matches for a query of two or more characters, best first. */
export function searchCourses(raw: string, max = 8): { results: IndexedCourse[]; total: number } {
  const q = normalise(raw.slice(0, 80));
  if (q.length < 2) return { results: [], total: 0 };
  const tokens = q.split(" ");
  const found = rows
    .filter((r) => tokens.every((t) => r.hay.includes(t)))
    .map((r) => ({
      r,
      score: r.key.startsWith(q) ? 0 : r.key.split(" ").some((w) => w.startsWith(tokens[0])) ? 1 : 2,
    }))
    .sort((a, b) => a.score - b.score || a.r.name.localeCompare(b.r.name, "en-GB"));
  return {
    total: found.length,
    results: found.slice(0, max).map(({ r }) => ({ name: r.name, slug: r.slug, county: r.county })),
  };
}
