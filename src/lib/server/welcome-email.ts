/**
 * The welcome email, sent once to a new signup (or a returning one who had
 * unsubscribed). Hand-written table HTML so it renders in every mail client
 * and builds in a Worker without a rendering library. Light, in the site's
 * palette; copy per the house voice.
 */
import { site } from "../../config/site";

const ink = "#0b0f14";
const secondary = "#4a5662";
const mint = "#0faf88";
const surface = "#f2f5fa";
const card = "#ffffff";
const edge = "#e3e8f0";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const roadmap = [
  { when: "January 2027", what: "Version 1.0", note: "Publicly available, and free." },
  { when: "March 2027", what: "Launch day", note: "The big one. Vestige, out in the world." },
];

export function welcomeEmail(unsubscribeUrl: string | null): { html: string; text: string } {
  const unsub = unsubscribeUrl ?? `mailto:${site.email.hello}?subject=Unsubscribe%20from%20Vestige`;
  const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

  const rows = roadmap
    .map(
      (r) => `<tr><td style="padding:10px 0;border-top:1px solid ${edge};font:600 15px/1.4 ${font};color:${ink};width:140px;vertical-align:top">${r.when}</td><td style="padding:10px 0;border-top:1px solid ${edge};font:15px/1.5 ${font};color:${secondary}"><strong style="color:${ink}">${r.what}.</strong> ${r.note}</td></tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Welcome to ${site.name}</title></head>
<body style="margin:0;padding:0;background:${surface}">
<div style="display:none;max-height:0;overflow:hidden">You’re on the ${site.name} list. ${escape(site.tagline)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${surface}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 4px 20px"><img src="${site.url}/brand/vestige-globe-256.png" width="32" height="32" alt="" style="vertical-align:middle;border:0"> <span style="font:600 20px/1 ${font};color:${ink};vertical-align:middle">&nbsp;${site.name}</span></td></tr>
<tr><td style="background:${card};border:1px solid ${edge};border-radius:20px;padding:32px 28px">
<p style="margin:0 0 6px;font:500 13px/1.4 ${font};color:${secondary}">Welcome</p>
<h1 style="margin:0 0 16px;font:600 28px/1.15 ${font};color:${ink}">You’re on the list.</h1>
<p style="margin:0 0 16px;font:16px/1.6 ${font};color:${secondary}">Thanks for signing up for ${site.name}, the way to keep every golf course you’ve played in Great Britain and see how your collection stands against your friends’.</p>
<p style="margin:0 0 24px;padding:14px 16px;border-left:3px solid ${mint};background:${surface};border-radius:6px;font:15px/1.55 ${font};color:${secondary}">${site.name} is in beta now, by invitation. Version 1.0 lands in January 2027, publicly available and free, and you’ll hear the day it does, straight to this address.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<p style="margin:24px 0 0;font:16px/1.6 ${font};color:${secondary}">We’ll keep you posted as we build it: the odd note for now, and first word the moment it’s ready to play. No noise in between.</p>
<p style="margin:20px 0 0;font:600 16px/1.4 ${font};color:${ink}">Jack and Tom</p>
</td></tr>
<tr><td style="padding:20px 8px 0;font:13px/1.6 ${font};color:${secondary}">You’re getting this because you signed up at <a href="${site.url}" style="color:${secondary}">${site.domain}</a>. Joined by mistake? <a href="${escape(unsub)}" style="color:${secondary}">Unsubscribe</a>.<br>${site.company.name}, registered in ${site.company.registeredIn}, company number ${site.company.number}.</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    "You’re on the list.",
    "",
    `Thanks for signing up for ${site.name}, the way to keep every golf course you’ve played in Great Britain and see how your collection stands against your friends’.`,
    "",
    `${site.name} is in beta now, by invitation. Version 1.0 lands in January 2027, publicly available and free, and you’ll hear the day it does, straight to this address.`,
    "",
    ...roadmap.map((r) => `${r.when} - ${r.what}. ${r.note}`),
    "",
    "We’ll keep you posted as we build it: the odd note for now, and first word the moment it’s ready to play. No noise in between.",
    "",
    "Jack and Tom",
    "",
    `You’re getting this because you signed up at ${site.domain}. Unsubscribe: ${unsub}`,
  ].join("\n");

  return { html, text };
}
