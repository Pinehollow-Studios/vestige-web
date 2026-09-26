/**
 * Hand-edited values for the public /progress page.
 *
 * When progress moves on, update the things that change — `coursesMapped`,
 * `coursesTotal`, `completedCounties`, the `countries` list and
 * `lastUpdated` — and you're done; the counts, fractions, percentages, map
 * fills and the headline figure quoted across the site all derive from
 * them. County names must match counties.ts exactly (the build fails
 * loudly on a typo, so a mistake can't ship silently).
 *
 * The map covers Great Britain. England is finished — all 47 ceremonial
 * counties are in, and the ledger carries that as a milestone — while
 * Scotland and Wales are drawn as single "still to come" shapes
 * (countries.ts). Neither has a region model yet: that gets decided when
 * their courses are mapped, which is Jack's job later on. When that day
 * comes, add the regions to counties.ts, list them in `completedCounties`
 * as they land, and flip the country's `complete` flag when the last one
 * is in; the site reads everything from here and nothing says "done" on
 * its own.
 *
 * These may later be wired to a live read-only Supabase count — keep
 * this shape stable so the swap is just a fetch returning the same
 * object. For now the page has no database dependency, by design.
 */

export const progressConfig = {
  /** Courses in the database. Every English course, so far. */
  coursesMapped: 1811,
  /**
   * Estimated courses across the whole of Great Britain — the denominator
   * of the "x of ~y" fraction, always rendered with a "~". Set it to null
   * once the counting is done and `coursesMapped` IS the total.
   */
  coursesTotal: 2600 as number | null,

  /**
   * The three countries, in the order they're being mapped. `complete`
   * is what the ledger and the map read; `completedOn` is stamped on the
   * milestone banner. A country without a region model yet is drawn as
   * one shape from countries.ts, so it needs no county list here.
   */
  countries: [
    { name: "England", complete: true, completedOn: "4 August 2026" },
    { name: "Wales", complete: false },
    { name: "Scotland", complete: false },
  ] as ReadonlyArray<{ name: string; complete: boolean; completedOn?: string }>,

  /**
   * Counties fully mapped, filled mint on the map. All 47 ceremonial
   * counties of England — the City of London is counted within Greater
   * London. Scottish and Welsh regions join this list once they exist.
   */
  completedCounties: [
    "Bedfordshire",
    "Berkshire",
    "Bristol",
    "Buckinghamshire",
    "Cambridgeshire",
    "Cheshire",
    "Cornwall",
    "County Durham",
    "Cumbria",
    "Derbyshire",
    "Devon",
    "Dorset",
    "East Riding of Yorkshire",
    "East Sussex",
    "Essex",
    "Gloucestershire",
    "Greater London",
    "Greater Manchester",
    "Hampshire",
    "Herefordshire",
    "Hertfordshire",
    "Isle of Wight",
    "Kent",
    "Lancashire",
    "Leicestershire",
    "Lincolnshire",
    "Merseyside",
    "Norfolk",
    "Northamptonshire",
    "North Yorkshire",
    "Northumberland",
    "Nottinghamshire",
    "Oxfordshire",
    "Rutland",
    "Shropshire",
    "Somerset",
    "South Yorkshire",
    "Staffordshire",
    "Suffolk",
    "Surrey",
    "Tyne and Wear",
    "Warwickshire",
    "West Midlands",
    "West Sussex",
    "West Yorkshire",
    "Wiltshire",
    "Worcestershire",
  ],

  /** The most recently mapped county — gets the "Just added" beacon on the
   *  atlas and the ledger line while a country is mid-fill. With England
   *  finished and nothing started elsewhere, the milestone banner is the
   *  news instead and this is unused, but it stays accurate for the
   *  record. Must be one of the above. */
  latestCounty: "Northumberland",

  lastUpdated: "11 September 2026",

  /** Honest, present-tense — rewrite it whenever the work changes. */
  rightNow:
    "England is done: every course is in, all the way to the Northumberland coast, and the map now runs to the whole of Great Britain. Scotland and Wales are next on Jack's list. Tom's polishing the app's main flows and getting the app ready for the public beta.",

  /**
   * One real screenshot of the app. Drop the file in public/progress/
   * and point at it; set to null to fall back to the placeholder.
   * TODO: replace with a capture from a build that draws Scotland and
   * Wales — this one still shows Wales greyed out as "coming soon".
   */
  screenshot: {
    src: "/progress/app-home-2.png",
    alt: "The Vestige home screen: the county map of England with the collection filling in, Wales greyed out beside it, 11 of 942 courses played, Surrey within reach at 9 of 68.",
  } as { src: string; alt: string } | null,
} as const;

/** Ceremonial counties of England (City of London within Greater London). */
export const COUNTIES_TOTAL = 47;

/** The countries the map covers: England, Scotland and Wales. */
export const COUNTRIES_TOTAL = progressConfig.countries.length;

/** How many of them are finished. */
export const COUNTRIES_MAPPED = progressConfig.countries.filter((c) => c.complete).length;

/**
 * Every country mapped. Drives the map's finale, the ledger's "complete"
 * state and the past-tense copy — nothing says "done" on its own.
 */
export const isComplete = COUNTRIES_MAPPED === COUNTRIES_TOTAL;

/**
 * The most recently finished country, for the milestone banner the
 * ledger leads with while the rest is still filling in. Null once the
 * whole map is done (the finale takes over) or before anything is.
 */
export const milestone = (() => {
  if (isComplete) return null;
  const done = progressConfig.countries.filter((c) => c.complete);
  const last = done[done.length - 1];
  return last ? { label: `${last.name} complete`, date: last.completedOn } : null;
})();

/**
 * The headline course figure, for marketing copy: the real count rounded
 * DOWN to the nearest hundred, so "1,800+" is always an undersell and can
 * never over-claim. Change the rounding here and the hero, the stats
 * strip, the meta description and the emails all follow.
 *
 * The exact figure isn't a secret — /progress, the FAQ and the update
 * email all quote it. The rounding is for the lines that want a number
 * you can say out loud, not for hiding anything.
 */
export const COURSES_HEADLINE = Math.floor(progressConfig.coursesMapped / 100) * 100;

/** "1,800" — the rounded figure, formatted. */
export const COURSES_HEADLINE_TEXT = COURSES_HEADLINE.toLocaleString("en-GB");

/** "1,800+" — the rounded figure as it appears in headlines. */
export const COURSES_HEADLINE_PLUS = `${COURSES_HEADLINE_TEXT}+`;

/** "1,811" — the exact count, for the places that earn the precision. */
export const COURSES_EXACT_TEXT = progressConfig.coursesMapped.toLocaleString("en-GB");

/** "~2,600" — the estimated total across Great Britain, or null once counted. */
export const COURSES_TOTAL_TEXT =
  progressConfig.coursesTotal != null
    ? `~${progressConfig.coursesTotal.toLocaleString("en-GB")}`
    : null;
