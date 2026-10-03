# vestige.golf rebuild - the plan

**Agreed:** 3 October 2026 (Tom, in conversation). A rebuild, not a port: new structure,
new function and a new level of craft, built in **Astro 7** and hosted on **Cloudflare
Workers** (free plan). It replaces the Next.js site and the last of Vercel.

**Supersedes:** the Next.js-specific parts of `docs/site-after-the-beta-plan.md` (slices
3-8 now happen on Astro; slices 1-2 shipped in #85) and the architecture sections of
`docs/course-directory-plan.md` (its data, page and editorial decisions still stand).

---

## 1. Decisions

| Question | Call |
|---|---|
| Design language | **App-true, photo-led** (refined 3 Oct). Built from the app's design system (`~/Documents/VESTIGE/Vestige Design System/`): its tokens, mint, Manrope. Loosened for the web to feel lighter and warmer: full-bleed photography with cream text over a scrim (the kit's `onPhoto` tokens), bigger editorial type, rounder friendlier shapes, and the kit's map greens, list accents (sand, moss, copper, delft) and amber as supporting colours. |
| Light or dark | **Light only** (refined 3 Oct). One appearance, designed around photography; `data-theme="light"` holds it even on a dark device. |
| Type | **Manrope for display** (headings, hero numerals, the wordmark) and **the visitor's system UI face for body** (SF Pro on Apple devices), exactly as the kit specifies for the web (§7). Both free. No third face. |
| Photography | **Photo-led, lots of it.** Tom's and Jack's own (fewer than 10 today) plus **free licensed stock** (Unsplash, Pexels), always credited. A stock photo is never captioned as a named course unless the course is verified. People: **a mix**, mostly courses and landscapes with some candid golf among friends. |
| Other design elements | **Real app screens** in phone frames, **the map of Britain illustrated** (filling in as you scroll), **simple course sketches** (line drawings of holes and landmarks). |
| Homepage hero | **A full-width British course photo, "How many have you played?", and a course search box over it** (the AllTrails / Top 100 pattern), leading straight into the directory. |
| Words | **Warmer, with a little wit.** Still the clubhouse friend (brief, honest, en-GB) but less spec-sheet. |
| Release 1 | **Home + the app + the course directory**, all on Astro: the whole current site replaced in one cutover. One framework from day one. |
| Then, as fast follow-ups | **For clubs** (with the enquiry form), **Journal** (replaces /progress), **About + how we count**. Partners and a press kit later. |
| Club offer on the site | **Deliberately vague and enquiry-only**: no prices, no package detail, nothing that teaches a golfer what the data holds. Named offers: **claim your course page** and the **"Collect us on Vestige" badge**. Everything else is "talk to us". |
| Enquiries | Stored in **Supabase** (visible in the bunker later) and emailed to **hello@pinehollow.studio**, with an automatic confirmation to the sender. |
| Motion | **Two signature scroll scenes** on the homepage (the map, the app walkthrough). Everywhere else quiet; the directory calm and fast. |
| Review | **The homepage is built for real on a private staging address first** (behind Cloudflare Access). Tom and Jack review it; the rest is built to match. |
| Timing | **As soon as possible**, in pieces. |

## 2. Why the current site reads as AI-made, and the rules that fix it

The current site wears the generic 2025 "dark SaaS" template: dark ground, decorative
mint-to-lime gradients, glow halos, a glass pill with a shimmer, one gradient italic word in
a centred headline, a marquee, a count-up stats strip, everything centred, uppercase
eyebrows. Much of that **contradicts the app's own design system**, which removed glows,
decorative gradients, glass finish and the eyebrow in September 2026. The rebuild follows
the system as it stands now:

- **The canvas:** `surface` plus one faint blue glow from the top. Nothing else: no glow,
  hatch, texture, vignette or resting shadow. Content sits on solid cards.
- **One accent, mint**, from the token for the appearance (light fill `#14CCA0`, light ink
  `#0FAF88`; dark `#5BE4C3`). **Never `#5BE4C3` on a light page.**
- **The gradient is rationed:** the one hero call to action per page, a completion beat
  (a county flipping to mint), the brand mark. Nowhere else.
- **One loud thing per composition** - a numeral, the map, one photograph.
- **Sentence case; no uppercase, no tracked labels** (the eyebrow is retired).
- **Copy per the system's section 9** (en-GB, no exclamation marks, no hype, honest
  numbers, and the system's rule of a spaced hyphen rather than an em dash).
- **The map's own language:** ocean-gradient sea, counties filling moss to pine to peak and
  flipping to mint at 100%, no labels, no roads, Scotland and Wales styled as coming soon.
- **Real material over decoration:** real app screens in both appearances, real course
  names and numbers, credited photographs, named founders and company details.
- **Contrast verified, not eyeballed** (WCAG AA), and reduced motion respected everywhere.

Tokens are generated from `assets/colors/vestige-colors.json` (75 tokens, light and dark),
never hand-copied, so the site cannot drift from the app.

## 3. Site map

| Path | Page | Release |
|---|---|---|
| `/` | Home: the two signature scenes, the way into the directory, the 1.0 signup | 1 |
| `/app` | What the app does, Pro (Honours) at a glance, FAQ, the 1.0 signup | 1 |
| `/courses`, `/courses/<slug>`, `/courses/county/<slug>`, `/courses/list/<slug>`, `/courses/style/<slug>` | The directory (URLs unchanged) | 1 |
| `/u/<handle>`, `/course/<uuid>`, `/list/<id>`, `/society/join/<token>`, `/beta` | App-link fallbacks; `/course/<uuid>` 301s to its course page | 1 |
| `/.well-known/apple-app-site-association` | Served as a static file, exact bytes, `application/json`, no redirect | 1 |
| `/privacy`, `/terms`, `/guidelines`, `/beta-terms`, `/unsubscribe` | Legal pages and the unsubscribe handler | 1 |
| `/clubs` (+ `/clubs/claim`, `/clubs/badge`) | Vestige for Clubs: enquiry-only, the form | 2 |
| `/journal`, `/journal/<slug>` | Progress notes and editorial; absorbs `/progress` (which redirects) | 3 |
| `/about` (+ how we count) | Jack and Tom, Pinehollow Studios Ltd, company number, the methodology | 3 |

## 4. The two signature scenes (homepage)

1. **The map.** Great Britain drawn from the county shapes the site already has, in the
   app's map palette. As you scroll, England's counties fill county by county, then the
   view zooms from Britain to one county and its completion ("34 of 47") and on to a course.
   SVG built at build time, driven by GSAP ScrollTrigger; a static end state under reduced
   motion.
2. **The app, for real.** A pinned phone showing real screens (light or dark, following the
   visitor) stepping through the loop: find a course, mark it played, watch the county fill,
   compare with friends. Short muted video or stills, not a fake render.

Everything else uses CSS scroll-driven reveals (no JavaScript) and native page transitions.
No smooth-scroll library, no scroll hijacking.

## 5. Architecture

- **Astro 7** with `@astrojs/cloudflare`; static by default, `prerender = false` only on the
  app-link fallbacks, the form action and the rebuild webhook.
  `prerenderEnvironment: 'node'` so build-time image tools run.
- **Data:** a content-layer loader paging through the Supabase PostgREST views (the
  existing `src/lib/directory` code carries over).
- **Rebuilds:** the bunker marks data dirty; a Cloudflare deploy hook fires **at most every
  10-15 minutes** (the free plan builds one at a time, 20-minute timeout, 3,000 minutes a
  month). Course edits appear within minutes, not instantly.
- **Share images:** satori + resvg (WASM) at build, cached by content hash. Watch the
  **20,000 files per deploy** free-plan cap; move images to R2 if Scotland and Wales push
  the count up.
- **Motion:** CSS scroll-driven animations (iOS 26+) and native View Transitions; GSAP
  (free, including ScrollTrigger) only inside the two scenes.
- **Maps:** build-time SVG for Britain and counties; MapLibre with OpenStreetMap-based
  tiles (PMTiles on R2) for course-level maps when we add them. No Mapbox fees.
- **Forms:** Astro Actions → Cloudflare Turnstile → Supabase (insert-only RPC, via the
  `migration` skill) → Resend (notification to hello@ + auto-reply). Honeypot and a
  minimum time-to-submit as well.
- **Email:** React Email templates carry over for the welcome and broadcast emails.
- **Analytics:** Cloudflare Web Analytics (free, cookieless) and Search Console.
- **Content:** course copy stays in the bunker; the journal in Keystatic (or Sveltia if
  Keystatic lags Astro 7).
- **Staging:** a separate Worker at `next.vestige.golf`, behind Cloudflare Access.

## 6. Releases

### Release 1 - the whole current site, rebuilt

1. **Foundations:** Astro 7 app in this repo (branch `rebuild/astro`), tokens generated from
   the design kit, Manrope via Astro's Fonts API, the canvas, base components, both
   appearances, staging deploy behind Access.
1b. **Built (3 Oct 2026):** Astro 7.3 + Cloudflare adapter, tokens synced from the kit
   (`npm run sync:kit`), `foundation.css`, Base layout, header, footer with the UK company
   disclosure, robots and 404, staging Worker `vestige-web-staging` (never indexed).
2. **The homepage, for review:** the two scenes, the directory way-in, the 1.0 signup.
   **Review gate with Tom and Jack.**
3. **The app page, legal pages, app-link fallbacks, AASA, `/beta`, unsubscribe**, the
   signup action and welcome email.
4. **The directory:** course, county, list and style pages, search, share images,
   sitemaps, JSON-LD, the staged indexing switch (hubs first, then ready course pages),
   the `/course/<uuid>` redirect, the batched rebuild hook (bunker change).
5. **Cutover:** move vestige.golf and www to the Worker, verify the AASA on Apple's CDN,
   Search Console, then close Vercel for good.

### Release 2 - Vestige for Clubs
`/clubs` with claim-your-page and the badge, an enquiry-only "talk to us" for everything
else, the enquiry form and its Supabase table, the privacy policy updated for enquiries
(solicitor).

### Release 3 - Journal and About
Keystatic journal (absorbing `/progress`), About with Jack and Tom and "how we count".

### Later
Partners, press kit, App Store pre-order (if the spike says yes), Scotland and Wales in the
directory, course-level maps.

## 7. What Tom needs to supply

- **App screenshots** of the key screens in light and dark (home map, a county, a course,
  log a round, friends, Pro), current build.
- **Photographs** (yours and Jack's), and any licensed images with their credit lines.
- **A Cloudflare Access policy** for `next.vestige.golf` (the same Google gate as the bunker).
- **Jack's review** at the homepage gate, and his writing for the journal and "how we count".

## 8. Risks

- The free plan's 20,000-file and build limits (watch file counts in CI).
- Rebuild latency replacing today's instant revalidation.
- The AASA served wrongly would quietly break universal links (verify after cutover).
- Firefox has no scroll-driven animations yet (feature-detect; content never depends on
  motion).
- Ecosystem catching up to Astro 7 (Keystatic, OG tooling): check before relying on it.
- The directory's go-live blockers from `site-after-the-beta-plan.md` slice 4 still apply
  (provenance of par and yardage, solicitor, attribution, the Index threshold).
