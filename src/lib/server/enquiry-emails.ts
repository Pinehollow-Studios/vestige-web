/**
 * The club-enquiry emails: the enquiry itself to hello@ (reply goes straight
 * to the club), and a short confirmation to the club from Jack and Tom.
 * Layout shared with the claim emails (claim-emails.ts).
 */
import { site } from "../../config/site";
import { esc, layout, plain, type Block } from "./claim-emails";
import type { Email } from "./resend";

export type Enquiry = {
  name: string;
  role: string;
  email: string;
  phone: string | null;
  club: string;
  courseSlug: string | null;
  interests: string[];
  message: string | null;
  updates: boolean;
};

export function teamEnquiryEmail(e: Enquiry): Email {
  const title = `Club enquiry: ${e.club}`;
  const rows: Array<[string, string]> = [
    ["Club", e.club],
    ["Name", `${e.name}, ${e.role}`],
    ["Email", e.email],
  ];
  if (e.phone) rows.push(["Phone", e.phone]);
  if (e.courseSlug) rows.push(["Page", `${site.url}/courses/${e.courseSlug}`]);
  rows.push(["Interested in", e.interests.length ? e.interests.join("; ") : "Not said"]);
  rows.push(["Updates", e.updates ? "Yes, opted in" : "No"]);
  const blocks: Block[] = [{ rows }];
  if (e.message) blocks.push({ p: "<strong>Their message</strong>" }, { code: e.message });
  blocks.push({ p: "Reply to this email to answer them directly. We promised a reply within two working days." });
  return {
    to: site.email.hello,
    replyTo: e.email,
    subject: title,
    html: layout("For clubs", title, blocks, "Sent by vestige.golf/clubs to the team."),
    text: plain(title, [...rows.map(([k, v]) => `${k}: ${v}`), ...(e.message ? ["", e.message] : [])]),
  };
}

export function enquiryReceivedEmail(e: Enquiry): Email {
  const title = "Thanks for getting in touch";
  return {
    to: e.email,
    subject: `Vestige and ${e.club}`,
    html: layout(
      "For clubs",
      title,
      [
        { p: `Hello ${esc(e.name)},` },
        {
          p: `Thanks for your note about ${esc(e.club)}. It has come straight to the two of us, and one of us will reply within two working days.`,
        },
        {
          p: `In the meantime, if you haven’t already, you can claim ${esc(e.club)}’s page on Vestige. It’s free and takes a minute.`,
        },
        { button: { href: `${site.url}/clubs/claim${e.courseSlug ? `?course=${e.courseSlug}` : ""}`, label: "Claim your page" } },
      ],
      `You’re getting this because you sent an enquiry from ${site.domain}/clubs. We use your details only to reply and keep a record of it.`
    ),
    text: plain(title, [
      `Hello ${e.name},`,
      "",
      `Thanks for your note about ${e.club}. One of us will reply within two working days.`,
      "",
      `Claim your page, free: ${site.url}/clubs/claim${e.courseSlug ? `?course=${e.courseSlug}` : ""}`,
    ]),
  };
}
