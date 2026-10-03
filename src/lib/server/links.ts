import { SUPABASE_ANON_KEY, SUPABASE_URL } from "astro:env/server";

/**
 * Read the `?n=` display-name hint the app adds to course links. Rendered
 * as text only, never trusted for a lookup: control characters stripped,
 * capped at 60, so a hand-edited link can't turn the page into a billboard.
 */
export function cleanNameHint(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 60);
  return cleaned || null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The directory slug for an app course id, or null. Never throws. */
export async function slugForCourseId(id: string): Promise<string | null> {
  if (!UUID.test(id) || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const qs = new URLSearchParams({ p_course_id: id.toLowerCase() });
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/web_directory_slug_for_course?${qs}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const slug = await res.json();
    return typeof slug === "string" && SLUG.test(slug) ? slug : null;
  } catch {
    return null;
  }
}
