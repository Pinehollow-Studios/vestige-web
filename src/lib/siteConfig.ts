/**
 * Single source of truth for everything brand-specific.
 *
 * When the App Store approves the final name, change the values in this file
 * (and update the OG image + favicon) and the entire site is rebranded.
 *
 * The course figures below are NOT written out by hand. They come from
 * progressConfig, the same file the /progress map reads, so the hero, the
 * stats strip, the FAQ and the emails can never drift apart or go stale:
 * COURSES_HEADLINE_PLUS is the count rounded down for headlines ("1,800+"),
 * COURSES_EXACT_TEXT the real figure for the lines that earn the precision.
 */

// Explicit .ts extension (allowed by allowImportingTsExtensions in tsconfig):
// scripts/build-progress-map.ts pulls this module into bare node, whose ESM
// resolver won't guess at extensions the way the bundler does.
import {
  COUNTIES_TOTAL,
  COUNTRIES_TOTAL,
  COURSES_EXACT_TEXT,
  COURSES_HEADLINE,
  COURSES_HEADLINE_PLUS,
  COURSES_TOTAL_TEXT,
} from "./progressConfig.ts";

/**
 * The one send. The public beta link is a single TestFlight invite that goes
 * out on 2 October 2026 to the waiting list *as it stands that day*. It is not
 * a rolling invite, and nobody who joins afterwards gets one; the next way in
 * is version 1.0 in January 2027. The site's beta copy (hero note, stats strip,
 * /app CTA, FAQ, roadmap, closing CTA, /progress, the welcome email, the
 * /u/<handle> card) switches on the flag below.
 *
 * MANUAL SWITCH, nothing is scheduled. Tom sends the link by hand on 2 Oct,
 * then sets BETA_LINK_SENT = true and TESTFLIGHT_PUBLIC_URL to the public
 * link, and deploys. Until that deploy every page reads as it does today.
 */
export const BETA_LINK_SENT: boolean = false;

/** The TestFlight public link. Empty until the send; once set (with
 *  BETA_LINK_SENT), /u/<handle> sends people without the app here instead
 *  of to the waiting list. */
export const TESTFLIGHT_PUBLIC_URL: string = "";

/** Has the one send still to happen? Copy written for people who can
 *  still make the list must not be shown to people who can't. The
 *  `now` parameter is kept for callers' signatures and ignored: the
 *  switch is the flag above, never the clock. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function betaLinkStillToCome(now: Date = new Date()) {
  return !BETA_LINK_SENT;
}

export type SiteConfig = {
  brandName: string;
  brandShortName: string;
  brandLowerName: string;
  /** Used in OG / page-title fallback. Also the hero's support line —
   *  one declarative sentence that works everywhere: bio, ads, hero. */
  tagline: string;
  /** Meta/OG description — fuller than the tagline so title and
   *  description don't duplicate in search results and link previews.
   *  Keep it under ~155 characters: Google truncates past that and,
   *  when the tag is much longer, tends to swap in on-page copy of its
   *  own choosing instead. */
  description: string;
  domain: string;
  /** Null until live. When set, swap waitlist UI for App Store CTA. */
  appStoreUrl: string | null;
  /** The front door — general enquiries, press, waitlist replies. */
  contactEmail: string;
  /** Help with the app itself — beta, account, privacy requests, legal pages. */
  supportEmail: string;

  /**
   * The site's pages, in tab order. The story is split across three
   * pages — the homepage (the pitch), /app (the three small ideas) and
   * /progress (the map so far) — and this list drives the floating
   * tab chooser, the hero topbar and the footer, so adding a page is
   * one entry here.
   */
  nav: ReadonlyArray<{ href: string; label: string }>;

  /** Hero composition — three-line serif stack with the italic word in the middle. */
  hero: {
    /** The live signup counter only surfaces once weekly signups exceed this. */
    liveCountMinWeekly: number;
    liveEyebrowLabel: string;
    /** Three-part headline: [pre, italicWord, post]. The number carries
     *  the scale hook, so no eyebrow is needed beneath the threshold. */
    headline: readonly [string, string, string];
    /** One line under the email field — what joining actually gets you. */
    waitlistNote: string;
    /** Meta strip below the email field. */
    metaStrip: ReadonlyArray<string>;
  };

  /** Course marquee — duplicated automatically for seamless loop. */
  marquee: ReadonlyArray<string>;

  /** Stats strip — four cells. */
  stats: ReadonlyArray<
    | { kind: "number"; target: number; prefix?: string; suffix?: string; label: string }
    | { kind: "static"; value: string; label: string }
  >;

  /** Three feature cards — `kind` selects the motif (atlas / tap / board). */
  features: ReadonlyArray<{
    kind: "atlas" | "tap" | "board";
    eyebrow: string;
    title: string;
    body: string;
  }>;

  /** Closing CTA section. */
  closingCta: {
    eyebrowLabel: string;
    headlinePre: string;
    headlineItalic: string;
    sub: string;
    ctaLabel: string;
    /** Light "forward this to a golf mate" nudge under the signup. */
    forwardNudge: string;
  };

  /**
   * /app — the three small ideas on their own page. The hero copy up
   * top, then the `features` cards, then one way into the waiting list.
   */
  appPage: {
    /** Three-part headline: [pre, italicWord, post]. */
    headline: readonly [string, string, string];
    lede: string;
    cta: {
      headlinePre: string;
      headlineItalic: string;
      headlinePost: string;
      body: string;
      ctaLabel: string;
      meta: string;
    };
  };

  /** "Why we're building it" — studio-voice narrative. Carries the #what anchor. */
  what: {
    eyebrow: string;
    titlePre: string;
    titleItalic: string;
    /** One or more paragraphs. */
    body: ReadonlyArray<string>;
  };

  /** Frequently-asked questions — rendered as accessible accordions. */
  faq: ReadonlyArray<{ q: string; a: string }>;

  /**
   * Roadmap timeline — the release windows from now to the launch.
   * Three on the site (Tom, 2026-09-04): the public beta, version 1.0
   * going public, and the launch proper. The invite-only beta already
   * running is deliberately not on here. January is "1.0, publicly
   * available" — never "launch", never "App Store", never "quietly";
   * March is the one the site makes a big thing of.
   */
  roadmap: {
    eyebrow: string;
    titlePre: string;
    titleItalic: string;
    titlePost: string;
    sub: string;
    milestones: ReadonlyArray<{
      month: string;
      year: string;
      label: string;
      body: string;
      /**
       * "now" for a window that has already opened (rendered "Now" instead
       * of "Targeting"); "headline" for the one the page should make the
       * most of (bigger label, brighter dot). Omit for the rest.
       */
      status?: "now" | "headline";
      /** Marks the public-beta window (the one send), so surfaces that
       *  only look forward, like the welcome email, can drop it once
       *  BETA_LINK_SENT is true. Not rendered. */
      oneSend?: boolean;
    }>;
  };

  /**
   * Progress update — the content for a periodic "here's where we are" email
   * sent as a Resend broadcast to the waitlist (see src/emails/update.tsx).
   * This is the one block you edit per send: drop in the latest figures and
   * highlights, refresh the broadcast, send. Everything else (shell, roadmap
   * reminder, unsubscribe) is wired up already.
   */
  progress: {
    /** Email subject line + preview text. */
    subject: string;
    /** Small uppercase label above the headline. */
    eyebrow: string;
    /** The headline for this update. */
    headline: string;
    /** Opening paragraph(s) — the "where we are" framing. */
    intro: ReadonlyArray<string>;
    /**
     * Coverage-map snapshot. Generated by scripts/build-progress-map.ts into
     * public/progress/atlas-current.png from the same data the website uses
     * (counties.ts + progressConfig). Regenerate it after editing
     * progressConfig and before sending. Set enabled:false to omit the map.
     * (Headline figures are derived live from progressConfig — see update.tsx.)
     */
    map: { enabled: boolean; alt: string };
    /**
     * Optional standout course, marked with a glowing pin on the coverage map
     * at the county's centroid (name it in a highlight below). The `county`
     * must match a county in counties.ts exactly — the map build fails loudly
     * on a typo. Set enabled:false to omit the pin.
     */
    spotlight: {
      enabled: boolean;
      /** County the pin sits in (must match counties.ts). */
      county: string;
      /** Course the pin marks — used in the map's alt text. */
      name: string;
    };
    /** What's new this update — a short titled bullet each. */
    highlights: ReadonlyArray<{ title: string; body: string }>;
    /**
     * "Just added" beat: the newly-completed counties as mint chips, plus a few
     * standout courses now on the map. Because those counties are complete,
     * every course in them is in the database — so listing famous ones is safe.
     * Set enabled:false to omit the whole block.
     */
    justAdded: {
      enabled: boolean;
      eyebrow: string;
      /** One line of context above the county chips. */
      lead: string;
      /** County chip labels (order as you like). */
      counties: ReadonlyArray<string>;
      /**
       * How many of a top-100 list (top100golfcourses.com keeps one per
       * country) are now on the map, and which list — "England's top 100",
       * "Scotland's top 100". Set topCount to 0 to hide the line.
       */
      topCount: number;
      topList: string;
      /**
       * Standout courses to feature — `rank` is their place in that top 100
       * (omit/0 to hide the number), `note` an optional aside.
       */
      courses: ReadonlyArray<{
        name: string;
        county: string;
        rank?: number;
        note?: string;
      }>;
    };
    /** Show the honest "what we're up to right now" note (from progressConfig). */
    showRightNow: boolean;
    /** Show the roadmap reminder block (pulled from `roadmap.milestones`). */
    showRoadmap: boolean;
    /** Sign-off line above the names. */
    signoff: string;
  };

  footer: {
    /** Studio attribution + contact, shown to the right of the wordmark. */
    studio: {
      /** Legal company name. Renders UPPERCASE, links to website. */
      name: string;
      /** Trading name, for prose and titles ("Pinehollow Studios"). */
      shortName: string;
      /** Contact email. Renders lowercase as a mailto: link. */
      email: string;
      /** Studio website URL (https://...). */
      website: string;
      /** Display label for the website link (e.g. "pinehollow.studio"). */
      websiteLabel: string;
      /**
       * The studio's Organization node id in structured data. It must be
       * the same string the studio site publishes for itself, so Google
       * reads the two sites as one organisation and its product.
       */
      organizationId: string;
    };
  };
};

export const siteConfig: SiteConfig = {
  brandName: "Vestige",
  brandShortName: "Vestige",
  brandLowerName: "vestige",
  tagline: "Every golf course in Britain, collected.",
  description:
    "A free iPhone app that keeps the golf courses you've played on a map of Great Britain, and shows how your collection compares with your friends'.",
  domain: "vestige.golf",
  appStoreUrl: null,
  contactEmail: "hello@pinehollow.studio",
  supportEmail: "support@pinehollow.studio",

  nav: [
    { href: "/", label: "Home" },
    { href: "/app", label: "The app" },
    { href: "/progress", label: "Progress" },
  ],

  hero: {
    liveCountMinWeekly: 100,
    liveEyebrowLabel: "joined the waiting list this week",
    headline: [`${COURSES_HEADLINE_PLUS} courses. How many have you `, "played", "?"],
    waitlistNote: BETA_LINK_SENT
      ? "The public beta link has gone out. Join now and you'll be first to hear when version 1.0 arrives in January."
      : "Join before 2 October and the public beta link is yours.",
    metaStrip: [
      "iPhone, iOS 26+",
      "Free to download",
      BETA_LINK_SENT ? "Version 1.0 in January" : "Beta link goes out 2 Oct",
    ],
  },

  // England, Scotland and Wales in turn, so the strip reads as the whole
  // island wherever it happens to be scrolled to.
  marquee: [
    "Royal Birkdale",
    "St Andrews",
    "Royal Porthcawl",
    "Sunningdale",
    "Carnoustie",
    "Walton Heath",
    "Royal St George’s",
    "Muirfield",
    "Royal St David’s",
    "Royal Lytham",
    "Royal Troon",
    "Royal Liverpool",
    "St Enodoc",
    "Royal Dornoch",
    "Aberdovey",
    "Saunton",
    "Turnberry",
    "Woodhall Spa",
    "Royal Cinque Ports",
    "Kingsbarns",
    "Pennard",
    "Ganton",
    "Cruden Bay",
    "Notts (Hollinwell)",
    "Nefyn",
    "Alwoodley",
    "North Berwick",
    "Burnham & Berrow",
    "Trevose",
    "Machrihanish",
  ],

  stats: [
    { kind: "number", target: COURSES_HEADLINE, suffix: "+", label: "Courses" },
    { kind: "number", target: COUNTRIES_TOTAL, label: "Countries, one map" },
    { kind: "number", target: 0, prefix: "£", label: "Cost at launch" },
    BETA_LINK_SENT
      ? { kind: "static", value: "Jan", label: "Version 1.0" }
      : { kind: "static", value: "2 Oct", label: "Public beta link" },
  ],

  appPage: {
    headline: ["We kept it to ", "three small ideas", "."],
    lede:
      "No swing analysis. No data dashboards. Just somewhere to keep the places you have played, mark a score if you like, and see how your collection stands.",
    cta: {
      headlinePre: "Play it ",
      headlineItalic: "first",
      headlinePost: ".",
      body: BETA_LINK_SENT
        ? "Join the waiting list. The public beta link went out on 2 October. Version 1.0 follows in January 2027, publicly available and free."
        : "Join the waiting list. The public beta link goes out once, on 2 October, to everyone on it by then. Version 1.0 in January is free, and so is everything after.",
      ctaLabel: "Join the waiting list",
      meta: "iPhone, iOS 26+ · Free to download",
    },
  },

  what: {
    eyebrow: "Why we're building it",
    titlePre: "The list nobody was ",
    titleItalic: "keeping.",
    body: [
      "Ask a golfer how many courses they've played and you'll get a guess, a frown, and a story about a links in Cornwall. What you won't get is a number. Nobody keeps the list.",
      `So we're building one: every course in Great Britain on a single map, the ones you've played marked with a tap, and a friendly tally of who's collected the most. England is finished, all ${COURSES_EXACT_TEXT} of its courses gathered county by county over the past year, and Scotland and Wales are being mapped next. Just the places you've played.`,
      "The name? A vestige is the trace something leaves behind. Every round leaves one.",
    ],
  },

  faq: [
    {
      q: "Is it really free?",
      a: "Yes. The full app and your whole collection are free, and always will be. Mapping a course, filling in your collection, seeing where you stand: none of it costs anything. A paid tier may come later for a few extras, and it will only ever sit on top of the free app.",
    },
    {
      q: "Does it track my score or handicap?",
      a: "No. Vestige isn't a scorecard or a swing analyser. Jot a score against a round if you like, but the point is the collection itself.",
    },
    {
      q: "How does it know which courses I've played?",
      a: "You tell it. One tap marks a course as played, and that is all there is to it.",
    },
    {
      q: "Which courses are in it?",
      a: `Every course in England: all ${COURSES_EXACT_TEXT} of them, from Open Championship links to your local nine-hole pitch & putt, completed county by county with nothing left to add. Scotland and Wales are being mapped next, which takes the map to ${COURSES_TOTAL_TEXT ?? "every"} courses across Great Britain. You can watch it fill in on the progress page.`,
    },
    {
      q: "Which countries does it cover?",
      a: "England, Scotland and Wales: the whole of Great Britain on one map. England is finished. Scotland and Wales are being mapped now, and until they are they sit on the map as still to come.",
    },
    {
      q: "Can I get it outside the UK?",
      a: "At launch, Vestige will be on the UK App Store only, because the map is British courses and there is not much in it for you if you have never played one. If you are British and abroad, the app travels fine: it is where you download it that has to be the UK.",
    },
    {
      q: "What do you do with my data?",
      a: "As little as possible, and no ads. We will never sell your personal data: no names, nothing that ties back to you. Your collection is yours, and you can export or delete it whenever you like.",
    },
    {
      q: "When can I actually use it?",
      a: BETA_LINK_SENT
        ? "The public beta link went out once, on 2 October 2026, to everyone on the waiting list that day. There is no second send: join now and the next way in is version 1.0 in January 2027, publicly available and free. March 2027 is launch day proper. Free at every step."
        : "The public beta link goes out on 2 October 2026. One send, to everyone on the waiting list that day, so join before then and it is yours. There is no second send: join later and the next way in is version 1.0 in January 2027, publicly available and free. Then March 2027 is launch day proper. Free at every step.",
    },
  ],

  features: [
    {
      kind: "atlas",
      eyebrow: "The atlas",
      title: "Every course in Britain.",
      body: `England's ${COURSES_EXACT_TEXT} are in, championship links to your local nine-hole pitch & putt, and Scotland and Wales are being mapped next. Nothing in England is missing on day one.`,
    },
    {
      kind: "tap",
      eyebrow: "One tap",
      title: "Keep the round.",
      body:
        "Tap the course, add a score if you like. No card to scan, no per-hole bookkeeping.",
    },
    {
      kind: "board",
      eyebrow: "Your circle",
      title: "A polite competition.",
      body:
        "See whose collection runs deepest among your friends, and where you rank across the country. It settles the first-tee argument for good.",
    },
  ],

  roadmap: {
    eyebrow: "Road to launch",
    titlePre: "From here, to ",
    titleItalic: "spring",
    titlePost: ".",
    sub: "Three steps between now and the launch.",
    milestones: [
      {
        month: "Oct",
        year: "2026",
        label: "Public beta",
        body: BETA_LINK_SENT
          ? "The TestFlight link, sent once on 2 October to everyone on the waiting list."
          : "The TestFlight link, sent once to everyone on the waiting list. There is no second send.",
        ...(BETA_LINK_SENT ? { status: "now" as const } : {}),
        oneSend: true,
      },
      {
        month: "Jan",
        year: "2027",
        label: "Version 1.0",
        body: "Publicly available, and free. The full app, for anyone who wants in early.",
      },
      {
        month: "Mar",
        year: "2027",
        label: "Launch day",
        body: "The big one. Vestige, out in the world, free for everyone.",
        status: "headline",
      },
    ],
  },

  // The completion send. Headline figures come from progressConfig, so only
  // the words below need touching for the next update.
  progress: {
    subject: "England's done",
    eyebrow: "Progress update",
    headline: "The last county is in.",
    intro: [
      `A big one from the workshop. When you joined the waiting list we had a few counties on the map and a long way to go. As of this month there is nowhere left to go: every golf course in England is in the database. All ${COURSES_EXACT_TEXT} of them, across all ${COUNTIES_TOTAL} ceremonial counties.`,
      "Northumberland was the last one in, which felt about right. We started on the south coast and worked north until we ran out of England.",
    ],
    map: {
      enabled: true,
      alt: "Map of Great Britain with every English county filled in mint, Wales and Scotland beside it still to come.",
    },
    spotlight: {
      enabled: false,
      county: "Lincolnshire",
      name: "Woodhall Spa",
    },
    highlights: [
      {
        title: "The database is finished",
        body: "Which means nothing is missing on the day we launch. You will not open the app and find your home course absent, wherever in England it is.",
      },
      {
        title: "The map now plays it back",
        body: "The progress page on the website runs the whole thing as an animation: the counties filling in south to north, then the coastline drawing itself around a finished England. Worth thirty seconds.",
      },
    ],
    justAdded: {
      enabled: true,
      eyebrow: "The counties that finished it",
      lead: "The last six in, all of them northern, over the past few weeks:",
      counties: [
        "Lancashire",
        "North Yorkshire",
        "Cumbria",
        "County Durham",
        "Tyne and Wear",
        "Northumberland",
      ],
      // Every English course is now in the database, so by definition the whole
      // of the top100golfcourses.com England list is on the map. Ranks are
      // omitted below — the point of this send is the sweep, not the placings.
      topCount: 100,
      topList: "England's top 100",
      courses: [
        {
          name: "Royal Lytham & St Annes",
          county: "Lancashire",
          note: "an Open venue, and the one the list had been missing",
        },
        { name: "Ganton", county: "North Yorkshire" },
        { name: "Silloth on Solway", county: "Cumbria" },
        { name: "Seaton Carew", county: "County Durham" },
      ],
    },
    showRightNow: true,
    showRoadmap: true,
    signoff: "On to the app,",
  },

  closingCta: {
    eyebrowLabel: "already on the list",
    headlinePre: "Be among the ",
    headlineItalic: "first.",
    sub: BETA_LINK_SENT
      ? "The public beta link has gone out. Join and you'll hear first when version 1.0 arrives in January. Never any noise. Promise."
      : "The public beta link goes out once, on 2 October. We'll keep you posted between now and then, and never any noise. Promise.",
    ctaLabel: "Count me in",
    forwardNudge:
      "P.S. Know a golfer who'd swear blind they've played more? Forward them this.",
  },

  footer: {
    studio: {
      name: "Pinehollow Studios Limited",
      shortName: "Pinehollow Studios",
      email: "hello@pinehollow.studio",
      website: "https://www.pinehollow.studio/",
      websiteLabel: "pinehollow.studio",
      organizationId: "https://www.pinehollow.studio/#organization",
    },
  },
};
