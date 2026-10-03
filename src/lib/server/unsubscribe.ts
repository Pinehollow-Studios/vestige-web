/**
 * Signed unsubscribe links for the welcome email: /unsubscribe?email=&token=,
 * where token = base64url(HMAC-SHA256(email)) keyed by UNSUBSCRIBE_SECRET, or
 * RESEND_API_KEY when that isn't set (as on the old site, so links in emails
 * already sent keep working). Web Crypto, so it runs in a Worker.
 */
import { getSecret } from "astro:env/server";
import { site } from "../../config/site";

const encoder = new TextEncoder();
const normalize = (email: string) => email.trim().toLowerCase();

function secret(): string | null {
  return getSecret("UNSUBSCRIBE_SECRET") || getSecret("RESEND_API_KEY") || null;
}

function base64url(bytes: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function unsubscribeToken(email: string): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const k = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(await crypto.subtle.sign("HMAC", k, encoder.encode(normalize(email))));
}

/** Constant-time comparison of the token we'd mint with the one given. */
export async function verifyUnsubscribeToken(email: string, token: string | null): Promise<boolean> {
  if (!token) return false;
  const expected = await unsubscribeToken(email);
  if (!expected || expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

export async function unsubscribeUrl(email: string): Promise<string | null> {
  const token = await unsubscribeToken(email);
  if (!token) return null;
  return `${site.url}/unsubscribe?${new URLSearchParams({ email: normalize(email), token })}`;
}
