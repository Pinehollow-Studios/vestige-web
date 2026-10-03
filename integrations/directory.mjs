/**
 * The course directory's data, fetched once before Astro builds anything.
 *
 * The directory views are closed to the public key (vestige-ios migration
 * 20261003130000). The build reads them through `web_directory_export`, which
 * checks a build key; the database holds only the key's SHA-256. The source
 * is chosen by SITE_ENV, never by whichever .env file happens to be present:
 *
 *   production | staging  SUPABASE_URL + SUPABASE_ANON_KEY (.env.production)
 *                         with DIRECTORY_BUILD_KEY
 *   anything else         DIRECTORY_SUPABASE_URL + DIRECTORY_SUPABASE_ANON_KEY
 *                         (.env.local, the dev project) with DIRECTORY_BUILD_KEY_DEV
 *
 * It writes two git-ignored files:
 *   src/generated/directory.json     everything, read by the prerendered pages
 *                                    (lib/directory/data.ts) and never bundled
 *   src/generated/search-index.json  names, slugs and counties only, bundled into
 *                                    the Worker for /api/search. Never a public file.
 *
 * Coordinates leave here carrying a keyed fingerprint (DIRECTORY_WATERMARK_KEY):
 * each 3-decimal value gains a fourth digit chosen by an HMAC of the course slug.
 * The digit sits inside the 3-decimal cell (+/- 0.0004), so the position is exactly
 * as accurate as before, and a copy of our coordinates carries our pattern.
 */
import { createHmac } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { loadEnv } from "vite";

const OUT_DIR = new URL("../src/generated/", import.meta.url);
const FULL = new URL("directory.json", OUT_DIR);
const SEARCH = new URL("search-index.json", OUT_DIR);
const DEV_MAX_AGE_MS = 60 * 60 * 1000;

function source(env) {
  const live = env.SITE_ENV === "production" || env.SITE_ENV === "staging";
  const url = live ? env.SUPABASE_URL : env.DIRECTORY_SUPABASE_URL;
  const anon = live ? env.SUPABASE_ANON_KEY : env.DIRECTORY_SUPABASE_ANON_KEY;
  const key = live ? env.DIRECTORY_BUILD_KEY : env.DIRECTORY_BUILD_KEY_DEV;
  const names = live
    ? "SUPABASE_URL, SUPABASE_ANON_KEY and DIRECTORY_BUILD_KEY"
    : "DIRECTORY_SUPABASE_URL, DIRECTORY_SUPABASE_ANON_KEY and DIRECTORY_BUILD_KEY_DEV";
  if (!url || !anon || !key) throw new Error(`The course directory has no data source: set ${names}.`);
  return { url: url.replace(/\/+$/, ""), anon, key, label: live ? "production" : "dev" };
}

/** A fourth decimal inside the 3-decimal cell, chosen by the key and the slug. */
function watermark(value, slug, axis, key) {
  if (value == null || !key) return value;
  const digit = createHmac("sha256", key).update(`${slug}:${axis}`).digest()[0] % 9; // 0-8
  const base = Math.round(Number(value) * 1000) / 1000;
  const offset = (digit - 4) / 10000; // -0.0004 .. +0.0004
  return Number((base + offset).toFixed(4));
}

async function fetchDirectory(env, logger) {
  const { url, anon, key, label } = source(env);
  const res = await fetch(`${url}/rest/v1/rpc/web_directory_export`, {
    method: "POST",
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ p_key: key }),
  });
  if (!res.ok) {
    throw new Error(`Reading the directory (${label}) failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  const data = await res.json();
  if (!Array.isArray(data?.courses) || data.courses.length === 0) {
    throw new Error(`The directory export (${label}) came back empty.`);
  }
  const wm = env.DIRECTORY_WATERMARK_KEY;
  if (!wm) logger.warn("DIRECTORY_WATERMARK_KEY is not set: coordinates go out unmarked.");
  for (const c of data.courses) {
    c.lat = watermark(c.lat, c.slug, "lat", wm);
    c.lng = watermark(c.lng, c.slug, "lng", wm);
  }
  logger.info(`Directory: ${data.courses.length} courses from ${label}.`);
  return data;
}

function write(data) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(FULL, JSON.stringify(data));
  const counties = [...new Set(data.courses.map((c) => c.county_name))].sort();
  const at = new Map(counties.map((n, i) => [n, i]));
  writeFileSync(
    SEARCH,
    JSON.stringify({
      counties,
      rows: data.courses.map((c) => [c.name, c.slug, at.get(c.county_name)]),
    })
  );
}

function fresh() {
  try {
    return existsSync(SEARCH) && Date.now() - statSync(FULL).mtimeMs < DEV_MAX_AGE_MS;
  } catch {
    return false;
  }
}

export default function directory() {
  return {
    name: "vestige-directory",
    hooks: {
      "astro:config:setup": async ({ command, logger }) => {
        const mode = command === "build" ? "production" : "development";
        const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
        // A build always reads afresh; dev and check reuse a recent copy.
        if (command !== "build" && fresh()) return;
        if (command !== "build" && command !== "dev" && existsSync(FULL)) return;
        write(await fetchDirectory(env, logger));
      },
    },
  };
}

/** For lib/directory/data.ts: the copy the integration wrote. */
export function readDirectoryFile() {
  return JSON.parse(readFileSync(FULL, "utf8"));
}
