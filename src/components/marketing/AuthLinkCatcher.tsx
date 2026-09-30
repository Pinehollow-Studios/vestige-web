"use client";

import { useEffect } from "react";

/**
 * Catches an account-email link that landed on the homepage and sends it to
 * /auth/email with a one-word state.
 *
 * Supabase redirects the two "change your email" links to the Site URL
 * (https://vestige.golf) with what happened appended - in the query string for
 * the app's PKCE flow, in the fragment for the implicit one:
 *   message=Confirmation link accepted...   the first of the two links
 *   code=... / access_token=...             the second: the change is done
 *   error=... / error_description=...       a spent or expired link
 * None of it means anything on the homepage, and the code or token must not
 * sit in the address bar, so this replaces the whole URL rather than adding to
 * it. Renders nothing; does nothing on an ordinary visit.
 */
export function AuthLinkCatcher() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const has = (k: string) => params.has(k) || hash.has(k);

    let state: "partial" | "done" | "error" | null = null;
    if (has("error") || has("error_description") || has("error_code")) state = "error";
    else if (has("message")) state = "partial";
    else if (has("code") || has("access_token")) state = "done";
    if (!state) return;

    window.location.replace(`/auth/email?s=${state}`);
  }, []);
  return null;
}
