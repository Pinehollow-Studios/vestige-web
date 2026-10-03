/**
 * What happens once a claim is verified, whichever way it was verified (the
 * club's own confirm link, or Tom or Jack approving it): the club gets its
 * private link and badge by email, and the site is rebuilt so the
 * "Claimed by the club" mark goes on (when a deploy hook is set; until then
 * the next deploy carries it).
 */
import { getSecret } from "astro:env/server";
import { site } from "../../config/site";
import { claimedEmail } from "./claim-emails";
import { sendEmail } from "./resend";

export async function afterVerified(o: {
  origin: string;
  email: string;
  name: string;
  course: string;
  slug: string;
  manageToken: string;
}): Promise<void> {
  const manageLink = new URL(`/clubs/manage?t=${o.manageToken}`, o.origin).toString();
  const hook = getSecret("DEPLOY_HOOK_URL");
  await Promise.all([
    sendEmail(claimedEmail({ to: o.email, name: o.name, course: o.course, slug: o.slug, manageLink })),
    sendEmail({
      to: site.email.hello,
      replyTo: o.email,
      subject: `Claimed: ${o.course}`,
      html: `<p>${o.course} is now claimed by ${o.name} (${o.email}).</p><p>${
        hook ? "A rebuild has been requested, so the mark goes on shortly." : "No deploy hook yet: the mark goes on at the next deploy."
      }</p>`,
      text: `${o.course} is now claimed by ${o.name} (${o.email}). ${hook ? "Rebuild requested." : "The mark goes on at the next deploy."}`,
    }),
    hook ? fetch(hook, { method: "POST" }).catch((err) => console.error("[claims] deploy hook", err)) : null,
  ]);
}

/** A form post from this site, or nothing. */
export function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === url.origin;
}
