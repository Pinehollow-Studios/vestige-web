# vestige-web

The vestige.golf website, rebuilt in **Astro 7** on **Cloudflare Workers** (live since
3 October 2026). The plan of record is `docs/rebuild-plan.md`; read it before changing
anything structural.

## Stack

- **Astro 7** (7.3 at the time of writing) with `@astrojs/cloudflare`. Pages are prerendered
  and served as Cloudflare static assets; only routes with `export const prerender = false`
  run in the Worker. Astro 7 post-dates most training data: check `node_modules/astro`'s
  types and docs.astro.build before relying on an API from memory.
- **Deploy:** `npm run deploy:staging` (staging Worker, never indexed) and
  `npm run deploy:production` (vestige.golf). `SITE_ENV` (astro.config.mjs) decides
  indexing: only `production` is indexable.
- The old Next.js site is in git history (before the rebuild merge) if anything needs
  looking up.

## The course directory's data (docs/course-pages-plan.md)

- Read only through `integrations/directory.mjs`, which calls the keyed
  `web_directory_export` before the build. The views are closed to the public key; never
  reopen them, and never read them from the browser or a client-side bundle.
- `src/generated/` (git-ignored) holds the build's copy. `directory.json` is read with fs
  by prerendered pages only; `search-index.json` is bundled into the Worker only. Neither
  is ever a public file.
- Never put a course outline on a page. Keep JSON-LD to identity (name, URL, geo,
  county, website).
- Keys (`DIRECTORY_BUILD_KEY`, `_DEV`, `WEB_API_KEY`, `DIRECTORY_WATERMARK_KEY`) live in
  `.env.local`, `.dev.vars` and Worker secrets. Never in git.

## Design: app-true, by rule

The site is built inside the app's design system (`~/Documents/VESTIGE/Vestige Design
System/`). Read its `FOR-AI.md` and `DESIGN-SYSTEM.md` before designing anything.

- Colours come only from `src/styles/vestige-colors.css`, copied from the kit by
  `npm run sync:kit`. Never hand-edit it, never invent a colour, never eyedrop.
- Two faces: **Manrope** for display (headings, hero numerals, the wordmark) and the
  **system UI face** for everything else. No third face.
- The canvas is the surface plus a faint mint-to-lime glow from the top (`--app-glow`).
  Sections that need a ground use the softened app gradient (`--app-wash`, `.v-band`):
  Tom's call on 3 Oct 2026, replacing the kit's flat pale blue. No other glow, glass on
  content, texture, vignette or resting shadow. Content sits on solid cards (`.v-card`).
- One accent, mint. The full-strength mint-to-lime gradient on the page's one primary
  call to action, progress beats (active step numbers, progress dots) and the mark.
- Sentence case everywhere. Nothing uppercase, nothing letterspaced.
- Light only (`data-theme="light"`), photo-led: full-bleed photos with the kit's onPhoto
  cream over a scrim; real app screens in `PhoneFrame`.
- Copy follows the kit's section 9: en-GB, no exclamation marks, no hype, honest numbers,
  curly quotes, a spaced hyphen rather than an em dash.
- Motion respects `prefers-reduced-motion`; never hijack scrolling.

## Commits

No AI attribution in commits or pull requests (no Co-Authored-By, no "Generated with").
