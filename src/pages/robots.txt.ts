import type { APIRoute } from "astro";
import { SITE_ENV } from "astro:env/server";

/**
 * Production is open to search engines; every other deployment (staging,
 * local) is closed, as a second lock beside the noindex meta in Base.astro.
 */
export const GET: APIRoute = ({ site }) => {
  const body =
    SITE_ENV === "production"
      ? `User-agent: *\nAllow: /\nDisallow: /unsubscribe\n\nSitemap: ${new URL("/sitemap-index.xml", site)}\n`
      : "User-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
