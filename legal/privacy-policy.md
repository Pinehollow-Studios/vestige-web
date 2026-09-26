# Vestige — Privacy Policy

> Canonical source for the rendered page at `src/app/privacy/page.tsx`
> (https://vestige.golf/privacy) — the two must be kept in step. Written to
> match what the app actually does, verified against the iOS codebase. As
> with the other documents in this folder, a UK solicitor's review is
> recommended (especially the club-insights section — "aggregated /
> anonymised" has a high bar under UK GDPR).

**Last updated:** 26 September 2026

Vestige ("Vestige", "we", "us") is a golf-course collection tracker for
Great Britain, built by Pinehollow Studios Limited. This policy explains what
personal data we collect, why, and your rights over it. It covers the
Vestige iOS app and, in its final section, the vestige.golf website.

## The short version

- We collect only what the app needs to work, plus opt-out-able diagnostics.
- **We never show ads and never sell your individual data.** Both are
  permanent commitments.
- We use your golf activity to build aggregated, anonymised insights that
  may be sold to golf clubs — never anything that identifies you. You can
  opt out of contributing entirely.
- You can export everything we hold about you, and delete your account (and
  all of its data) from inside the app at any time.

## Who we are

The data controller is **Pinehollow Studios Limited**, a company registered
in England and Wales (company number 17212889) with its registered office at
82A James Carter Road, Mildenhall, Bury St. Edmunds, IP28 7DE, United
Kingdom. For any privacy question or request, contact
**support@pinehollow.studio**.

## What we collect

**Account & profile.** Your email address, username, display name, and
optionally your first name, home club, home county, a short bio, and an
avatar/cover photo. If you sign in with Apple or Google, we receive the
identifier those services return to us; if you use Apple's Hide My Email, we
receive Apple's private relay address instead of your real one.

**Your golf activity.** The courses you mark as played or To play,
rounds you log (date, optional score, optional notes/reflections), the
lists you create, and your friend connections.

**About you (optional).** In a short in-app survey we may ask three optional questions:
your age band, your handicap band, and how you mostly play. You can skip
them entirely. We use these answers only in aggregate — to understand
Vestige's audience and in the club insights described below — never to
profile you individually, and they are never shown on your profile.

**Photos you upload.** Round photos, course photos, and profile images. When
you add a photo we extract its embedded metadata (capture time and, if
present, GPS location) and keep those details alongside the photo to
associate it with a round or course; the image copies we store are
re-encoded, which strips the embedded metadata from the stored files. Photos
are also checked automatically for unsafe content shortly after upload — the
copy sent for that check is the re-encoded one, so it carries no embedded
metadata, and it is sent without your name or handle attached.

**Messages.** Messages you send in the app — today, to the Vestige team,
including replies to your feedback — are stored so the conversation can be
read back by you and by us. They are private to the people in the
conversation and are never shown on your profile or to other users. You can
unsend a message; it is then withheld from everyone, and the conversation
itself is deleted with your account.

**Location.** Only when you use a feature that needs it: sorting the course
suggestions on your home screen by distance, and showing your position on
the map when you ask for it. We take a single reading while the app is open
and use it on your device — the reading itself is never uploaded to our
servers or stored, and we never track your location in the background.
(Location embedded in photos you upload is covered above.)

**Notifications.** If you enable push notifications, we store your device's
push token so Apple can deliver them. You can turn categories of
notification off in Settings, or revoke the permission entirely in iOS
Settings.

**Diagnostics.** Crash reports and basic performance/diagnostic data (via
Sentry, hosted in the EU, and Apple's MetricKit), to find and fix problems.
This is associated with your account unless you turn analytics off.

**Usage analytics.** Anonymous-by-default records of in-app events (e.g.
screens viewed) to understand how the app is used. These respect your
analytics opt-out.

**What we do not collect:** we do not read your contacts/address book, we do
not use third-party advertising or tracking SDKs, and we do not track you
across other apps or websites.

## How we use your data

- To run the app: your collection, map, stats, lists, friends, and
  leaderboards.
- To keep it working: diagnosing crashes and improving performance.
- To improve it: understanding which features are used (analytics).
- To keep Vestige a decent place to be. Text you post — your bio, list
  names and descriptions, round notes and captions, comments, and the names
  you type for playing partners — is screened against our own word list as
  you post it, and may be refused. That same text, and the photos you
  upload, are also checked by Microsoft's Azure AI Content Safety service
  (EU region) as a second opinion: it can flag something for a person to
  look at, and can hide a photo pending that review, but it never decides
  anything about your account. Messages you send are never refused by the
  word list; they are only checked by that second-opinion service, so that
  a person can look if something is reported or flagged. Private notes you
  keep to yourself, and the bug reports you send us, are deliberately not
  screened at all.
- To produce **aggregated, anonymised insights for golf clubs** — for
  example, how many Vestige users played a club, marked it To play, or added
  it to a list, over a period. These insights are always aggregated across many
  users, never individual-level, never personally identifiable, and exclude
  anyone who has opted out of analytics. A club will never see that a named
  person visited.

## Who we share it with

We use a small number of service providers ("processors") to run Vestige:

- **Supabase** — database, authentication, and file storage (EU region).
- **Sentry** — crash reporting (EU region).
- **Apple** — Sign in with Apple, and push notification delivery.
- **Google** — Sign in with Google, where you use it.
- **Mapbox** — map rendering.
- **Microsoft** — automated content-safety checks on photos and text
  (Azure AI Content Safety, EU region).

We do not sell your personal data. The only data that leaves Vestige in a
form that could be sold is the aggregated, anonymised club insights
described above.

## Where your data is held

Vestige is a United Kingdom product: the app is distributed on the UK App
Store only, and it is intended for use in the United Kingdom.

Your data is stored in the European Economic Area (Supabase and Sentry both
run in EU regions, and the content-safety checks run in Microsoft's Sweden
Central region). Transfers from the UK to the EEA are covered by the UK's
adequacy regulations. Where a processor operates outside the UK and the EEA
(for example Apple's push delivery and Mapbox's map rendering, which are
United States companies), the transfer is made under the UK International
Data Transfer Addendum to the EU Standard Contractual Clauses, or another
safeguard permitted by UK GDPR.

## Legal basis (UK GDPR)

We process your data to perform our contract with you (providing the app);
on the basis of your consent for the features you switch on (location and
push notifications — both asked for in context, both refusable); and for our
legitimate interests in keeping the app secure, keeping its content safe,
understanding how it is used, and improving it — always subject to the
analytics opt-out described above. Where we rely on legitimate interests we
have balanced them against your rights, and you can object at any time.

The content checks described above are automated, but they do not decide
anything about you on their own: at most they refuse a piece of text or hide
a photo so a person can look at it. Every decision about an account — a
warning, a restriction, a suspension — is made by a person, and you can
reply to us through the feedback thread in the app.

## Your rights

You can, at any time:

- **Access & export** your data — Settings → Privacy & data → Export my
  data.
- **Delete your account** — Settings → Account → Delete account. This
  permanently removes your account and all associated data, including your
  uploaded photos.
- **Opt out of analytics** — Settings → Privacy & data. Opting out also
  excludes you from all aggregated club insights.
- **Control your visibility** — set your profile to Private or Public at any
  time, and choose whether you appear on the global and local leaderboards
  (Settings → Privacy & data). This also decides who sees your played courses
  and your To play.

Under UK GDPR you also have rights to rectification, restriction, objection,
and to complain to the Information Commissioner's Office (ICO) at
[ico.org.uk](https://ico.org.uk).

## Data retention

We keep your data while your account is active. When you delete your
account, your data (including stored photos) is removed. Aggregated insights
that no longer identify any individual may be retained.

The content-safety checks described above do not create a second copy of
anything: Microsoft does not store the photos or text we send for analysis,
does not use them to train its models, and processes them only in the region
we chose. What we keep is the result — a score, and whether a person needs
to look at it — alongside the content you posted, on our own servers.

## Children

Vestige is intended for users aged 17 and over and is not directed at
children.

## This website

This website asks for one piece of personal information: the email address
you give the waiting list, held to contact you about Vestige and deleted
once it has done its job or on request. It is stored and delivered through
Resend, our email provider, and the site is hosted by Vercel — both acting
only on our instructions. We also use Vercel's privacy-first analytics to
count visits; it sets no cookies and does not identify you.

## Changes to this policy

We may update this policy; we will change the "Last updated" date above and,
for material changes, notify you in-app.

## Contact

**support@pinehollow.studio** · Pinehollow Studios Limited
