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

## Design: app-true, by rule

The site is built inside the app's design system (`~/Documents/VESTIGE/Vestige Design
System/`). Read its `FOR-AI.md` and `DESIGN-SYSTEM.md` before designing anything.

- Colours come only from `src/styles/vestige-colors.css`, copied from the kit by
  `npm run sync:kit`. Never hand-edit it, never invent a colour, never eyedrop.
- Two faces: **Manrope** for display (headings, hero numerals, the wordmark) and the
  **system UI face** for everything else. No third face.
- The canvas is the surface plus one faint blue glow from the top. No other glow, glass on
  content, texture, vignette or resting shadow. Content sits on solid cards (`.v-card`).
- One accent, mint. The mint-to-lime gradient only on the page's one primary call to
  action, a completion or progress beat, and the mark.
- Sentence case everywhere. Nothing uppercase, nothing letterspaced.
- Light only (`data-theme="light"`), photo-led: full-bleed photos with the kit's onPhoto
  cream over a scrim; real app screens in `PhoneFrame`.
- Copy follows the kit's section 9: en-GB, no exclamation marks, no hype, honest numbers,
  curly quotes, a spaced hyphen rather than an em dash.
- Motion respects `prefers-reduced-motion`; never hijack scrolling.

## Commits

No AI attribution in commits or pull requests (no Co-Authored-By, no "Generated with").
