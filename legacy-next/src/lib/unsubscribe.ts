import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Signed unsubscribe links for the transactional welcome email.
 *
 * The welcome email is a one-off transactional send (not a Resend broadcast), so
 * Resend's broadcast-only {{{RESEND_UNSUBSCRIBE_URL}}} variable isn't available.
 * Instead we mint our own link: /unsubscribe?email=<email>&token=<hmac>, where
 * the token is HMAC-SHA256(email) keyed by a server-only secret. Only links we
 * generated verify, so nobody can unsubscribe an arbitrary address by guessing
 * the URL. The /unsubscribe route handler verifies the token and flips the
 * Resend contact to unsubscribed.
 *
 * Secret: UNSUBSCRIBE_SECRET if set, otherwise RESEND_API_KEY (already present
 * wherever welcome emails are actually sent — sendWelcomeEmail no-ops without
 * it). Set a dedicated UNSUBSCRIBE_SECRET if you'd rather old links survive an
 * API-key rotation. Without either, no link is minted (and none is needed: no
 * key means no send).
 */

function secret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY || null;
}

const normalize = (email: string) => email.trim().toLowerCase();

/** HMAC token for an email (base64url), or null if no secret is configured. */
export function unsubscribeToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update(normalize(email)).digest("base64url");
}

/** Constant-time check that `token` is the one we'd mint for `email`. */
export function verifyUnsubscribeToken(
  email: string,
  token: string | null | undefined
): boolean {
  if (!token) return false;
  const expected = unsubscribeToken(email);
  if (!expected) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  // timingSafeEqual throws on length mismatch, so length-gate first.
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Absolute one-click unsubscribe URL for an email, or null if unconfigured. */
export function unsubscribeUrl(email: string): string | null {
  const token = unsubscribeToken(email);
  if (!token) return null;
  const qs = new URLSearchParams({ email: normalize(email), token });
  return `https://${siteConfig.domain}/unsubscribe?${qs.toString()}`;
}
