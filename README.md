# vestige-web

Everything served at [vestige.golf](https://vestige.golf) for Vestige Golf.
Renamed from `vestige-marketing` on 2026-09-23: the repo is the whole website,
not only its marketing pages, and it will also carry the public course
directory (`/courses/...`, decided by Tom and Jack on 2026-09-23, not yet
built). Today it holds the pitch, the app page, the progress map, the waiting list, the legal pages, and
the link-landing pages that universal links fall back to (`/u/<username>`,
`/course/<id>`, `/list/<id>`, `/society/join/<token>`). The site is live and
indexable.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind 4 · Manrope + Inter via `next/font/google` · React Email + Resend · Deploy on Vercel.

Design tokens mirror the iOS app's Atlas system (`vestige-ios/Vestige/DesignSystem/Theme.swift`). Dark-only.

## Local dev

```bash
npm run dev
# http://localhost:3000
```

Verify before a PR:

```bash
npx tsc --noEmit && npx eslint . && npm run build
```

## Site config

**`src/lib/siteConfig.ts`** is the single source of truth for everything the
site says about the product: brand strings, the nav, the hero, the stats strip,
the feature cards, the /app and /progress copy, the FAQ and the roadmap. The
course figures are not typed by hand there; they come from `progressConfig.ts`,
the same file the /progress map reads, so the hero, the stats and the emails
cannot drift apart.

Three values change with the release calendar:

- `BETA_LINK_SENT` + `TESTFLIGHT_PUBLIC_URL` — the **one** send of the public
  TestFlight link to the waiting list as it stands on 2 October 2026. There is
  no second send. Nothing is scheduled: Tom sends the link by hand, then sets
  `BETA_LINK_SENT = true` and `TESTFLIGHT_PUBLIC_URL` to the link, and deploys.
  The flag (read directly, or through `betaLinkStillToCome()`) switches every
  line written for people who can still make the list, and the URL sends
  `/u/<handle>` visitors without the app to TestFlight instead of the waiting
  list.
- `appStoreUrl` — null until the 1.0 listing is live (January 2027). When set,
  the hero swaps the waitlist form for the App Store badge.

Copy follows the app's rule (`vestige-ios/CLAUDE.md` §7.7): no em dashes in
user-facing text, ever.

## The map

The site covers Great Britain. **`src/lib/progressConfig.ts`** holds the three
countries, the counties mapped so far and the course figures; the map, the
ledger, the stats strip and the emails all derive from it. England is finished
and shows as a milestone; Scotland and Wales are drawn as single "still to
come" shapes until their courses are mapped, when their regions join
`counties.ts` (the region model for each is decided then).

The geometry is generated, never hand-edited:

| Script | Writes | Source |
|---|---|---|
| `scripts/build-county-paths.mjs` | `src/components/progress/counties.ts` (England's 47 counties) and `countries.ts` (Wales, Scotland) in one shared projection | evansd/uk-ceremonial-counties (fetched, cached in `scripts/data/counties.json`) and `scripts/data/countries-source.json`, a copy of the app's `coming-soon-countries.json` |
| `scripts/build-england-outline.mjs` | `src/components/progress/englandOutline.ts`, the coastline the finale draws | traced from `counties.ts`, so re-run it after the one above |
| `scripts/build-britain-path.mjs` | `src/components/marketing/britain.ts`, the small silhouette and course pins behind the feature card and the corner atlas | Natural Earth 1:50m countries |
| `npm run build:map` | `public/progress/atlas-current.png`, the coverage map in the progress email | the files above plus `progressConfig` |

The brand artwork does not live here — see **Brand assets** below.

## Brand assets

Nothing brand-shaped in this repo is drawn here. The app icon is authored
once, in **vestige-ios**, as an Icon Composer document
(`Vestige/Resources/AppIcon.icon` — a navy gradient ground plus a transparent
globe; see `vestige-ios/docs/app-icon.md`). The website re-renders from it:

```bash
./scripts/build-brand-icons.sh      # needs Xcode + `brew install imagemagick`
```

That writes, and is the only thing that should write:

| File | What it is |
|---|---|
| `src/app/favicon.ico` | 16/32/48 tile — the browser tab |
| `src/app/icon.png` | 512 tile — high-DPI `rel="icon"`, bookmarks, search results |
| `src/app/apple-icon.png` | 180 squared tile — iOS "Add to Home Screen" |
| `public/brand/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Android / PWA, wired up in `src/app/manifest.ts` |
| `public/brand/vestige-globe.png` | the bare globe, cropped — the mark beside the wordmark (`FwMark`), the link-landing and 404 heroes, and the share card |
| `public/brand/vestige-globe-128.png` | the same mark at a fixed size for emails, which can't use `next/image` |
| `public/brand/vestige-app-icon.png` | the full 1024 tile, for anywhere an app icon is asked for |

Two rules. **The tile is grounded, the mark is not** — the globe alone reads as
a logo next to type; the navy tile is what a Home Screen or a tab expects.
And **the maskable icon is squared** while the others keep their rounded
corners, because Android crops that one to its own shape and a pre-rounded PNG
comes back double-rounded.

If the app icon changes, re-run the script — never edit these files by hand,
and never redraw the globe here.

The share card (`src/app/opengraph-image.tsx`) is generated from JSX at build
time and inlines the mark as a data URI, since Satori has no filesystem at
render time. It is a root-segment file, so every route inherits it.

## Waitlist (Resend contacts + segment)

The waitlist form calls a server action that, when configured, (1) upserts a
global Resend **contact** and (2) adds it to a **segment** — the group the launch
broadcast will target. (Resend retired "Audiences" in 2025; contacts are now
global and grouped by segments.)

**Without `RESEND_API_KEY` + `RESEND_WAITLIST_SEGMENT_ID`**, the action runs in
*noop mode*: it logs the email to the server console and shows the success
state. The form is fully usable in dev without keys.

**To wire it up:**

1. Sign up at https://resend.com and verify the sending domain.
2. **Contacts → Segments** → create a segment (e.g. "Vestige launch waitlist").
3. **API Keys** → create a **Full access** key. Writing contacts needs more than
   the send-only scope, so a `sending_access` key will 403 here.
4. Locally: `cp .env.example .env.local` and fill in `RESEND_API_KEY` +
   `RESEND_WAITLIST_SEGMENT_ID`.
5. On Vercel: Project Settings → Environment Variables → add both for Production
   and Preview.

The action becomes live the next time the server boots. The key is used only in
the server action and is never exposed to the browser.

## Emails (React Email)

Templates live in `src/emails/`, built with [React Email](https://react.email).
The shared branded shell + tokens are in `src/lib/emailShell.tsx` (mirrors the
site — dark, mint accent, serif display, email-safe styling).

Design / tinker locally:

```bash
npm run email   # preview at http://localhost:3001 — hot-reloads as you edit
```

- **`welcome.tsx`** — *transactional*. Fires from the `joinWaitlist` action when a
  **new** contact joins (send-once: existing contacts aren't re-welcomed). Sent
  via `src/lib/email.tsx` (`sendWelcomeEmail`), non-blocking and failure-tolerant
  — a failed send never turns a successful signup into an error.
- **`launch.tsx`** — the launch announcement, sent as a Resend **Broadcast** to
  the "Vestige launch waitlist" segment (every signup is auto-added to it). Its
  unsubscribe link uses `{{{RESEND_UNSUBSCRIBE_URL}}}`, which Resend resolves at
  send time (it shows literally in the local preview).

A draft broadcast already exists (id `865ecb34-2426-4c07-b8ca-6eb4791af0a2`,
Resend → Broadcasts). After editing `launch.tsx`, refresh it and send when live:

```bash
resend broadcasts update 865ecb34-2426-4c07-b8ca-6eb4791af0a2 \
  --react-email src/emails/launch.tsx
resend broadcasts send 865ecb34-2426-4c07-b8ca-6eb4791af0a2   # launch day
```

## Deploy

```bash
# One-time: connect the Vercel project to this repo.
# After that, every push to main auto-deploys.
```

Vercel detects Next.js automatically. Set the two Resend env vars in the Vercel project before the first deploy if you want live mode out of the gate.

## Structure

```
src/
├── app/
│   ├── page.tsx                 # The pitch (home)
│   ├── app/                     # /app — the three small ideas
│   ├── progress/                # /progress — the map so far
│   ├── privacy/ terms/ guidelines/ beta-terms/   # Legal pages (source in legal/)
│   ├── u/[username]/ course/[id]/ list/[id]/ society/join/[token]/
│   │                            # Link-landing pages universal links fall back to
│   ├── .well-known/apple-app-site-association/  # Associated Domains payload
│   ├── unsubscribe/             # Email unsubscribe landing
│   ├── actions.ts               # joinWaitlist server action
│   ├── globals.css              # Atlas tokens (mirrors iOS Theme.swift)
│   ├── layout.tsx               # Fonts, metadata, root <html>
│   ├── opengraph-image.tsx      # Share card, generated at build time
│   ├── robots.ts / sitemap.ts / manifest.ts
│   └── not-found.tsx
├── components/
│   ├── marketing/               # Pitch composition, features, stats strip, FAQ, roadmap, closing CTA, footer, waitlist field
│   ├── progress/                # The county map and its legend
│   └── LinkLanding.tsx          # Shared shell for the link-landing pages
├── emails/                      # welcome.tsx · launch.tsx · update.tsx (React Email)
└── lib/
    ├── siteConfig.ts            # Single source of truth for everything the site says
    ├── progressConfig.ts        # Course / county figures the copy and map share
    ├── resend.ts                # Resend waitlist client — contacts + segment (server-only)
    ├── email.tsx / emailShell.tsx   # Sending + the shared branded shell
    ├── waitlistDb.ts / waitlistCount.ts / unsubscribe.ts
    └── sources.ts
```

## Voice

Mirror the iOS app: short, declarative, en-GB. Source Serif 4 Medium for display lines, Inter for UI. UPPERCASE eyebrows at 11px with +0.6 tracking. Sentence case on everything else. Smart apostrophes throughout.
