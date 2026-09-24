import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { isSlug } from "@/lib/directory/format";

/**
 * The course directory's revalidation webhook (plan §2.4). The bunker calls
 * it after a course, county or list save, so Jack's edit is live on the next
 * visit, with no deploy.
 *
 * CONTRACT
 *
 *   POST /api/revalidate
 *   Authorization: Bearer <DIRECTORY_REVALIDATE_SECRET>
 *   Content-Type: application/json
 *   { "kind": "course" | "county" | "list" | "all", "slug"?: "<slug>" }
 *
 *   kind     slug       tags expired
 *   course   required   course:<slug>, courses  (the front door, county, style
 *                                              and list pages all list it)
 *   county   required   county:<slug>
 *   list     required   list:<slug>
 *   all      ignored    courses                 (every directory read carries it)
 *
 *   A county or list edit that changes what OTHER pages show - a rename, or a
 *   course joining or leaving a list - should send `all` (or one `course` per
 *   course touched): the course pages read their own tags, not the list's.
 *
 * Responses (JSON):
 *   200 { revalidated: true, tags, now }
 *   400 { error }  body not JSON, unknown kind, missing or malformed slug
 *   401 { error }  no bearer token, or the wrong one
 *   503 { error }  DIRECTORY_REVALIDATE_SECRET is not set on this deployment
 *
 * Tags are expired with `revalidateTag(tag, { expire: 0 })`, the form the
 * Next docs give for webhooks: nothing is rebuilt on the call; each page
 * rebuilds on its next visit, and that visit waits for fresh data rather
 * than being served the stale page. The token is compared in constant time
 * (both sides hashed to equal length first). Not listed in any sitemap and
 * not mentioned in robots.txt.
 */

type Kind = "course" | "county" | "list" | "all";
const KINDS: readonly Kind[] = ["course", "county", "list", "all"];

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function sameSecret(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function tagsFor(kind: Kind, slug: string | undefined): string[] | null {
  if (kind === "all") return ["courses"];
  if (!slug || !isSlug(slug)) return null;
  switch (kind) {
    case "course":
      return [`course:${slug}`, "courses"];
    case "county":
      return [`county:${slug}`];
    case "list":
      return [`list:${slug}`];
  }
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.DIRECTORY_REVALIDATE_SECRET;
  if (!secret) return json(503, { error: "Revalidation is not configured." });

  const auth = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  if (!match || !sameSecret(match[1], secret)) return json(401, { error: "Unauthorised." });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "The body must be JSON." });
  }
  if (typeof body !== "object" || body === null) return json(400, { error: "The body must be a JSON object." });

  const { kind, slug } = body as { kind?: unknown; slug?: unknown };
  if (typeof kind !== "string" || !KINDS.includes(kind as Kind)) {
    return json(400, { error: `kind must be one of ${KINDS.join(", ")}.` });
  }
  if (slug !== undefined && typeof slug !== "string") return json(400, { error: "slug must be a string." });

  const tags = tagsFor(kind as Kind, slug);
  if (!tags) return json(400, { error: `A ${kind} needs a valid slug.` });

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return json(200, { revalidated: true, tags, now: Date.now() });
}
