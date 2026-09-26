import * as React from "react";
import { Heading, Link, Section, Text } from "@react-email/components";
import {
  EmailShell,
  Eyebrow,
  brand,
  h1Style,
  pStyle,
} from "../lib/emailShell";
import { betaLinkStillToCome, siteConfig } from "../lib/siteConfig";

/**
 * Welcome email — fires from the joinWaitlist server action when a *new*
 * contact joins the waiting list. The only personalisation is the per-recipient
 * `unsubscribeUrl` (a signed one-click link minted in lib/email.tsx); previews
 * render without it and fall back to the support mailto. Tinker freely; preview
 * with `npm run email`.
 *
 * The beta paragraph and the roadmap switch on BETA_LINK_SENT (siteConfig) on
 * purpose: the public beta link is a single send, so once it has gone out this
 * email must stop promising it to people who joined too late, and the roadmap
 * drops the October row. The flag is flipped by hand after the send.
 */
export default function WelcomeEmail({
  unsubscribeUrl,
}: {
  unsubscribeUrl?: string;
}) {
  const unsubscribeHref =
    unsubscribeUrl ??
    `mailto:${siteConfig.contactEmail}?subject=Unsubscribe%20from%20Vestige`;
  return (
    <EmailShell
      preview={`You're on the ${siteConfig.brandName} waiting list. ${siteConfig.tagline}`}
      footer={
        <>
          You&rsquo;re getting this because you joined the waiting list at{" "}
          {siteConfig.domain}. Joined by mistake?{" "}
          <Link
            href={unsubscribeHref}
            style={{ color: brand.ink2, textDecoration: "underline" }}
          >
            Unsubscribe
          </Link>
          .
        </>
      }
    >
      <Eyebrow>The waiting list</Eyebrow>
      <Heading style={h1Style}>You&rsquo;re on the list.</Heading>

      <Text style={pStyle}>
        Thanks for joining the waiting list for {siteConfig.brandName}, the way to
        keep every golf course you&rsquo;ve played in Great Britain and see how
        your collection stands against your friends.
      </Text>

      <Section
        style={{
          margin: "20px 0 4px",
          padding: "12px 16px",
          borderLeft: `3px solid ${brand.accent}`,
          backgroundColor: brand.card,
          borderRadius: 6,
        }}
      >
        <Text style={{ margin: 0, fontSize: 14, lineHeight: "21px", color: brand.ink2 }}>
          {betaLinkStillToCome() ? (
            <>
              You made the list in time. The public beta link goes out on 2
              October, one send to everyone on the list that day, and it comes
              straight to this address. There is no second send, so keep an eye
              out. Version 1.0 follows in January 2027, publicly available and
              free.
            </>
          ) : (
            <>
              A heads-up: the public beta link has already gone out. It was a
              single send, on 2 October, and there won&rsquo;t be another, so
              this is the list for what comes next. Version 1.0 lands in January
              2027, publicly available and free, and you&rsquo;ll hear it here
              first.
            </>
          )}
        </Text>
      </Section>

      <Text style={pStyle}>We&rsquo;re building it now. Here&rsquo;s the shape of things:</Text>

      <Section style={{ margin: "6px 0 2px" }}>
        {siteConfig.roadmap.milestones
          .filter((m) => betaLinkStillToCome() || !m.oneSend)
          .map((m, i) => (
            <Text key={i} style={{ margin: "8px 0 0", fontSize: 14, lineHeight: "20px", color: brand.ink2 }}>
              {m.status === "now" ? "Now" : "Targeting"}{" "}
              <span style={{ color: brand.accent, fontWeight: 700 }}>
                {m.month} {m.year}
              </span>
              {"  ·  "}
              <span style={{ color: brand.ink }}>{m.label}.</span> {m.body}
            </Text>
          ))}
      </Section>

      <Text style={pStyle}>
        We&rsquo;ll keep you posted as we build it: the odd note for now, picking up
        as launch nears, and first word the moment it&rsquo;s ready to play. No
        noise in between, promise.
      </Text>

      <Text style={{ ...pStyle, color: brand.ink, marginTop: 22 }}>
        — Jack &amp; Tom
      </Text>
    </EmailShell>
  );
}
