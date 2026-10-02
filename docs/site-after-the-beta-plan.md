# vestige.golf after the beta link - the plan

**Written:** 2 October 2026, the day the public TestFlight link went to the waiting list.
**Companion:** `docs/course-directory-plan.md` (the directory's own build plan - this file
does not repeat it, it sequences it).

---

## 1. Where we are

- The beta is **full by choice**. Tom and Jack invite anyone else by hand with
  `vestige.golf/beta`; the site itself stops handing out TestFlight.
- The site flipped to "the link has gone out" this morning (#83). The copy is consistent,
  but it still reads as a **waiting list for a link that has gone**: "You're on the list",
  "joined the waiting list this week", "Be among the first".
- `/u/<handle>` still sends anyone without the app **straight to TestFlight**, so every
  tester who shares their profile is an open door.
- The **course directory is live on production behind noindex**: `/courses`, 47 county
  pages, 3 lists, 5 styles, 1,811 course pages, reading the prod `web_directory_*` views.
  Nothing on the marketing site links to it yet.

## 2. Decisions (Tom, 2 October 2026)

| Question | Call |
|---|---|
| Where does a shared profile link send people without the app? | **`/app`**, with the 1.0 signup. Not TestFlight. `/beta` stays the hand-shared way in. |
| What is the email list for now? | **Version 1.0 and progress updates.** The signup stays, worded "tell me when 1.0 is out". |
| The homepage | **Keep the pitch, add the directory**: a "browse every course" section and a nav link, not a directory-led rebuild. |
| Indexing the directory | **Staged, hubs first**: `/courses`, county, list and style pages as soon as the blockers clear; course pages in batches as Jack's rewrites land. |
| "Played by N golfers" on public course pages | **No. Pro only, never on the web.** The plan's §4.1 rule (no `play_count` in the public view) stands. |
| App Store pre-order for 1.0 | **Look into it** - a spike, not a commitment. |
| A web tick-list ("how many have you played?") | **Not yet.** |
| Help centre, account deletion, changelog, press kit pages | **None for now** - the app isn't out. Revisit for 1.0. |

## 3. The slices

Each slice is one PR (or one piece of non-code work) that ships on its own and leaves
the site consistent. Order is by dependency, then value.

### Slice 1 - Close the door, rename the list  *(BUILT 2 Oct, branch `site/close-the-door`)*

The fix for today's mismatch. Copy and routing only; no new pages.

- **`/u/<handle>`**: drop the TestFlight `cta` override, so it uses `LinkLanding`'s
  default way in. Change that default from `/` to **`/app`** for every universal-link
  fallback (`/u`, `/course/<id>`, `/list/<id>`, `/society/join`), labelled for 1.0
  rather than "Join the waiting list".
- **`/beta`**: unchanged. It is the only page that offers TestFlight.
- **Waiting list → 1.0 list** across `siteConfig`: hero `waitlistNote` and
  `liveEyebrowLabel`, `closingCta` (headline and sub: "Be among the first" no longer
  fits), `appPage.cta`, the FAQ "When can I actually use it?" (the beta is full and
  invite-only, and 1.0 is January), and the roadmap row for October.
- **The welcome email** (`src/emails/welcome.tsx`, subject in `src/lib/email.tsx`):
  the subject, eyebrow, heading, preview text and footer stop saying "waiting list".
  The body says what they'll get: word when 1.0 is out in January, and the odd progress
  update.
- **Tidy**: the `BETA_LINK_SENT` pre-send branches can never render again. Collapse
  them to the post-send copy and keep `TESTFLIGHT_PUBLIC_URL` for `/beta` alone. Fewer
  dead paths to keep true.
- **Done when**: no page except `/beta` links to TestFlight; `npm run email` shows the
  new welcome email; a live test signup to Tom's address delivers it; `next build`
  passes.

### Slice 2 - Bring the directory into the site  *(BUILT 2 Oct, same branch)*

The marketing pages get a way into the directory. The homepage keeps its story.

- **Nav**: add "Courses" (`/courses`) to `siteConfig.nav`, which drives the tab chooser,
  the hero topbar and the footer. A jump between the two route groups is a full page
  load, which is expected (directory plan §2.1).
- **Homepage section**: "Every course, one place". This is a course-name search that
  lands on `/courses` with the query filled in (`/courses?q=`; the front-door search
  needs to read it), plus a short row of ways in: the curated lists and a few counties.
  It sits after the stats strip, so the hero and its signup are untouched.
- **The course marquee links to course pages.** The 30 names are the most famous
  courses we have; each becomes a link to its `/courses/<slug>`. Scottish and Welsh
  names have no page yet, so they stay unlinked until slice 7.
- **`/progress`**: completed counties on the map and in the ledger link to
  `/courses/county/<slug>`.
- **FAQ "Which courses are in it?"** links to `/courses`.
- **Old course share links**: `/course/<uuid>` 308-redirects to `/courses/<slug>` today
  only when `DIRECTORY_INDEXABLE` is on. Decouple this so it redirects now: the course
  page is a better landing than the generic card whether or not Google sees it.
- **Done when**: every marketing page reaches the directory in one tap; every linked
  marquee name resolves; no layout shift in the hero on phones.
- **As built**: the slug check runs at render, not as a build failure
  (`src/lib/directory/marketing.ts`). A slug that doesn't resolve is logged and its name
  renders as plain text. Any directory read failure (Preview has no directory env
  today) leaves the marketing pages exactly as before: no courses section, plain
  marquee, an unlinked map. A build that fails on a data read would take the whole
  site down with the directory.

### Slice 3 - The staged indexing switch  *(code; can run beside slice 2)*

Replace the one boolean with stages, so the directory can go live hubs first.

- **`DIRECTORY_INDEXABLE: boolean` → `DIRECTORY_INDEX_STAGE: "off" | "hubs" | "courses"`**
  in `src/lib/directory/config.ts`:
  - `hubs` indexes `/courses`, county, list and style pages.
  - `courses` additionally indexes **ready** course pages.
  - Every other page keeps `noindex, follow`, so links still pass through it.
- **Per-course readiness**: a `web_ready` boolean (or `editorial_reviewed_at`
  timestamp) on `courses`, exposed through `web_directory_courses`, which Jack sets in
  the bunker when a page meets the bar.
  - It's an additive migration in `vestige-ios/supabase/migrations` (use the
    `migration` skill: expand-only, grant lockdown, dev then prod).
  - The course page's robots rule and the sitemap both read it.
- **Sitemaps**: list only indexable URLs. Hubs go in one sitemap, ready courses in
  another (robots.ts lists whichever exist at the current stage).
- **Hub pages must not be thin either.** Each county page gets a short human-written
  intro (47 of them, Tom or Jack, about 60-100 words: what the county's golf is like and
  its best-known courses), stored as editorial copy. Check the five style pages and the
  three list pages carry real descriptions.
- **The revalidation path**: land the bunker's `revalidateDirectory()` call
  (uncommitted in `vestige-bunker`, per the directory plan). Without it, marking a page
  ready won't reach the cached page or the sitemap.
- **Also fix**:
  - Preview deployments have no `SUPABASE_URL` / `SUPABASE_ANON_KEY`, so directory
    pages can't render on a preview. Add the pair, or the `DIRECTORY_*` pair pointed
    at dev, for Preview.
  - Jack's `surrey-courses` list slug.
- **Done when**: at `hubs`, a hub page carries `index, follow` and a course page
  `noindex, follow`, and the sitemap matches. At `courses`, only `web_ready` rows flip.
  Verified on a preview deployment.

### Slice 4 - The go-live gate, then flip to `hubs`  *(non-code; Tom and Jack)*

Nothing indexes until these are answered. The directory is **already publicly
reachable** (noindex only hides it from search), so the legal items matter now, not only
at go-live.

1. **The facts' provenance** (directory plan §5.7): how much of par and yards Jack
   re-verified from club scorecards rather than taking from Golfshake. Then a solicitor's
   view before indexing.
2. **Vercel plan**: the `Pinehollow Studios` team must be on **Pro**. Hobby is
   non-commercial only.
3. **Attribution**: "© OpenStreetMap contributors" and the OS Boundary-Line line wherever
   the web shows outlines or maps.
4. **The Index on the web**: the threshold (80 recommended), and whether prestige is
   populated yet. If prestige is still flat, no course clears 80, so the Index shows
   nowhere, which is fine but should be a known state.
5. **Search Console**: a domain property for `vestige.golf` (DNS TXT on Cloudflare).
6. The county intros from slice 3.

Then set the stage to `hubs`, deploy, submit the hubs sitemap, and watch Search Console
coverage for two to four weeks ("Indexed" vs "Crawled - currently not indexed") before
the first course batch.

### Slice 5 - Course pages in batches  *(November → January, paced by Jack)*

- **Batch order**:
  1. The Top 100 England and the ≥80 Index tier (144 courses).
  2. The Open Rotation and the other lists.
  3. County by county, the counties with the most famous courses first.
- **Per batch**: Jack rewrites the description, which replaces the AI-written text with
  his own (the scaled-content and copyright reasons are in directory plan §5.1 and §5.7).
  He then marks `web_ready`, the webhook revalidates, and the page joins the sitemap.
- **What makes a page unique, with play counts off the table**: Jack's writing, nearby
  courses with distances, list positions, "1 of 39 in Cornwall", the map, and the Index
  where it clears the threshold. This is the plan's §3 minimum. Phase 3 depth (architect,
  town, planning fields) lifts pages further as it lands.
- **The brake**: if a batch comes back mostly "Crawled - not indexed", pause and deepen
  the pages before the next batch. Google has warned (Sept 2026) that a wave of thin
  pages can cost the whole domain trust for months, and noindexing afterwards doesn't
  undo it quickly.

### Slice 6 - Pre-order spike  *(October; mostly an iOS and App Store Connect question)*

Find out whether 1.0 can sit on **App Store pre-order** before its January release, so
the site gets a real button before then.

- **To confirm in App Store Connect**:
  - Whether an app that has only ever been on TestFlight is eligible. It should be, as
    "never published", but check.
  - The release date window (2-180 days ahead).
  - UK-only territory.
- **What it costs**:
  - A 1.0 build through App Review well before January.
  - A release date we'd have to hold. Apple doesn't notify pre-orderers if it moves.
- **Fit with the plan**: January is "early access, no marketing push". A pre-order is
  still a normal listing, so it fits; the March launch stays the big one.
- **Site impact if yes**: `siteConfig.appStoreUrl` currently means "downloadable" (it
  flips `LinkLanding`, `appCta()` and the Smart App Banner). A pre-order needs its own
  state, so the copy says "Pre-order" and the banner behaves. That would be its own small
  slice, plus a broadcast to the 1.0 list.
- **Output**: a go / no-go note, with a date if go.

### Slice 7 - Scotland and Wales in the directory  *(as Jack's data lands)*

- `DIRECTORY_COVERAGE` moves from "England" to Britain, with the region model Jack
  chooses (lieutenancy vs council areas; `great-britain-scope` memory).
- New regions stay noindex until mapped and ready. They are never placeholder pages.
- Marquee links for the Scottish and Welsh names switch on as their pages exist.

### Slice 8 - Version 1.0 day  *(January)*

- `appStoreUrl`, `APP_STORE_APP_ID` (the Smart App Banner, with `app-argument` set to the
  page URL) and the provider token for `ct=dir-*` campaign links.
- `/courses/*` added to the apple-app-site-association file once the app resolves slugs
  (directory plan phase 3, iOS).
- The 1.0 broadcast to the list.
- Revisit the parked app pages (§4). Apple requires account deletion in the app; a web
  page for it is optional but cheap.

## 4. Parked, on purpose

- **Web tick-list / share card** ("23 of 39 in Cornwall"): "not yet", 2 Oct. It's the
  strongest pre-1.0 hook the research found; revisit if the 1.0 list needs a push.
- **Public play counts, "first to complete" honours, public collection maps**: Pro only,
  or not on the web.
- **Help centre, changelog, press kit, account deletion page**: at 1.0.
- **Club badges** ("Collect us on Vestige" for club websites, a source of links and a
  first step to the B2B side): after the course pages are indexed, so the links land on
  pages Google already trusts.
- **"Golf near <town>" pages**: need Jack's town field first.

## 5. At a glance

| Slice | What | Who | When | Depends on |
|---|---|---|---|---|
| 1 | Close the door, rename the list | Tom (code) | this week | - |
| 2 | Directory into the site | Tom (code) | next | 1 (shared copy) |
| 3 | Staged indexing switch | Tom (code + migration), Jack (county intros) | beside 2 | migration on prod |
| 4 | Go-live gate, flip to `hubs` | Tom, Jack, solicitor | when answered | 3 |
| 5 | Course pages in batches | Jack (rewrites), Tom (watching Search Console) | Nov → Jan | 4 |
| 6 | Pre-order spike | Tom (App Store Connect) | October | - |
| 7 | Scotland and Wales | Jack (data), Tom (code) | as data lands | 3 |
| 8 | 1.0 day | Tom | January | 6, iOS |
