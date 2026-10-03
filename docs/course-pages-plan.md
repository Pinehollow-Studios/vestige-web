# Course pages, club claims and protecting the directory

**Status:** built 3 October 2026 on `feat/course-pages`, tested end to end against the
dev database. Production needs the migration applied and the keys set (§6), on Tom's
word. Research behind it: §7.

Decisions (Tom, 3 October 2026):

| Question | Call |
|---|---|
| What the page is | A doorway, not the product. Everything a golfer needs is free; the app is where you *do* something with it. |
| How a club proves it owns a page | **Automatic by club email**: an address on the club website's own domain gets a confirm link. Anything else is checked by hand from hello@. |
| What a claimed club gets, free | A "Claimed by the club" mark, suggested edits (Jack applies them), an embeddable badge. Paid products stay vague: "talk to us". |
| What leads the page | **Our own county map** with the course as a pin. **No course outline**, ever: anything drawn on a static page can be copied. |
| Data lockdown | **Full lockdown now** (§3). |

---

## 1. The course page, top to bottom

1. **Top:** kicker (style and county), the name, a "Claimed by the club" mark when claimed,
   one line (kind, county, founded), ranking chips (Index, list positions), club website
   and directions. Beside it, the **county map**: the county lit in mint, its neighbours,
   the course as a pulsing pin, the four nearest as dots, a small Britain inset. Built
   from `src/data/counties.ts` at build (ONS / OS boundaries, OGL, credited).
2. **Facts strip:** holes, par, yards, style, founded, in one card like the app's figures.
3. **Photo**, where we have a confirmed one (`photoForCourse`, four courses today).
4. **About:** the description, "Updated <month>" and a "Tell us" correction link.
5. **Vestige Index** (80 and over): the score, England and county ranks (true ranks:
   everything above a published score is itself published), one honest line.
6. **On these lists:** position cards ("No. 22 of 100").
7. **Nearest courses** and **More <style> nearby** (same style within 40 miles, highest
   rated first).
8. **Side (sticky on desktop):** the app card, written about this course ("Played
   Hankley Common? Put it on your map… There are 75 courses in Surrey. How many have you
   got?"), the page's one primary button; then the claim card.

Never on the page: the course outline, play counts, anything from the Index's workings.

## 2. Club claims

```
/courses/<slug> ── "Claim this page" ──▶ /clubs/claim?course=<slug>
                                            │ POST /api/claim
                         web_claim_create decides (domain match, already claimed)
              ┌─────────────────────────────┴───────────────────────────┐
   club-domain address                                          anything else
   confirm link to the club address                     "we'll check" email to claimant
   /clubs/claim/confirm?t=  (button → POST)             hello@ gets every claim, with
              │                                         /clubs/claim/review?t= (approve / decline)
              └───────────────▶ verified ◀──────────────────────────────┘
          email: private /clubs/manage?t= link + badge snippet; rebuild requested
          /clubs/manage: suggest description / website / founded / notes → hello@ + table
```

- **Tables** (`web_club_claims`, `web_course_suggestions`): RLS on, no client grants,
  written only through `web_claim_*` functions that check the Worker's key.
- **Tokens:** 32 random bytes; only their SHA-256 is stored, so a database read never
  yields a working link. Confirm links last three days. Opening any link changes
  nothing; a button does (mail scanners open links).
- **One verified claim per course** (partial unique index). Approving a second claim
  from hello@ hands the page over and kills the first club's link.
- **Nothing a club suggests goes live by itself.** Jack edits the course in the bunker.
- **The mark** comes from the view's `claimed` column at build. With no deploy hook yet,
  it appears at the next deploy (hello@ is told).
- **Badge:** `public/badges/collect-us-on-vestige(-dark).png`, 192 x 68 displayed, the
  snippet links to the course page.
- Abuse limits: per-IP Workers rate limit (6 a minute), five claims per address a day in
  the database, a honeypot field, origin check on every post.

## 3. Protecting the data

**What changed**

| Before | After |
|---|---|
| The three `web_directory_*` views were readable with the public anon key: the whole directory in one request. | Views closed to anon and authenticated. The build reads `web_directory_export(key)`; the database holds only the key's SHA-256. |
| The production build read whichever database `.env.local` named (dev, on Tom's Mac). | `integrations/directory.mjs` picks the source by `SITE_ENV`: production and staging read prod, anything else dev. |
| `/courses` shipped every course name and slug in the page. | Search is `/api/search` in the Worker: two characters minimum, eight results, rate-limited per IP. The index is bundled into the Worker, never a public file. |
| JSON-LD carried the description and founding year. | JSON-LD is identity only: name, URL, coordinates, county, club website. |
| Coordinates went out exactly as stored. | A keyed fourth decimal inside the 3-decimal cell fingerprints our copy (`DIRECTORY_WATERMARK_KEY`); positions are exactly as accurate as before. |
| Nothing caught scrapers. | A hidden nofollow link on every directory page to `/courses/export`, disallowed in robots.txt; hits are logged by the Worker (`[trap]`). |
| Terms said nothing about the directory. | ToS §10: database right and copyright; no substantial or systematic extraction, scraping or AI training; robots.txt and content signals form part of the terms. |

**Keys** (never in git):

| Key | Where | Pairs with |
|---|---|---|
| `DIRECTORY_BUILD_KEY` / `_DEV` | `.env.local` (later a Workers Builds build secret) | `web_directory_config.build_key_sha256` per project |
| `WEB_API_KEY` | Worker secret (`npx wrangler secret put WEB_API_KEY`), `.dev.vars` for dev | `web_directory_config.worker_key_sha256` |
| `DIRECTORY_WATERMARK_KEY` | `.env.local` | keep stable: changing it changes the fingerprint |

Keep copies of all three in 1Password.

**Still open** (not website work): the iOS app's backend lets any signed-in user read the
full `courses` table. The catalogue RPCs (`20260930170000`) are the start of fixing that.

## 4. Cloudflare dashboard checklist (Tom; the wrangler token can't change zone settings)

vestige.golf zone:

1. **Security → Bots:** turn on **AI Labyrinth**. Leave Bot Fight Mode **off** for now (it
   can't be bypassed and would challenge the bunker's `/api/revalidate` call).
2. **AI Crawl Control:** block **Training**, allow **Search**. Then, under Security
   settings, **tick the opt-out for Googlebot, Bingbot and Applebot**, or blocking
   Training blocks Google too (since 15 September 2026).
3. **Managed robots.txt:** on (adds `search=yes, ai-train=no` in front of ours).
4. **WAF → Custom rules** (5 free), each with `not cf.client.bot`:
   - Block: `http.request.uri.path eq "/courses/export"`.
   - Managed challenge: path starts with `/courses` and user agent contains
     `python-requests`, `scrapy`, `curl`, `Go-http-client`, `HeadlessChrome` or `wget`.
   - Managed challenge: path starts with `/courses` and `ip.src.asnum` in the big cloud
     networks (AWS 16509/14618, Google Cloud 396982, Azure 8075, Hetzner 24940, OVH 16276,
     DigitalOcean 14061).
5. **WAF → Rate limiting** (1 free rule): `/courses` paths, 60 requests per 10 seconds
   per IP, block for 10 seconds, excluding verified bots.

## 5. Not done yet

- A bunker screen for claims and suggestions (today: hello@ emails plus the tables).
- Deploy hook (Workers Builds) so a claim shows the mark within minutes.
- Turnstile on the claim form if bots find it.
- Per-course share images.
- Solicitor review of the new ToS clause and privacy section.

## 6. Production steps

1. **Prod migration** (Tom's word): `./scripts/env-guard.sh prod -f
   supabase/migrations/20261003130000_web_directory_door_and_club_claims.sql` in
   vestige-ios, record it in `schema_migrations`, set the prod key hashes.
2. `npx wrangler secret put WEB_API_KEY` on `vestige-web` (prod worker key).
3. `DIRECTORY_BUILD_KEY=<prod build key>` in `.env.local`.
4. `npm run deploy:production`.
5. Check: anon read of the views is 401; a course page shows the map; search answers;
   a claim from Tom's own address reaches hello@.
6. Tom: the Cloudflare checklist (§4).

## 7. Research (3 October 2026)

- Best course and place pages (top100golfcourses, Hole19, GolfPass, Untappd, Letterboxd,
  Komoot, walkhighlands, AllTrails): every fact public; the app or account is for
  *doing*; a pitch written about the place itself; ranks, lists and nearby as the web of
  links. Strava's logged-out segment page ("log in to see") is the doorway anti-pattern.
- Claim flows (Google Business Profile, Tripadvisor, Yelp, Untappd, Hole19): a quiet
  link on the public page; verification through a channel tied to the business. Email
  at the club's own domain is the cheapest strong signal; postcards, documents and phone
  calls are too heavy for two people.
- Protection: Supabase views granted to anon are a one-call export; build-only keys or
  a keyed function close it. Cloudflare free: managed robots.txt, AI Crawl Control (mind
  the Googlebot opt-out), AI Labyrinth, 5 WAF rules, 1 rate-limit rule. UK database
  right protects investment in obtaining and verifying; copyright in the writing is the
  quicker lever for takedowns.
