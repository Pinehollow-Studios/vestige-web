/**
 * Waitlist acquisition sources.
 *
 * A signup is tagged with where it came from via a `?from=` URL parameter
 * (e.g. vestige.golf/?from=insiders). The tag rides along invisibly through
 * link-preview cards in Messages/WhatsApp/Snapchat and is read on submit.
 *
 * Why this matters: the pre-launch "Founding Member" badge is awarded
 * retroactively to people who logged a round during the beta. To reconcile
 * that later we need to know each signup's source from day one — it cannot be
 * reconstructed after the fact. The source is stored on the Resend contact
 * itself (in last_name — see resend.ts for why), so it's exportable per signup.
 *
 * To add a source: just add it to the list below. No other setup needed.
 */

export const WAITLIST_SOURCES = ["insiders", "hankley", "organic"] as const;
export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];

const KNOWN = new Set<string>(WAITLIST_SOURCES);

/**
 * Normalise an arbitrary `?from=` value to a known source. Anything unknown,
 * empty, or junk (a stray/typed URL, a future tag we haven't added yet) falls
 * back to "organic" so the data is never blank and never polluted.
 */
export function normalizeSource(raw: unknown): WaitlistSource {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return (KNOWN.has(value) ? value : "organic") as WaitlistSource;
}
