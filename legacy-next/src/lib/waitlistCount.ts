import "server-only";

/**
 * Live waitlist counts for the marketing social-proof chips.
 *
 * Reads the launch-waitlist segment and returns the total number of signups and
 * how many joined in the last 7 days. Runs server-side only (the API key never
 * reaches the browser) and is cached for an hour via the fetch `revalidate`
 * option, so the page is ISR rather than hammering Resend on every view.
 *
 * Resilient by design: any misconfiguration or API error resolves to `null`, so
 * the caller simply hides the counter rather than surfacing an error. The page
 * decides whether the numbers are flattering enough to show (see siteConfig
 * `hero.liveCountMinWeekly`).
 */

const RESEND_API = "https://api.resend.com";
// api.resend.com is fronted by Cloudflare, which 403s bot-like/missing
// User-Agents ("error code: 1010"). Send an explicit one. (See resend.ts.)
const USER_AGENT = "vestige-web/1.0 (+https://vestige.golf)";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const PAGE_SIZE = 100;
const MAX_PAGES = 200; // safety valve: stop after 20k contacts
const REVALIDATE_SECONDS = 3600;

export type WaitlistStats = { total: number; weekly: number };

type SegmentContact = { id: string; created_at?: string };

/** Resend timestamps look like "2026-06-08 09:14:51.006233+00" — normalise to
 *  ISO before parsing, since that form isn't reliably parsed by Date. */
function parseTimestamp(raw: string | undefined): number {
  if (!raw) return 0;
  const iso = raw.replace(" ", "T").replace(/\+00(:00)?$/, "Z");
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

export async function getWaitlistStats(): Promise<WaitlistStats | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_WAITLIST_SEGMENT_ID;
  if (!apiKey || !segmentId) return null;

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "User-Agent": USER_AGENT,
  };
  const cutoff = Date.now() - WEEK_MS;

  let total = 0;
  let weekly = 0;
  let after: string | null = null;

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const url =
        `${RESEND_API}/segments/${segmentId}/contacts?limit=${PAGE_SIZE}` +
        (after ? `&after=${after}` : "");

      const res = await fetch(url, {
        headers,
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) {
        console.error("[waitlist-count:error]", res.status);
        return null;
      }

      const body = (await res.json()) as {
        data?: SegmentContact[];
        has_more?: boolean;
      };
      const rows = body.data ?? [];
      total += rows.length;
      for (const c of rows) {
        if (parseTimestamp(c.created_at) >= cutoff) weekly++;
      }

      if (!body.has_more || rows.length === 0) break;
      after = rows[rows.length - 1].id;
    }

    return { total, weekly };
  } catch (err) {
    console.error("[waitlist-count:exception]", err);
    return null;
  }
}
