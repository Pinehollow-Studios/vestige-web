import type { APIRoute } from "astro";
import { CLAIM_ROLES, claimRpc } from "../../lib/server/claims";
import { findCourse } from "../../lib/server/course-index";
import { ENQUIRY_INTERESTS } from "../../lib/clubs";
import { enquiryReceivedEmail, teamEnquiryEmail, type Enquiry } from "../../lib/server/enquiry-emails";
import { sendEmail } from "../../lib/server/resend";
import { clientIp, withinLimit, workerEnv } from "../../lib/server/worker-env";

/**
 * An enquiry from a golf club (the form on /clubs). Stored through
 * web_enquiry_create (vestige-ios migration 20261003150000), sent to hello@
 * with the club as reply-to, and confirmed to the club.
 *
 * With JavaScript the form posts here as a fetch and gets JSON; without it,
 * a plain post that lands on /clubs/thanks (or back on /clubs with an error).
 * Spam: a honeypot, a minimum time on the page (set by the page's script),
 * per-IP limits, and five enquiries per address a day in the database.
 */
export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set<string>(CLAIM_ROLES);
const INTERESTS = new Set<string>(ENQUIRY_INTERESTS);
const MIN_MS = 3000;

const MESSAGES: Record<string, string> = {
  missing: "Fill in your name, your club, your role and your email.",
  email: "That doesn’t look like an email address.",
  too_many: "That address has sent several enquiries today. We’ll be in touch about the first.",
  busy: "Too many tries in a minute. Give it a moment and send it again.",
  error: "Something went wrong on our side. Try again in a minute, or email hello@pinehollow.studio.",
};

export const POST: APIRoute = async ({ request, url }) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return new Response("Forbidden.", { status: 403 });

  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  const reply = (code: "ok" | keyof typeof MESSAGES) =>
    wantsJson
      ? Response.json(
          code === "ok" ? { ok: true } : { ok: false, error: MESSAGES[code] },
          { status: code === "ok" ? 200 : 400, headers: { "Cache-Control": "no-store" } }
        )
      : Response.redirect(new URL(code === "ok" ? "/clubs/thanks" : `/clubs?error=${code}#enquire`, url), 303);

  const form = await request.formData().catch(() => null);
  const field = (k: string, max: number) => String(form?.get(k) ?? "").trim().slice(0, max);

  // Bots: a filled honeypot, or a form sent faster than a person could. Look done, do nothing.
  const started = Number(field("started", 16));
  if (field("website", 200) || (started > 0 && Date.now() - started < MIN_MS)) return reply("ok");

  if (!(await withinLimit(workerEnv.CLAIM_LIMITER, clientIp(request)))) return reply("busy");

  const course = findCourse(field("course", 200));
  const club = field("club", 160) || course?.name || "";
  const name = field("name", 120);
  const role = field("role", 60);
  const email = field("email", 254).toLowerCase();
  if (!name || !club || !ROLES.has(role) || !email) return reply("missing");
  if (!EMAIL.test(email)) return reply("email");

  const enquiry: Enquiry = {
    name,
    role,
    email,
    phone: field("phone", 40) || null,
    club,
    courseSlug: course?.slug ?? null,
    interests: (form?.getAll("interests") ?? []).map(String).filter((i) => INTERESTS.has(i)),
    message: field("message", 4000) || null,
    updates: form?.get("updates") === "yes",
  };

  const saved = await claimRpc("web_enquiry_create", {
    p_slug: enquiry.courseSlug,
    p_club_name: enquiry.club,
    p_name: enquiry.name,
    p_role: enquiry.role,
    p_email: enquiry.email,
    p_phone: enquiry.phone,
    p_interests: enquiry.interests,
    p_message: enquiry.message,
    p_updates: enquiry.updates,
  });
  if (!saved.ok) {
    if (saved.reason === "too_many") return reply("too_many");
    if (saved.reason === "bad_email") return reply("email");
    // The database is down or refused: still get the enquiry to us by email.
    console.error("[enquire] not stored", saved.reason);
    const sent = await sendEmail(teamEnquiryEmail(enquiry));
    if (!sent) return reply("error");
  } else {
    await sendEmail(teamEnquiryEmail(enquiry));
  }
  await sendEmail(enquiryReceivedEmail(enquiry));
  return reply("ok");
};
