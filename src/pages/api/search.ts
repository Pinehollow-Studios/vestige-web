import type { APIRoute } from "astro";
import { searchCourses } from "../../lib/server/course-index";
import { clientIp, withinLimit, workerEnv } from "../../lib/server/worker-env";

/**
 * Course search for the directory's front door and the homepage hero:
 * GET /api/search?q=hankley. At least two characters, at most eight results,
 * limited per IP. The index lives inside the Worker, never as a file, so
 * there is no one-request list of every course to take.
 */
export const prerender = false;

const json = (status: number, body: unknown, cache = "no-store") =>
  Response.json(body, { status, headers: { "Cache-Control": cache, "X-Robots-Tag": "noindex" } });

export const GET: APIRoute = async ({ request, url }) => {
  if (!(await withinLimit(workerEnv.SEARCH_LIMITER, clientIp(request)))) {
    return json(429, { error: "Too many searches. Give it a minute." });
  }
  return json(200, searchCourses(url.searchParams.get("q") ?? ""), "public, max-age=300");
};
