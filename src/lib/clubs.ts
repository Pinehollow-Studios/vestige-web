/**
 * Shared words for the club pages and their endpoints. The enquiry's
 * interests are outcomes a club wants, never the products behind them
 * (docs/clubs-plan.md: nothing that shows our hand, nothing priced).
 */
export const ENQUIRY_INTERESTS = [
  "Bringing more visiting golfers to the club",
  "Being on the lists golfers are working through",
  "Understanding who wants to play us",
  "Being one of the first clubs we work with",
  "Something else",
] as const;

/** Who is writing, for claims and enquiries alike. */
export const CLAIM_ROLES = [
  "Secretary or general manager",
  "Owner or director",
  "Head professional",
  "Marketing or membership",
  "Committee member",
  "Other",
] as const;
