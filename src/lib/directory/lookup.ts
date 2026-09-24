import "server-only";

import { callRpc } from "./source";
import { isSlug } from "./format";

/**
 * Old share links: the app has always shared a course as
 * `/course/<uuid>?n=<name>`. `web_directory_slug_for_course(p_course_id)`
 * answers the frozen slug for a course id, or null.
 *
 * This NEVER throws. Any failure - no data source, the RPC not on this
 * project (it isn't on prod yet), a timeout, a malformed answer - is a
 * null, and the caller renders today's landing page. A slug is frozen for
 * the life of a course, so the answer is cached under the umbrella tag.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: string): boolean {
  return UUID.test(s);
}

export async function slugForCourseId(id: string): Promise<string | null> {
  if (!isUuid(id)) return null;
  try {
    const slug = await callRpc<unknown>(
      "web_directory_slug_for_course",
      { p_course_id: id.toLowerCase() },
      ["courses"]
    );
    return typeof slug === "string" && isSlug(slug) ? slug : null;
  } catch (err) {
    console.warn("[directory] slug lookup failed:", (err as Error).message);
    return null;
  }
}
