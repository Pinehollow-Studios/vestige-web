// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

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
  adapter: cloudflare({
    // Prerender in Node, so build-time tools with native or WASM parts
    // (share-image rendering, image processing) run during the build.
    prerenderEnvironment: "node",
    // Images are optimised at build time; nothing is resized at request time.
    imageService: "compile",
  }),
  // No logins on this site, so no sessions (and no KV store for them).
  session: false,
  integrations: [sitemap()],
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
