/**
 * The club-claim emails. Same hand-written table HTML as the welcome email
 * (welcome-email.ts), so they render everywhere and build in a Worker. House
 * voice: brief, warm, en-GB, no exclamation marks.
 */
import { site } from "../../config/site";
import type { Email } from "./resend";

const ink = "#0b0f14";
const secondary = "#4a5662";
const mint = "#0faf88";
const surface = "#f2f5fa";
const card = "#ffffff";
const edge = "#e3e8f0";
const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Block =
  | { p: string }
  | { button: { href: string; label: string } }
  | { rows: Array<[string, string]> }
  | { code: string }
  | { note: string };

function layout(kicker: string, title: string, blocks: Block[], footer: string): string {
  const body = blocks
    .map((b) => {
      if ("p" in b) return `<p style="margin:0 0 16px;font:16px/1.6 ${font};color:${secondary}">${b.p}</p>`;
      if ("note" in b)
        return `<p style="margin:0 0 16px;padding:14px 16px;border-left:3px solid ${mint};background:${surface};border-radius:6px;font:15px/1.55 ${font};color:${secondary}">${b.note}</p>`;
      if ("code" in b)
        return `<pre style="margin:0 0 16px;padding:14px 16px;background:${surface};border-radius:8px;font:13px/1.5 Menlo,Consolas,monospace;color:${ink};white-space:pre-wrap;word-break:break-all">${esc(b.code)}</pre>`;
      if ("rows" in b)
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px">${b.rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:8px 0;border-top:1px solid ${edge};font:600 14px/1.4 ${font};color:${ink};width:150px;vertical-align:top">${esc(k)}</td><td style="padding:8px 0;border-top:1px solid ${edge};font:14px/1.5 ${font};color:${secondary}">${esc(v)}</td></tr>`
          )
          .join("")}</table>`;
      return `<p style="margin:8px 0 24px"><a href="${esc(b.button.href)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:${ink};color:#ffffff;font:600 16px/1 ${font};text-decoration:none">${esc(b.button.label)}</a></p>`;
    })
    .join("");
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${surface}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${surface}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 4px 20px"><img src="${site.url}/brand/vestige-globe-256.png" width="32" height="32" alt="" style="vertical-align:middle;border:0"> <span style="font:600 20px/1 ${font};color:${ink};vertical-align:middle">&nbsp;${site.name}</span></td></tr>
<tr><td style="background:${card};border:1px solid ${edge};border-radius:20px;padding:32px 28px">
<p style="margin:0 0 6px;font:500 13px/1.4 ${font};color:${secondary}">${esc(kicker)}</p>
<h1 style="margin:0 0 16px;font:600 26px/1.2 ${font};color:${ink}">${esc(title)}</h1>
${body}
<p style="margin:8px 0 0;font:600 16px/1.4 ${font};color:${ink}">Jack and Tom</p>
</td></tr>
<tr><td style="padding:20px 8px 0;font:13px/1.6 ${font};color:${secondary}">${footer}<br>${site.company.name}, registered in ${site.company.registeredIn}, company number ${site.company.number}.</td></tr>
</table></td></tr></table></body></html>`;
}

function plain(title: string, lines: string[]): string {
  return [title, "", ...lines, "", "Jack and Tom", `${site.name} - ${site.url}`].join("\n");
}

const why = (email: string) =>
  `You’re getting this because someone asked to claim a course page on ${site.domain} with ${esc(email)}. Not you? Ignore it and nothing happens.`;

const pageUrl = (slug: string) => `${site.url}/courses/${slug}`;

/** To the claimant, at the club's own domain: the one-click proof. */
export function verifyEmail(o: { to: string; name: string; course: string; link: string }): Email {
  const title = `Confirm your claim on ${o.course}`;
  return {
    to: o.to,
    subject: title,
    html: layout(
      "Claim your page",
      title,
      [
        { p: `Hello ${esc(o.name)},` },
        { p: `Thanks for claiming ${esc(o.course)}’s page on ${site.name}. Your address matches the club’s website, so one click finishes it.` },
        { button: { href: o.link, label: "Confirm the claim" } },
        { note: "The link works for three days. You’ll then get a private link for suggesting changes to the page, and a badge for your website." },
      ],
      why(o.to)
    ),
    text: plain(title, [
      `Hello ${o.name},`,
      "",
      `Thanks for claiming ${o.course}’s page on ${site.name}. Your address matches the club’s website, so one click finishes it:`,
      o.link,
      "",
      "The link works for three days.",
    ]),
  };
}

/** To the claimant when we have to check by hand. */
export function receivedEmail(o: { to: string; name: string; course: string; alreadyClaimed: boolean }): Email {
  const title = `We’ve got your claim for ${o.course}`;
  const line = (course: string) =>
    o.alreadyClaimed
      ? `${course}’s page is already claimed, so we’ll check with the club before anything changes.`
      : `Your email address isn’t on the club’s own domain, so we’ll confirm with the club first. It usually takes a couple of working days.`;
  return {
    to: o.to,
    subject: title,
    html: layout(
      "Claim your page",
      title,
      [
        { p: `Hello ${esc(o.name)},` },
        { p: line(esc(o.course)) },
        { p: `If you have an address at the club, claiming with that is instant. Otherwise there’s nothing to do: we’ll be in touch.` },
      ],
      why(o.to)
    ),
    text: plain(title, [`Hello ${o.name},`, "", line(o.course)]),
  };
}

/** To hello@: every claim, with the link that approves or declines it. */
export function teamClaimEmail(o: {
  course: string;
  slug: string;
  name: string;
  role: string;
  email: string;
  status: string;
  domainMatch: boolean;
  alreadyClaimed: boolean;
  website: string | null;
  reviewLink: string;
}): Email {
  const auto = o.status === "awaiting_email";
  const title = `${auto ? "Claim (auto)" : "Claim to check"}: ${o.course}`;
  const rows: Array<[string, string]> = [
    ["Course", o.course],
    ["Page", pageUrl(o.slug)],
    ["Name", o.name],
    ["Role", o.role],
    ["Email", o.email],
    ["Club website", o.website ?? "none on file"],
    ["Domain match", o.domainMatch ? "Yes" : "No"],
    ["Already claimed", o.alreadyClaimed ? "Yes - approving hands it over" : "No"],
  ];
  return {
    to: site.email.hello,
    replyTo: o.email,
    subject: title,
    html: layout(
      "Club claims",
      title,
      [
        {
          p: auto
            ? "The address matches the club’s website, so a confirm link has gone to it. Nothing to do unless it looks wrong."
            : "This one needs a check. Confirm with the club (reply to the contact on their website), then approve or decline.",
        },
        { rows },
        { button: { href: o.reviewLink, label: auto ? "Review anyway" : "Approve or decline" } },
      ],
      "Sent by vestige.golf to the team. The review link is a key: don’t forward it."
    ),
    text: plain(title, [...rows.map(([k, v]) => `${k}: ${v}`), "", `Review: ${o.reviewLink}`]),
  };
}

/** To a verified club: what they now have. */
export function claimedEmail(o: { to: string; name: string; course: string; slug: string; manageLink: string }): Email {
  const title = `${o.course} is claimed`;
  const snippet = badgeSnippet(o.slug, o.course);
  return {
    to: o.to,
    subject: title,
    html: layout(
      "Your page on Vestige",
      title,
      [
        { p: `Hello ${esc(o.name)},` },
        { p: `${esc(o.course)}’s page is yours. The “Claimed by the club” mark goes on with our next update, usually within a day or two.` },
        { p: "Your private link is below. Use it whenever something on the page needs changing: we read every suggestion and Jack makes the edit." },
        { button: { href: o.manageLink, label: "Suggest a change" } },
        { p: "For your website, a badge that links golfers to your page. Paste this where you’d like it to appear:" },
        { code: snippet },
        { note: "Keep this email: the link above is the key to your page, so don’t forward it. Lost it? Reply and we’ll send a new one." },
      ],
      `You’re getting this because you claimed ${esc(o.course)} on ${site.domain}.`
    ),
    text: plain(title, [
      `Hello ${o.name},`,
      "",
      `${o.course}’s page is yours. The “Claimed by the club” mark goes on with our next update.`,
      "",
      `Suggest a change: ${o.manageLink}`,
      "",
      "Badge for your website:",
      snippet,
    ]),
  };
}

/** To a claimant we declined. */
export function declinedEmail(o: { to: string; name: string; course: string }): Email {
  const title = `Your claim for ${o.course}`;
  return {
    to: o.to,
    subject: title,
    html: layout(
      "Claim your page",
      title,
      [
        { p: `Hello ${esc(o.name)},` },
        { p: `We couldn’t confirm your claim on ${esc(o.course)}’s page with the club, so we haven’t made the change.` },
        { p: "If you think that’s wrong, reply to this email, ideally from an address at the club, and we’ll take another look." },
      ],
      why(o.to)
    ),
    text: plain(title, [
      `Hello ${o.name},`,
      "",
      `We couldn’t confirm your claim on ${o.course}’s page with the club, so we haven’t made the change.`,
      "If you think that’s wrong, reply to this email and we’ll take another look.",
    ]),
  };
}

/** To hello@: a suggested change, for Jack. */
export function teamSuggestionEmail(o: {
  course: string;
  slug: string;
  name: string;
  email: string;
  description: string | null;
  website: string | null;
  established: number | null;
  notes: string | null;
}): Email {
  const title = `Suggested change: ${o.course}`;
  const rows: Array<[string, string]> = [
    ["Course", o.course],
    ["Page", pageUrl(o.slug)],
    ["From", `${o.name} <${o.email}>`],
  ];
  if (o.website) rows.push(["Website", o.website]);
  if (o.established != null) rows.push(["Founded", String(o.established)]);
  const blocks: Block[] = [{ rows }];
  if (o.description) blocks.push({ p: "<strong>Description</strong>" }, { code: o.description });
  if (o.notes) blocks.push({ p: "<strong>Notes</strong>" }, { code: o.notes });
  blocks.push({ p: "Saved in web_course_suggestions as pending. Nothing changes on the page until Jack edits the course." });
  return {
    to: site.email.hello,
    replyTo: o.email,
    subject: title,
    html: layout("Club suggestions", title, blocks, "Sent by vestige.golf to the team."),
    text: plain(title, [
      ...rows.map(([k, v]) => `${k}: ${v}`),
      ...(o.description ? ["", "Description:", o.description] : []),
      ...(o.notes ? ["", "Notes:", o.notes] : []),
    ]),
  };
}

/** The HTML a club pastes onto its own site. */
export function badgeSnippet(slug: string, course: string): string {
  return `<a href="${pageUrl(slug)}" title="${esc(course)} on Vestige"><img src="${site.url}/badges/collect-us-on-vestige.png" width="192" height="68" alt="Collect us on Vestige"></a>`;
}
