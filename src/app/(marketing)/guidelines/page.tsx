import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Community Guidelines — the plain-English companion to the Terms of
 * Service §5–§6 (those are the binding rules; this is the human-readable
 * version the app's report and block flows can point at). Rendered from
 * `legal/community-guidelines.md`; the two must be kept in step.
 */

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: `How to be on ${siteConfig.brandName} — what belongs, what doesn't, and how reporting and blocking work.`,
};

const UPDATED = "8 September 2026";
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

export default function GuidelinesPage() {
  const { brandName } = siteConfig;
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
          Community Guidelines
        </h1>
        <p style={{ color: "#5F6B7A", fontSize: 13, margin: "14px 0 40px" }}>
          The {brandName} app · Last updated {UPDATED}
        </p>

        <p style={{ fontSize: 17, lineHeight: 1.72, color: "rgba(246,244,238,0.85)", margin: 0 }}>
          {brandName} is a place to keep a record of the golf courses you have played and share
          it with people you choose. The social side is deliberately small: friends, rounds,
          comments, lists. These guidelines exist so it stays a good place to be. They apply to
          everything you put on {brandName} that someone else can see — your profile, photos,
          round captions and reflections, comments, messages, and lists.
        </p>

        <p style={{ fontSize: 17, lineHeight: 1.72, color: "rgba(246,244,238,0.85)", margin: "16px 0 0" }}>
          They sit alongside our{" "}
          <Link href="/terms" style={link}>
            Terms of Service
          </Link>
          , which are the binding rules; if you breach these guidelines, you are breaching those
          terms.
        </p>

        <Section title="Be decent">
          <p style={para}>
            Talk to people on {brandName} the way you would in the clubhouse. No harassment, no
            bullying, no hate directed at anyone — on {brandName} or off it. Disagreeing about a
            course is fine; going after the person is not.
          </p>
        </Section>

        <Section title="Be yourself">
          <p style={para}>
            Use your own name or a handle that is honestly yours. Do not impersonate another
            person, a club, or {brandName} itself. One person, one account.
          </p>
        </Section>

        <Section title="Keep your record honest">
          <p style={para}>
            Your collection is yours, and we trust it — mark the courses you have genuinely
            played. Do not invent rounds to climb the leaderboards. We run quiet automated checks
            for impossible logging patterns, and accounts that game the boards can be hidden from
            them, restricted, or suspended.
          </p>
        </Section>

        <Section title="Photos and words">
          <p style={para}>Share photos you took, of the golf you played. Do not upload:</p>
          <ul style={list}>
            <li>anything sexual, violent, or shocking;</li>
            <li>other people&rsquo;s work passed off as your own;</li>
            <li>photos of people who would not want to be posted;</li>
            <li>anything unlawful, or anything promoting it.</li>
          </ul>
          <p style={para}>
            The same standard applies to your bio, captions, comments, and list notes. Spam,
            scams, and advertising do not belong anywhere on {brandName}.
          </p>
          <p style={para}>
            Some of this is checked automatically. A short list of words is blocked outright, so a
            post or a name using one is refused as you write it — you will be told, and you can
            reword it. Photos are scanned after they are uploaded, and one that looks wrong can be
            hidden while a person looks at it. The automated part never decides anything about
            your account; it only ever asks a human to check.
          </p>
        </Section>

        <Section title="Reporting and blocking">
          <p style={para}>
            If someone or something breaks these guidelines, tell us from inside the app — posts,
            comments, lists, and profiles can all be reported, and Settings → Send feedback
            reaches us directly. You can also block any user from their profile; blocking removes
            the friendship both ways and hides you from each other.
          </p>
          <p style={para}>
            We review reports and act on them: removing content, warning the person, or
            restricting or suspending the account.{" "}
            <span style={strong}>
              We have no tolerance for objectionable content or abusive behaviour.
            </span>{" "}
            If your own content is removed or refused and you think we got it wrong — including
            by the automated checks above — reply through the feedback thread and a person will
            look at it. Your bug reports and messages to us are never screened, so telling us what
            someone said to you always works.
          </p>
        </Section>

        <Section title="The final call">
          <p style={para}>
            {brandName} is edited. What counts as a course, how courses are tiered, and what
            stays on the platform are our decisions, made so the place stays worth being in.
          </p>
        </Section>

        <p
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.10)",
            fontSize: 14,
            color: "#9BA7B5",
          }}
        >
          Questions?{" "}
          <a href={mailto} style={link}>
            {CONTACT}
          </a>
        </p>
      </div>
    </main>
  );
}
