/**
 * Clubs claiming their course pages (docs/course-pages-plan.md §4).
 *
 * The database does the deciding (vestige-ios migration 20261003130000):
 * whether the claimant's email domain matches the club's website, whether the
 * course is already claimed, the one-verified-claim-per-course rule. This file
 * only makes tokens, calls the web_claim_* functions with the Worker's key and
 * hands back what they say.
 *
 * Tokens: 32 random bytes, base64url, sent in emails and nowhere else. The
 * database stores their SHA-256 only, so a database read never yields a
 * working link.
 */
import { workerEnv } from "./worker-env";

export const CLAIM_ROLES = [
  "Secretary or general manager",
  "Owner or director",
  "Head professional",
  "Marketing or membership",
  "Committee member",
  "Other",
] as const;

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sha256(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** A token as it arrives in a link: base64url, 43 characters. */
export function cleanToken(raw: unknown): string | null {
  const t = typeof raw === "string" ? raw.trim() : "";
  return /^[A-Za-z0-9_-]{40,64}$/.test(t) ? t : null;
}

export type ClaimReply = {
  ok: boolean;
  reason?: string;
  status?: string;
  course_name?: string;
  course_slug?: string;
  claimant_name?: string;
  claimant_role?: string;
  email?: string;
  domain_match?: boolean;
  already_claimed?: boolean;
  expired?: boolean;
  approved?: boolean;
  website?: string | null;
};

/** Call one web_claim_* function. Never throws: a failure is `{ ok: false, reason: "error" }`. */
export async function claimRpc(fn: string, args: Record<string, unknown>): Promise<ClaimReply> {
  const { SUPABASE_URL: url, SUPABASE_ANON_KEY: anon, WEB_API_KEY: key } = workerEnv;
  if (!url || !anon || !key) {
    console.error("[claims] not configured: SUPABASE_URL, SUPABASE_ANON_KEY and WEB_API_KEY are needed");
    return { ok: false, reason: "error" };
  }
  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ p_key: key, ...args }),
    });
    if (!res.ok) {
      console.error(`[claims] ${fn} failed`, res.status, (await res.text()).slice(0, 200));
      return { ok: false, reason: "error" };
    }
    return (await res.json()) as ClaimReply;
  } catch (err) {
    console.error(`[claims] ${fn} threw`, err);
    return { ok: false, reason: "error" };
  }
}

/**
 * Headers for every claim page: never indexed, and a token in the address
 * never travels to another site in a Referer. (`same-origin`, not
 * `no-referrer`: the latter makes browsers send `Origin: null` on the pages'
 * own form posts, which the origin check rightly refuses.)
 */
export const PRIVATE_HEADERS = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "same-origin",
  "X-Robots-Tag": "noindex, nofollow",
} as const;
