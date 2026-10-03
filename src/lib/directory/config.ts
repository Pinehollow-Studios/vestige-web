/**
 * THE indexing switch for the course directory. While false, every
 * /courses page carries noindex and the directory sitemap is left out of
 * robots.txt. Flipping it is Tom's call, once the go-live bar in
 * docs/site-after-the-beta-plan.md slice 4 is met (Jack's rewrites, the
 * provenance of par and yards, the solicitor, attribution).
 */
export const DIRECTORY_INDEXABLE: boolean = false;

/** The country the directory's courses are in today. */
export const DIRECTORY_COVERAGE = "England";
