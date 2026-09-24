import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Beta Testing Agreement — the terms a private-beta tester accepts by ticking
 * the acknowledgement box in the app's beta gate. Rendered from
 * `legal/beta-testing-agreement.md`; the two must be kept in step. Linked from
 * the app's beta acknowledgement page (alongside the Terms of Service and
 * Apple's TestFlight Terms of Use).
 */

export const metadata: Metadata = {
  title: "Beta Testing Agreement",
  description: `The terms that govern participation in the ${siteConfig.brandName} private beta.`,
};

const UPDATED = "29 August 2026";
const CONTACT = siteConfig.supportEmail;

const link: React.CSSProperties = {
  color: "#5BE4C3",
  textDecoration: "underline",
  textUnderlineOffset: 2,
};

const para: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.72,
  color: "#A8B3C0",
  margin: "12px 0 0",
};

const list: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.72,
  color: "#A8B3C0",
  margin: "12px 0 0",
  paddingLeft: 22,
};

const strong: React.CSSProperties = { color: "#DDE4EA", fontWeight: 600 };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 38 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: "-0.3px",
          color: "#F6F4EE",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function BetaTermsPage() {
  const { brandName } = siteConfig;
  const studio = siteConfig.footer.studio.name;
  const mailto = `mailto:${CONTACT}`;

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#06090E",
        color: "#F6F4EE",
        fontFamily: "var(--font-ui)",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "clamp(56px, 9vw, 110px) 24px 96px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            marginBottom: 44,
            fontSize: 13,
            color: "#9BA7B5",
            textDecoration: "none",
          }}
        >
          <span aria-hidden="true">←</span>
          <Image
            src="/brand/vestige-globe.png"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            style={{ display: "block", width: 18, height: 18 }}
          />
          {brandName}
        </Link>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 7vw, 72px)",
            fontWeight: 500,
            letterSpacing: "-2px",
            lineHeight: 1,
            margin: 0,
          }}
        >
          Beta Testing Agreement
        </h1>
        <p style={{ color: "#5F6B7A", fontSize: 13, margin: "14px 0 40px" }}>
          The {brandName} private beta · Last updated {UPDATED}
        </p>

        <p style={{ fontSize: 17, lineHeight: 1.72, color: "rgba(246,244,238,0.85)", margin: 0 }}>
          This Beta Testing Agreement (the &ldquo;Agreement&rdquo;) is a legal agreement between
          you and <span style={strong}>{studio}</span>, a company registered in England and
          Wales (company number 17212889) with its registered office at 82A James Carter Road,
          Mildenhall, Bury St. Edmunds, IP28 7DE, United Kingdom
          (&ldquo;{brandName}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), governing your
          participation in the {brandName} private beta programme (the &ldquo;Beta&rdquo;). It
          supplements our{" "}
          <Link href="/terms" style={link}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" style={link}>
            Privacy Policy
          </Link>
          , and Apple&rsquo;s{" "}
          <a href="https://www.apple.com/legal/internet-services/itunes/testflight/" style={link}>
            TestFlight Terms of Use
          </a>
          . Where this Agreement and the Terms of Service conflict on a beta-specific matter, this
          Agreement governs during the Beta.
        </p>

        <p style={{ fontSize: 17, lineHeight: 1.72, color: "rgba(246,244,238,0.85)", margin: "16px 0 0" }}>
          <span style={strong}>You accept this Agreement by ticking the acknowledgement box in
          the app</span>{" "}
          (&ldquo;I understand this is a private beta build, and I won&rsquo;t share
          access.&rdquo;) or by otherwise using a beta build. If you do not agree, do not use the
          Beta.
        </p>

        <Section title="1. Your invitation">
          <p style={para}>
            Access to the Beta is by personal invitation only. Your invitation is{" "}
            <span style={strong}>personal to you, non-transferable, and revocable</span> by us at
            any time, for any reason, without notice. Nothing in this Agreement gives you any
            right to continued access, to the finished product, or to any feature you see during
            the Beta.
          </p>
        </Section>

        <Section title="2. Confidentiality">
          <p style={para}>
            The Beta is private. The following are our confidential information: the beta app and
            its builds; its features, designs, and content; its performance and reliability; our
            plans and roadmap; your invitation and any invite links; and anything else about the
            Beta that is not already public through us.
          </p>
          <p style={para}>
            You agree not to share, publish, or disclose any of it without our prior written
            consent. In particular, you agree not to:
          </p>
          <ul style={list}>
            <li>share the app, your invitation, or any invite link with anyone;</li>
            <li>
              post screenshots, screen recordings, or video of the beta app anywhere public,
              including social media, group chats, and forums;
            </li>
            <li>describe, review, or benchmark the Beta publicly.</li>
          </ul>
          <p style={para}>
            This section survives the end of your participation and continues until we release
            the relevant material publicly ourselves.
          </p>
        </Section>

        <Section title="3. Beta software">
          <p style={para}>
            The Beta is pre-release software, provided{" "}
            <span style={strong}>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without any
            warranty of any kind</span>
            . Everything in it is subject to change. Features may move, change, break, or
            disappear between builds. Your data may be reset, migrated, or deleted during the
            Beta, including without notice ahead of launch. Do not rely on the Beta as your only
            record of anything.
          </p>
        </Section>

        <Section title="4. Feedback">
          <p style={para}>
            We may ask for, and you may volunteer, feedback about the Beta. You grant us a
            perpetual, irrevocable, royalty-free right to use any feedback you provide for any
            purpose, without obligation or compensation. Do not include in feedback anything you
            are not entitled to share.
          </p>
        </Section>

        <Section title="5. Acceptable use">
          <p style={para}>
            While participating in the Beta you agree to comply with our{" "}
            <Link href="/terms" style={link}>
              Terms of Service
            </Link>
            , and additionally not to reverse engineer, decompile, or extract the source of any
            beta build except where the law expressly permits it despite this term.
          </p>
        </Section>

        <Section title="6. If you break this Agreement">
          <p style={para}>
            If you breach this Agreement — in particular section 2 (Confidentiality) — we may
            suspend or permanently revoke your access to the Beta and the Service, and remove
            your account, immediately and without notice.{" "}
            <span style={strong}>
              You are personally liable to us for loss or damage we suffer as a result of your
              breach
            </span>
            , and because unauthorised disclosure may cause harm that damages alone cannot
            repair, you agree that we are entitled to seek injunctive or other equitable relief
            to prevent or stop a breach, in addition to any other remedy available to us in law.
          </p>
        </Section>

        <Section title="7. Ending participation">
          <p style={para}>
            You may leave the Beta at any time by deleting the app and your account. We may end
            the Beta, or your participation in it, at any time. Sections 2 (Confidentiality), 4
            (Feedback), and 6 (If you break this Agreement) survive the end of your
            participation.
          </p>
        </Section>

        <Section title="8. General">
          <p style={para}>
            This Agreement is governed by the law of England and Wales, and the courts of England
            and Wales have exclusive jurisdiction over any dispute arising from it. If any part
            of this Agreement is found unenforceable, the rest remains in force. We may update
            this Agreement during the Beta; if we do, the app will surface the change and
            continued participation constitutes acceptance.
          </p>
          <p style={para}>
            <span style={strong}>Contact:</span>{" "}
            <a href={mailto} style={link}>
              {CONTACT}
            </a>
          </p>
        </Section>
      </div>
    </main>
  );
}
