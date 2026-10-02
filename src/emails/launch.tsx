import * as React from "react";
import { Button, Heading, Section, Text } from "@react-email/components";
import {
  EmailShell,
  Eyebrow,
  accentGradient,
  brand,
  h1Style,
  pStyle,
} from "../lib/emailShell";
import { siteConfig } from "../lib/siteConfig";
import { COURSES_EXACT_TEXT } from "../lib/progressConfig";

/**
 * Launch announcement — sent as a Resend Broadcast to the "Vestige launch
 * waitlist" segment on launch day. Publish/refresh it from this template with:
 *   resend broadcasts create --segment-id <id> --from "Vestige <hello@vestige.golf>" \
 *     --subject "..." --react-email src/emails/launch.tsx --reply-to hello@pinehollow.studio
 *
 * The unsubscribe link uses Resend's broadcast variable {{{RESEND_UNSUBSCRIBE_URL}}},
 * which only resolves when sent as a broadcast (it shows literally in preview).
 */
export default function LaunchEmail() {
  const appUrl = siteConfig.appStoreUrl ?? `https://${siteConfig.domain}`;
  return (
    <EmailShell
      preview={`${siteConfig.brandName} is live on the App Store. ${siteConfig.tagline}`}
      footer={
        <>
          You&rsquo;re getting this because you signed up for{" "}
          {siteConfig.brandName} at {siteConfig.domain}.{" "}
          <a
            href="{{{RESEND_UNSUBSCRIBE_URL}}}"
            style={{ color: brand.ink2, textDecoration: "underline" }}
          >
            Unsubscribe
          </a>
          .
        </>
      }
    >
      <Eyebrow>It&rsquo;s here</Eyebrow>
      <Heading style={h1Style}>{siteConfig.brandName} is live.</Heading>

      <Text style={pStyle}>
        The wait is over. {siteConfig.brandName} is on the App Store today: the map
        of Great Britain, all {COURSES_EXACT_TEXT} courses of it so far, ready for
        you to start your collection. Free.
      </Text>

      <Section style={{ margin: "26px 0 6px" }}>
        <Button
          href={appUrl}
          style={{
            ...accentGradient,
            color: brand.onAccent,
            fontSize: 15,
            fontWeight: 700,
            padding: "13px 24px",
            borderRadius: 999,
            textDecoration: "none",
            fontFamily: brand.sans,
          }}
        >
          Download on the App Store
        </Button>
      </Section>

      <Text style={pStyle}>
        Mark the courses you&rsquo;ve played, keep a round if you like, and see how
        your collection stands, among your friends and across the country. No ads,
        no noise.
      </Text>

      <Text style={{ ...pStyle, color: brand.ink, marginTop: 22 }}>
        See you on the first tee,
        <br />
        Jack &amp; Tom
      </Text>
    </EmailShell>
  );
}
