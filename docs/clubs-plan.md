# Vestige for clubs: the page and the enquiry form

**Status:** built 3 October 2026 on `feat/clubs`, tested end to end against the dev
database. Production needs vestige-ios migration `20261003150000_web_club_enquiries`
applied, on Tom's word. Claims (the free part) are `docs/course-pages-plan.md`.

**Tom's brief:** a full page and an enquiry form; don't show our hand; no prices anywhere
except the free claim.

## The rules the page keeps

- **One priced thing, and it's free:** claiming a course page. Everything else is
  "talk to us". No "from £", no tiers, no "packages".
- **Outcomes, not products.** More of the right visitors, a place on the lists, a
  clearer picture. Never name or describe a data product (dashboards, conversion,
  benchmarks, "who travels to play you").
- **No numbers we can't stand behind.** The course count is fine. Golfer numbers wait
  until they are worth saying.
- **No invented proof.** No logos and no named clubs until they agree. "Be one of the
  first" is an honest invitation, not a programme with promised perks.
- **The privacy promise, plainly:** clubs never see individual golfers; anything shared
  is aggregated and anonymous; no ads in Vestige, ever.

## The page, top to bottom (`/clubs`)

1. **Hero** (Pine Ridge photo): "Your course, on the map golfers are filling in." The
   page's one gradient button is "Claim your course, free"; "Talk to us" sits beside it.
2. **What golfers do on Vestige:** collect, work through lists, play together, each with
   a real app screen.
3. **Claim band:** "Free, no contract", the three free perks, a find-your-course box, a
   preview of the claimed mark and the badge.
4. **What we're building with clubs:** three outcome cards, then "Be one of the first".
5. **Our promise:** the privacy line.
6. **Talk to us:** an FAQ beside the form (cost, golfers' details, when, who we are,
   missing courses).

## The form

Single step. Fields: club (type to pick a directory course; free text if it isn't
listed), name, role, work email, phone (optional), "What would you like to talk about?"
(outcome checkboxes), anything else (optional), and an **unticked** box for occasional
updates. Sole traders and partnerships are individuals under PECR, so updates need
consent; replying to an enquiry is legitimate interest.

- **Never asked:** budget, timeline, membership size, green fees, "how did you hear".
  They add friction and hint at a pricing model.
- **Promise:** "one of us will reply within two working days."
- **Spam:** a honeypot, a three-second minimum on the page (set by script; without
  JavaScript it is skipped), per-IP Workers limits, and five enquiries per address a day
  in the database. No CAPTCHA. Turnstile can follow if it's needed.
- **Path:** `/api/enquire` → `web_enquiry_create` (Worker key) → hello@ (reply-to the
  club) and a confirmation to the club. If the database is down, the email still goes.
  With JavaScript it is a fetch; without, a plain post to `/clubs/thanks`.
- **Data:** `web_club_enquiries` (RLS on, no client grants), `status` new / replied /
  closed for a bunker screen later. Privacy policy: kept up to two years after we last
  spoke.

## Header

Rebuilt alongside: centred pill navigation (Courses, The app, For clubs) with the
current section filled; "Get notified" as a secondary pill; on phones a menu button
opening a sheet (a `<details>` element, so it works without JavaScript).

## Production steps

1. `./scripts/env-guard.sh prod -f supabase/migrations/20261003150000_web_club_enquiries.sql`
   in vestige-ios, then record it in `schema_migrations`.
2. `npm run deploy:production`.
3. Send one enquiry from Tom's own address; check hello@ and the confirmation.

## Later

A bunker screen for enquiries and claims; Turnstile if bots arrive; named founding clubs
once any agree; golfer numbers once they're worth stating.
