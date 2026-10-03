/**
 * Facts the whole site shares. Company details match legal/README.md;
 * change them there and here together.
 */
export const site = {
  name: "Vestige",
  fullName: "Vestige Golf",
  domain: "vestige.golf",
  url: "https://vestige.golf",
  tagline: "Every golf course in Britain, collected.",
  description:
    "A free iPhone app that keeps the golf courses you've played on a map of Great Britain, and shows how your collection compares with your friends'.",
  email: {
    hello: "hello@pinehollow.studio",
    support: "support@pinehollow.studio",
  },
  company: {
    name: "Pinehollow Studios Limited",
    shortName: "Pinehollow Studios",
    number: "17212889",
    registeredIn: "England and Wales",
    office: "82A James Carter Road, Mildenhall, Bury St. Edmunds, IP28 7DE",
    website: "https://www.pinehollow.studio/",
    /** Must match the Organization @id the studio site publishes. */
    organizationId: "https://www.pinehollow.studio/#organization",
  },
} as const;

/**
 * The public TestFlight link. The beta is by invitation since 2 Oct 2026:
 * only /beta, shared by hand, offers it.
 */
export const testflightUrl = "https://testflight.apple.com/join/atyEAmqR";

/** The main navigation, in order. Sections join as their releases land. */
export const nav: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/courses", label: "Courses" },
  { href: "/app", label: "The app" },
];

export const legalNav: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/guidelines", label: "Community guidelines" },
];
