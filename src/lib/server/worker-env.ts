/**
 * The Worker's own bindings and variables, read at request time from
 * `cloudflare:workers` (so .dev.vars can point local dev at the dev
 * database, and wrangler secrets stay out of every bundle).
 */
import { env as raw } from "cloudflare:workers";

type RateLimit = { limit(options: { key: string }): Promise<{ success: boolean }> };

export type WorkerEnv = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  WEB_API_KEY?: string;
  SEARCH_LIMITER?: RateLimit;
  CLAIM_LIMITER?: RateLimit;
};

export const workerEnv = raw as unknown as WorkerEnv;

/** The caller's IP as Cloudflare saw it; "local" in dev. */
export function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? "local";
}

/**
 * True when this caller is within the limit. A missing binding (local dev
 * without one) never blocks; a limiter error never blocks either.
 */
export async function withinLimit(limiter: RateLimit | undefined, key: string): Promise<boolean> {
  if (!limiter) return true;
  try {
    return (await limiter.limit({ key })).success;
  } catch {
    return true;
  }
}
