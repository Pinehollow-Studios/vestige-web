// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import directory from "./integrations/directory.mjs";

/**
 * vestige.golf on Astro 7 + Cloudflare Workers (docs/rebuild-plan.md).
 *
 * Static by default: every page is prerendered at build and served as a
 * Cloudflare static asset (free, unlimited). Only routes that opt out with
 * `export const prerender = false` run in the Worker.
 *
 * SITE_ENV picks the deployment: "production" for vestige.golf, anything
 * else (staging, local) is kept out of search engines (see Base.astro and
 * src/pages/robots.txt.ts).
 */
export default defineConfig({
  site: "https://vestige.golf",
  trailingSlash: "never",
  // Pages build as /app.html rather than /app/index.html, so Cloudflare
  // serves /app itself instead of redirecting to /app/ (the old site's URLs
  // never had a trailing slash).
  build: { format: "file" },
  adapter: cloudflare({
    // Prerender in Node, so build-time tools with native or WASM parts
    // (share-image rendering, image processing) run during the build.
    prerenderEnvironment: "node",
    // Images are optimised at build time; nothing is resized at request time.
    imageService: "compile",
  }),
  vite: {
    build: {
      // Vite's default CSS minifier (Lightning CSS) folds animation-timeline
      // into the animation shorthand ("animation: linear both fill --map"),
      // which browsers reject outright, so every scroll-driven animation died
      // in production (3 Oct 2026). esbuild leaves the longhand alone.
      cssMinify: "esbuild",
    },
  },
  // No logins on this site, so no sessions (and no KV store for them).
  session: false,
  // Astro's blanket same-origin check on POSTs would block RFC 8058
  // one-click unsubscribes, which mail providers POST from their own
  // servers. /unsubscribe is protected by its signed token instead, and
  // /api/notify checks the Origin itself.
  security: { checkOrigin: false },
  integrations: [
    // First: fetches the course directory before anything is built.
    directory(),
    sitemap({
      // Search engines get the main pages and legal pages. Left out: the
      // course directory until its indexing switch is on
      // (src/lib/directory/config.ts - flip both together), /beta (shared by
      // hand only) and the 404.
      filter: (page) => !/\/(courses|beta|404|clubs\/thanks)(\/|$)/.test(new URL(page).pathname),
    }),
  ],
  env: {
    schema: {
      // Read at build for prerendered pages and at request time for Worker
      // routes (wrangler.jsonc vars). Defaults to "development": unindexed.
      SITE_ENV: envField.enum({
        context: "server",
        access: "public",
        values: ["production", "staging", "development"],
        default: "development",
      }),
      // Public: the production Supabase project and its anon key (RLS-gated).
      SUPABASE_URL: envField.string({ context: "server", access: "public", optional: true }),
      SUPABASE_ANON_KEY: envField.string({ context: "server", access: "public", optional: true }),
      // Secrets, set on the Worker with `npx wrangler secret put`.
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      RESEND_WAITLIST_SEGMENT_ID: envField.string({ context: "server", access: "secret", optional: true }),
      UNSUBSCRIBE_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
      DIRECTORY_REVALIDATE_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
      DEPLOY_HOOK_URL: envField.string({ context: "server", access: "secret", optional: true }),
      // The Worker's key for the web_claim_* database functions (club claims).
      WEB_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
  fonts: [
    {
      // The display face. Body copy uses the visitor's system UI face
      // (SF Pro on Apple devices), as the app does: design kit §7.
      provider: fontProviders.fontsource(),
      name: "Manrope",
      cssVariable: "--font-manrope",
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
  ],
});
