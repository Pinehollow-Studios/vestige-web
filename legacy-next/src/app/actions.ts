"use server";

import { addToWaitlist } from "@/lib/resend";
import { mirrorWaitlistToDb } from "@/lib/waitlistDb";
import { sendWelcomeEmail } from "@/lib/email";
import { normalizeSource } from "@/lib/sources";

export type JoinWaitlistState =
  | { status: "idle" }
  | { status: "ok"; email: string }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(
  _prevState: JoinWaitlistState,
  formData: FormData
): Promise<JoinWaitlistState> {
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return { status: "error", message: "That doesn't look like a valid email." };
  }

  // Where the signup came from (?from= tag, validated against the known list).
  const source = normalizeSource(formData.get("source"));

  const result = await addToWaitlist(email, source);
  if (!result.ok) return { status: "error", message: result.error };

  // Mirror into our own Supabase so the list is owned + sendable from the
  // bunker. Best-effort — never blocks the signup (Resend is the primary
  // capture).
  await mirrorWaitlistToDb(email, source);

  // Welcome genuinely-new signups and returning contacts who had unsubscribed
  // (they're opting back in) — but not active subscribers re-submitting. Only
  // when the contact was actually saved (live mode). sendWelcomeEmail swallows
  // its own errors, so a failed send never turns a successful signup into an
  // error.
  if (result.mode === "live" && (result.isNew || result.rejoined)) {
    await sendWelcomeEmail(email);
  }

  return { status: "ok", email };
}
