# The course directory - build plan

**Status:** phase 1 BUILT 2026-09-23 - the data migration `20260923110000_web_directory` on DEV (prod pending Tom), the route-group split and the course / county / list pages on branch `feat/course-directory`, noindex, uncommitted. Tom's phase-1 call: **no course shape** yet (overrides §3 item 7 for now).
**Where it lives:** this repo (`vestige-web`, renamed from `vestige-marketing` on
2026-09-23), on the same domain as the marketing pages. The iOS side is recorded in
`vestige-ios/CLAUDE.md` §16.21.

---

## 1. What we are building

A public, Google-indexable page for every golf course in Britain, plus the pages
that tie them together. The facts, Jack's writing and the map are free on the web.
The personal layers - your map, your rounds, friends who have played it, what a
course does for your collection, the full hole guides (Pro) - are the reason to
open the app.

### Decisions already made (Tom, 2026-09-23)

| Decision | Call |
|---|---|
| Domain and repo | `vestige.golf`, this repo, its own route group. Split later via Next multi-zones only if it outgrows the site; no URL would change. |
| Course URLs | **Flat and permanent**: `/courses/<slug>`. Courses do change county (Ilkley, Sunningdale Heath on 2026-09-13), so the county is never in the path. |
| Vestige Index | Shown publicly **only above a threshold**, never marked down. The threshold is open (§4.4). |
| Appearance | The directory **follows the reader's light / dark**. The dark-only marketing pages stay as they are. |
| Timing | **As soon as possible.** Build now; index as early as the pages are good enough (§6). Search ranking is slow for a new section (§5.5), so time is the scarcest input. |

### The page map

| URL | Page | Notes |
|---|---|---|
| `/courses` | The front door | Search, browse by style, county, list and architect. |
| `/courses/<slug>` | A course | The core page (§3). |
| `/courses/county/<slug>` | A county | Every course in it, the map, its best courses. `county` is a reserved word, never a course slug. |
| `/courses/list/<slug>` | A curated list | Top 100 England and the rest, in order. |
| `/courses/architect/<slug>` | An architect | Needs the `architect` field (§4.3). Phase 3. |
| `/course/<uuid>?n=` | Old share links | Looks the uuid up and 308-redirects to `/courses/<slug>`; falls back to today's landing page on a miss. |

---

## 2. Architecture

Researched against the Next docs shipped in `node_modules/next/dist/docs/`
(Next **16.3.4**). Several things differ from Next 13-15 knowledge; they are called
out.

### 2.1 Route groups

- Move today's pages into `app/(marketing)/` and create `app/(directory)/courses/...`,
  **each with its own root layout**. URLs do not change.
- Why separate root layouts: `globals.css` sets `html, body { background: #06090E }`,
  and global CSS is never unloaded on client-side navigation, so one shared root
  layout would drag the dark marketing styles into the directory.
- Split `globals.css` into shared tokens plus one file per group. The directory
  layout sets `viewport.colorScheme: 'light dark'` and a `themeColor` per scheme.
- Moving between the two groups is a full page load. That is fine.
- `not-found.tsx` loses its single parent: enable `experimental.globalNotFound` or
  give each group its own.
- The root `opengraph-image.tsx` moves into `(marketing)`; `sitemap.ts`, `robots.ts`
  and `manifest.ts` can stay at `app/`.
- **Timing:** this restructure touches every marketing page, so it happens **after the
  2 Oct send** and is verified with `next build` plus a click-through before deploy.

### 2.2 Data

- One new **public view** on prod, owned by the iOS repo's `supabase/migrations/`
  (additive, expand/contract-safe): `SELECT` granted to `anon` on the view alone;
  the base tables stay `authenticated`-only. Columns in §4.1.
- Read server-side only, copying `src/lib/waitlistDb.ts` (`import "server-only"`,
  plain REST, `SUPABASE_URL` / `SUPABASE_ANON_KEY`), as `GET` with
  `next: { tags: ['courses', 'course:<slug>'] }`.
- The browser never talks to Supabase from these pages.

### 2.3 Caching - stay on the "Previous Model"

- Next 16 ships **Cache Components** (`use cache`, `cacheLife`, `cacheTag`) and
  documents the old approach as the "Previous Model". Turning Cache Components on is
  app-wide, removes `dynamicParams` / `revalidate` segment config, and serves
  not-yet-built pages as a streamed "App Shell", which is worse for crawlers. **Do not
  enable it.**
- `generateStaticParams` returns every course slug; `dynamicParams = true` so a new
  course renders on first request and is then cached.
- `revalidateTag` now takes **two arguments**: `revalidateTag(tag, { expire: 0 })` is
  the form for calls from a webhook. Pages rebuild on their next visit, not on the call.

### 2.4 Keeping pages fresh

- `app/api/revalidate/route.ts`: a `POST` that checks a shared secret and calls
  `revalidateTag('course:<slug>', { expire: 0 })` (plus the county and list pages the
  course appears on).
- The **bunker** calls it after a course, list or county save. Jack's edit is live on
  the next visit, seconds later, with no deploy.

### 2.5 Search plumbing

- **Metadata:** `generateMetadata` per page; `alternates.canonical` self-referencing
  and absolute (`metadataBase` in the directory layout). Child metadata **replaces**
  a parent's `robots` / `openGraph` rather than merging.
- **Noindex until ready:** `robots: { index: false, follow: false }` in the directory
  layout. **Do not** also block `/courses` in `robots.ts`, or Google never sees the
  noindex.
- **Sitemap:** a nested `app/(directory)/courses/sitemap.ts`. 2,500 URLs fit one file
  (Google's limit is 50,000). `lastmod` from `updated_at` only (Google ignores
  `priority` and `changefreq` and uses `lastmod` only when it is accurate). List it in
  `robots.ts` → `sitemap`.
- **JSON-LD** (a plain `<script type="application/ld+json">`, `<` escaped - the root
  layout already does this):
  - course: `GolfCourse` (`name`, `geo`, `containedInPlace` = the county,
    `foundingDate`, `url`, `sameAs` = the club website) + `BreadcrumbList`;
  - county and list pages: `ItemList` + `BreadcrumbList`;
  - **never** `aggregateRating` for the Index - it is an editorial score, not user
    reviews.
  - Expect little visible rich-result payoff (LocalBusiness rich results are for a
    business's own site); it helps Google understand the entities.
- **Share images:** `opengraph-image.tsx` per course, rendered with `ImageResponse`
  (flexbox only, **500 KB bundle cap** including fonts; `params` is a Promise in 16).
  Built from our own text and shapes - **never Mapbox imagery** (§5.2).

### 2.6 The app

- **Smart App Banner** on every directory page: `apple-itunes-app` with
  `app-argument=https://vestige.golf/courses/<slug>`. Safari on iOS only.
- **App Store campaign links** on every CTA: one `ct=` per page type (`course`,
  `county`, `list`, `front`), not per course (Apple hides any metric under 5).
- **Universal links:** the AASA claims `/course/*`, which does **not** match
  `/courses/*`. Add `/courses/*` only once the app resolves a slug (iOS deep-link
  handler + the frozen slug in the course catalogue - an additive DTO field). Until
  then, installed users meet the Smart App Banner, which is fine.
- Course shares in the app move to `/courses/<slug>` in the same build.
- **App copy:** January is "Version 1.0 - publicly available, and free", never
  "launch".

---

## 3. The course page

The minimum every course page carries, so no page is thin (§5.1):

1. **Name, county, style, founded, holes.** The breadcrumb: `Courses › <County> ›
   <Course>`.
2. **Facts row:** par, yards, holes, style, founded. Every course has all five.
3. **Jack's description.** About 42 words at the median today (§4.2).
4. **Where it sits:** "1 of 39 courses in Cornwall", its list positions ("#5 on the
   Top 100 England").
5. **The Vestige Index**, only at or above the threshold.
6. **Nearby courses:** the four nearest, with distances. Every course has
   coordinates; the median nearest neighbour is 3.2 km.
7. **The map:** a live Mapbox Static Image loaded straight from Mapbox (§5.2), or an
   interactive map on the county page.
8. **The club's website** (tracking parameters stripped).
9. **One CTA:** "Played it? Put it on your map" → the App Store campaign link (a
   waitlist signup until 1.0 is listed).

Phase 3 adds: planning fields (visitors, green-fee band, how to book), the
signature hole for top courses, photos, architect links.

---

## 4. The data

Audited read-only on dev, 2026-09-23 (1,811 courses; prod carries the same courses,
though per-course editorial may differ).

### 4.1 The public view exposes

| In | Out, never |
|---|---|
| frozen `web_slug`, name, county name + slug, type, hole count, par, yards, style, founded, tier (shown as "Short course"), description, club website (cleaned), lat / lng (3 decimals), `vestige_index` **only at or above the threshold** (null below), live curated-list memberships with position, `updated_at` | `survey_ref` and `course_decoys` (the provenance watermark and decoys - `vestige-ios/docs/course-dataset-provenance.md`), polygons (the scrape target), ids, `legacy_fid`, rarity, the Index sub-scores, `play_count`, prestige, audit columns, anything from `photos` |

### 4.2 What the audit found

- **Slugs:** every current slug is `slugify(name)-<legacy_fid>`. Dropping the suffix
  leaves **5 colliding pairs** (Drayton Park, Grange Park, Heworth, Queen's / Queens
  Park, Sutton Park); `-<county>` on both rows of each pair clears them. The slug must
  be **stored and frozen**, never recomputed from the name.
- **Naming:** course name equals club name on all 1,811 rows, one row per venue.
  Sunningdale, Wentworth, Walton Heath and Woburn are one row each, so Sunningdale
  Old and New cannot have their own pages yet.
- **No town field.** No address, postcode or phone anywhere. Town is what golfers
  search ("golf near Padstow").
- **Descriptions:** none empty, none exactly duplicated; median 285 characters
  (about 42 words), 230 under 200 characters, 20 with generic filler ("A good option
  for casual players").
- **Facts:** par, yards, style, founded, holes, tier, coordinates and website are
  complete on every row. 34 websites carry tracking parameters.
- **Hero photos:** 4.
- **Architect:** no field. 245 descriptions name one (Braid 84, Colt 58, Hawtree 46,
  Morris 12, Fowler 11, ...).
- **Style:** Parkland 1,319 · Heathland 190 · Pitch and Putt 124 · Links 110 ·
  Downland 68. Tier uses only `standard` (1,408) and `short` (403).
- **Lists:** four, all live - Top 100 England (100), The Open Rotation (6), Top 10
  Hampshire (10), Top 10 Surrey (10, slug `surrey-courses` - fix).

### 4.3 Data work, in order

1. **Frozen `web_slug`** column on `courses` (additive migration; backfill by the
   rule above; unique; never edited by a name change).
2. **The public view** (§4.1).
3. **Town** field (Jack). Needed for "near <town>" pages and page copy.
4. **Architect** field (Jack). The 245 text mentions are the seed.
5. **Multi-course venues** (Jack's editorial call, later): split Sunningdale Old /
   New and the rest into course rows. Affects the app's collection too, so it is its
   own decision.

### 4.4 The Index threshold

On dev: ≥90 is 27 courses, **≥80 is 144**, ≥70 is 321, ≥60 is 459; the median is 49.
Recommendation: **80** - a real distinction, and the Top 100 England sits inside it.

---

## 5. Constraints found in research

### 5.1 Google and thin pages

- Google's **scaled content abuse** policy covers pages made at scale "whether content
  is produced through automation, human efforts, or some combination" (2024 update).
  Human-written 42-word blurbs are not a shield; each page has to be useful on its
  own.
- **Doorway pages** - templated location pages that mostly funnel to one place - are
  named as spam. A page that is facts plus "download the app" is that pattern. A
  browsable county → course hierarchy with real facts per course is the safe one.
- What we have that competitors don't: a named editor, the Index method, every
  course (not only ranked ones), nearby courses, and later aggregate "collected by"
  counts. The page must lead with those.
- **The current descriptions were AI-written** (one Claude batch in `vestige-tool`'s
  `enrich.cjs`, corrected by hand where needed; found 2026-09-23). Short AI-written
  blurbs on 1,811 templated pages is exactly the scaled-content risk profile, so the
  go-live bar needs genuine human rewrites where it counts, and no more text is
  generated at scale. Human-edited text is also the only text with a solid copyright
  claim (§5.7).

### 5.2 Mapbox

- Product Terms §1.9 / §2.8.1: no exporting, caching or storing map content, and no
  distributing it "from a cache, by proxying, or by using a screenshot or other static
  image". **Satellite heroes cannot be pre-rendered to our storage, our CDN or
  Vercel's image optimiser** - the `<img>` must load from Mapbox on each view (browser
  caching on the viewer's device is allowed).
- Attribution on every map: the Mapbox logo, "© Mapbox" and "© OpenStreetMap", linked.
- Static Images: 50,000 requests a month free, then $1.00 per 1,000. Lazy-load below
  the fold; a busy month is a real line item.
- §1.6: tracing Mapbox satellite imagery into vector data is allowed only for
  non-commercial or OSM use - **hole geometry cannot be traced from it** (§7).
- Share images (§2.5) never contain Mapbox imagery.

### 5.3 OpenStreetMap

If hole geometry ever comes from OSM, storing it makes a derivative database under
the ODbL (share-alike). Keep it in **its own table under its own licence**, never
merged into Jack's course data, and attribute it.

### 5.4 Vercel

The Hobby plan is "non-commercial personal use only", and advertising a product
counts. The project sits under the `Pinehollow Studios` team; **confirm the plan is
Pro ($20 per seat a month) before `/courses` is indexed.**

### 5.5 How long ranking takes

Google says "a few hours to several months". Third-party data (Ahrefs, 2025): 1.7% of
new pages reach the top ten within a year. Expect about a year before head terms;
the long tail (the 1,500 courses nobody writes about) comes sooner. This is why the
timing is "as soon as possible".

### 5.7 Where the data came from, and what is actually ours (found 2026-09-23)

**Research, not legal advice - a solicitor reviews this before `/courses` is indexed.**

| Layer | Source | Ours? |
|---|---|---|
| Course polygons | **OpenStreetMap** (Overpass exports + Jack's own OSM edits) | No - an ODbL derivative database. Attribution ("© OpenStreetMap contributors") wherever shown; must be offered under ODbL on request. The app already distributes them without that attribution - fix in the next build. |
| County outlines | OS Boundary-Line, Open Government Licence | Open; needs the OS attribution line (the app has it; the web must add it). |
| Par, yards, type | Golfshake's API + scraped pages, then Gemini with search grounding, then hand checks against club scorecards | **Open question.** Publishing these at scale on a site that competes with Golfshake risks a claim under Golfshake's database right unless the figures were independently verified from primary sources. Ask Jack how much was re-verified. |
| Descriptions | AI-written, hand-corrected | Weak copyright; human rewrites are ours. |
| Vestige Index | Our method; the prestige input is set from published rankings (e.g. Top100GolfCourses) | The method is ours (keep the formula private); the numbers are "created data", weak under UK database right. |
| Curation and verification | Jack's work | **The real asset**: the UK database right protects investment in obtaining, verifying and presenting data. |

Consequences for the directory:
- **Polygon protection is not worth engineering for.** The outlines are OSM data anyone can pull
  from Overpass. Show simplified outlines if useful, with OSM attribution; spend protection effort
  on the facts, the Index and the writing instead.
- **The facts question has to be answered before go-live** (Jack + solicitor).
- The data is already fully readable by any signed-up app account (every column of `courses`,
  polygons included, in a few requests; no alerting). Tightening that is an app/backend task,
  independent of the website.

### 5.6 The competition

- **top100golfcourses.com:** long editorial, photo galleries and ranking badges on the
  top courses; thin or missing below the rankings (Chipping Norton rendered only the
  site template); county pages list ranked courses only, 10 at a time, with ads;
  parameterised URLs.
- **Golfshake:** review volume (300k+ across 27k courses), scorecards, fees; thin
  copy, heavy ads.
- **Our gap to close:** depth and photography on the top courses. **Our edge:** every
  course, no ads, clean URLs, the map, nearby courses, the Index, and the app behind
  it.

---

## 6. Phases

"As soon as possible", in the order the dependencies allow. Nothing touches the
waitlist path before the 2 Oct send.

### Phase 1 - Foundations (now → about 9 Oct)

- Data: `web_slug` + the public view as one migration, applied to **dev** (prod on
  Tom's word, after the 2 Oct send).
- Web: a directory branch with the data module, the course-page template, the county
  and list templates, all behind `noindex`, working against dev. No marketing file
  touched.
- Vercel: confirm the plan (§5.4).

### Phase 2 - The directory (about 5 Oct → end of Oct)

- The route-group restructure (§2.1), after the 2 Oct send.
- Course, county, list and front-door pages; sitemap; JSON-LD; share images; Smart
  App Banner; campaign links; the `/course/<uuid>` redirect; the revalidation webhook
  and the bunker call.
- Google Search Console set up for `vestige.golf`.
- **Index go-live bar:** every page carries the full §3 minimum; the 20 filler
  descriptions and the 230 under 200 characters rewritten by Jack; the Index threshold
  set; noindex removed; sitemap submitted.

### Phase 3 - Depth (November → January)

- Longer editorial for the ≥80 tier first (144 courses), then the Top 100.
- Town and architect fields; architect pages; "near <town>" copy.
- Live Mapbox satellite heroes (§5.2); commissioned photography for the top ten
  (`course-photography-options.pdf`).
- Planning fields for ranked courses.
- iOS: slug resolution + shares on `/courses/<slug>` (build 30 if ready, else 1.0),
  then `/courses/*` added to the AASA.

### Phase 4 - Later

Signature holes on top courses (geometry source to settle first, §5.2 / §5.3),
Scotland and Wales pages as their data lands, aggregate "collected by N golfers"
counts above a privacy threshold (§12.2 rules), clubs claiming their pages.

---

## 7. Who does what

**Jack**
- Answer the provenance questions (§5.7): any polygons not from OSM; how much of
  par / yards was re-verified from club scorecards rather than taken from Golfshake;
  whether any prestige score was copied from a ranking; a written assignment of his
  dataset rights to Pinehollow Studios Ltd.
- Confirm the Index threshold (recommendation 80).
- Rewrite the 20 filler and 230 short descriptions before go-live; longer editorial
  for the ≥80 tier after.
- Town and architect fields; the multi-course venue decision.
- Fix the `surrey-courses` list slug.

**Tom**
- The migration (`web_slug` + public view) and its prod apply.
- The web build (phases 1-2), the bunker webhook, Search Console, the Vercel plan.
- The iOS slug resolution and the AASA change.

---

## 8. Open questions

1. The Index threshold (80 recommended).
2. Pitch-and-putt and short-course pages: include all 403 short-tier rows, or only
   those of 9 holes and more? (`vestige-ios/CLAUDE.md` §6.6 excludes anything under 9
   holes from the collection.)
3. Multi-course venues: split before or after the directory goes live?
4. What the front door searches: name only at first, or towns too (needs §4.3.3)?
5. The CTA before 1.0 is listed: waitlist signup (the list stays open for updates
   after 2 Oct) or TestFlight? The one send is 2 Oct; anyone after waits for January.
