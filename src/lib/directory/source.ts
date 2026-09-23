import "server-only";

/**
 * The one door from the website to the course directory's data: plain
 * PostgREST `GET`s against the three public views, the way
 * `src/lib/waitlistDb.ts` talks to Supabase (no client library). Server-only;
 * the browser never talks to Supabase from a directory page.
 *
 * Env (server-only):
 *   DIRECTORY_SUPABASE_URL       the project the directory reads (dev while
 *   DIRECTORY_SUPABASE_ANON_KEY  the views live only there)
 * Falling back to SUPABASE_URL / SUPABASE_ANON_KEY - the waitlist's prod
 * project - once the views are on prod and the pair can be dropped.
 *
 * Caching is the "previous model" (Cache Components stay OFF - plan §2.3):
 * every read is `cache: "force-cache"` with `next.tags`, so a page is built
 * once and kept until its tags are revalidated (phase 2's webhook) or the
 * route's `revalidate` window passes. A failed read THROWS rather than
 * returning empty: an error is never cached, where an empty result would be
 * cached as a 404 for a page that exists.
 */

export class DirectorySourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DirectorySourceError";
  }
}

function source(): { url: string; key: string } {
  const url = process.env.DIRECTORY_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.DIRECTORY_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new DirectorySourceError(
      "The course directory has no data source: set DIRECTORY_SUPABASE_URL and DIRECTORY_SUPABASE_ANON_KEY."
    );
  }
  return { url: url.replace(/\/+$/, ""), key };
}

/**
 * GET `/rest/v1/<view>?<query>` and decode the JSON array. `tags` are the
 * cache tags phase 2's revalidation webhook will call by name:
 * `courses`, `course:<slug>`, `county:<slug>`, `list:<slug>`.
 */
export async function readView<T>(
  view: string,
  query: URLSearchParams,
  tags: string[]
): Promise<T[]> {
  const { url, key } = source();
  const res = await fetch(`${url}/rest/v1/${view}?${query.toString()}`, {
    method: "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    cache: "force-cache",
    next: { tags },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new DirectorySourceError(
      `Reading ${view} failed: ${res.status} ${body.slice(0, 200)}`
    );
  }
  return (await res.json()) as T[];
}

/**
 * Every row of a view, a page at a time. Supabase caps a response at the
 * project's `max_rows` (1,000 by default) and the courses view has ~1,811,
 * and Next's data cache refuses any single entry over 2 MB - so the rows
 * come in pages, each cached on its own, until a page comes back empty.
 * The stop rule doesn't assume the page size is honoured: a smaller
 * `max_rows` just means more pages.
 */
export async function readAllRows<T>(
  view: string,
  query: URLSearchParams,
  tags: string[],
  pageSize = 1000
): Promise<T[]> {
  const rows: T[] = [];
  for (;;) {
    const page = new URLSearchParams(query);
    page.set("limit", String(pageSize));
    page.set("offset", String(rows.length));
    const batch = await readView<T>(view, page, tags);
    if (batch.length === 0) return rows;
    rows.push(...batch);
    if (rows.length > 20000) {
      throw new DirectorySourceError(`Reading ${view} did not end after 20,000 rows.`);
    }
  }
}
