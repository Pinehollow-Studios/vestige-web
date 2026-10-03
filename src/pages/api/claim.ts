import type { APIRoute } from "astro";
import { receivedEmail, teamClaimEmail, verifyEmail } from "../../lib/server/claim-emails";
import { CLAIM_ROLES, claimRpc, newToken, sha256 } from "../../lib/server/claims";
import { findCourse } from "../../lib/server/course-index";
import { sendEmail } from "../../lib/server/resend";
import { clientIp, withinLimit, workerEnv } from "../../lib/server/worker-env";

/**
 * A club claims its course page (the form on /clubs/claim).
 *
 * The database decides the path (web_claim_create): an address on the club's
 * own website domain gets a confirm link by email; anything else, or a course
 * already claimed, waits for Tom or Jack, who get every claim at hello@ with
 * a link to approve or decline it. Answers with a redirect back to the page.
 */
export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set<string>(CLAIM_ROLES);

export const POST: APIRoute = async ({ request, url }) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return new Response("Forbidden.", { status: 403 });

  const form = await request.formData().catch(() => null);
  const field = (k: string) => String(form?.get(k) ?? "").trim();
  const course = findCourse(field("course"));
  if (!course) return Response.redirect(new URL("/clubs/claim", url), 303);

  const back = (params: Record<string, string>) =>
    Response.redirect(new URL(`/clubs/claim?${new URLSearchParams({ course: course.slug, ...params })}`, url), 303);

  // A bot filled the hidden field: look done, do nothing.
  if (field("website")) return back({ sent: "review" });

  if (!(await withinLimit(workerEnv.CLAIM_LIMITER, clientIp(request)))) return back({ error: "busy" });

  const name = field("name").slice(0, 120);
  const role = field("role");
  const email = field("email").toLowerCase();
  if (!name || !ROLES.has(role) || field("speaks") !== "yes" || !email) return back({ error: "missing" });
  if (email.length > 254 || !EMAIL.test(email)) return back({ error: "email" });

  const verifyToken = newToken();
  const reviewToken = newToken();
  const reply = await claimRpc("web_claim_create", {
    p_slug: course.slug,
    p_name: name,
    p_role: role,
    p_email: email,
    p_verify_sha256: await sha256(verifyToken),
    p_review_sha256: await sha256(reviewToken),
  });
  if (!reply.ok) {
    if (reply.reason === "too_many" || reply.reason === "bad_email") {
      return back({ error: reply.reason === "too_many" ? "too_many" : "email" });
    }
    return back({ error: "error" });
  }

  const auto = reply.status === "awaiting_email";
  // Links point back at the site that took the claim (staging links stay on staging).
  const link = (path: string, token: string) => new URL(`${path}?t=${token}`, url.origin).toString();

  await Promise.all([
    auto
      ? sendEmail(verifyEmail({ to: email, name, course: course.name, link: link("/clubs/claim/confirm", verifyToken) }))
      : sendEmail(receivedEmail({ to: email, name, course: course.name, alreadyClaimed: !!reply.already_claimed })),
    sendEmail(
      teamClaimEmail({
        course: course.name,
        slug: course.slug,
        name,
        role,
        email,
        status: reply.status ?? "awaiting_review",
        domainMatch: !!reply.domain_match,
        alreadyClaimed: !!reply.already_claimed,
        website: reply.website ?? null,
        reviewLink: link("/clubs/claim/review", reviewToken),
      })
    ),
  ]);

  return back({ sent: auto ? "email" : "review" });
};
