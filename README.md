# vestige-web

[vestige.golf](https://vestige.golf): the website for Vestige Golf, by Pinehollow Studios.
Rebuilt in October 2026 in **Astro 7** on **Cloudflare Workers** (plan of record:
`docs/rebuild-plan.md`).

## What's here

- **The homepage, /app** - photo-led, light, built inside the app's design system.
- **The course directory, /courses** - every course in England (county, list and style
  pages), prerendered at build from the public Supabase views. Noindex until
  `DIRECTORY_INDEXABLE` (src/lib/directory/config.ts) is switched on.
- **The 1.0 signup** (/api/notify) and **unsubscribe** (/unsubscribe) - Resend, with a
  Supabase mirror and the welcome email.
- **App-link fallbacks** - /u, /course, /list, /society/join, plus /beta and the
  apple-app-site-association file (public/.well-known, served as JSON via public/_headers).
- **Legal pages** - rendered from `legal/*.md`, the canonical sources.

## Working on it

```bash
npm install
npm run dev               # http://localhost:4321
npm run check             # types
npm run sync:kit          # refresh colours and marks from the design kit
npm run deploy:staging    # build + deploy the staging Worker (never indexed)
npm run deploy:production # build + deploy vestige.golf
npm run deploy:www        # the www.vestige.golf -> vestige.golf redirect Worker
```

Deploys need `npx wrangler login` once. Production secrets (`RESEND_API_KEY`,
`RESEND_WAITLIST_SEGMENT_ID`, `DIRECTORY_REVALIDATE_SECRET`, later `DEPLOY_HOOK_URL`) live
on the Worker: `npx wrangler secret put <NAME>`. Public build values are in
`.env.production`.

## Design rules

See `AGENTS.md`: the app's design system, light only, Manrope for display with the
system face for text, one accent, photos captioned only with confirmed places, no em
dashes in copy.

## Photos and screens

`src/assets/photos` (Tom's and Jack's own, location data stripped; captions in
`src/data/photos.ts`) and `src/assets/screens` (real app screenshots, status bars
normalised by `scripts/clean-status-bar.sh`).
