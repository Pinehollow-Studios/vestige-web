import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Privacy policy — the full policy for the Vestige app (and, in its final
 * section, this website's waiting list). Rendered from
 * `legal/privacy-policy.md` (the canonical markdown source in this repo);
 * the two must be kept in step. Linked from the app (VestigePrivacyURL),
 * the Pro paywall, and App Store Connect.
 */

export const metadata: Metadata = {
  title: "Privacy",
  description: `What ${siteConfig.brandName} collects, why, and the rights you hold over it — covering the app and this website.`,
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

export default function PrivacyPage() {
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
          Privacy
        </h1>
        <p style={{ color: "#5F6B7A", fontSize: 13, margin: "14px 0 40px" }}>
          The {brandName} app &amp; this website · Last updated {UPDATED}
        </p>

        <p style={{ fontSize: 17, lineHeight: 1.72, color: "rgba(246,244,238,0.85)", margin: 0 }}>
          {brandName} (&ldquo;{brandName}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a
          golf-course collection tracker for Great Britain, built by {studio}. This policy explains
          what
          personal data we collect, why, and your rights over it. It covers the {brandName} iOS
          app and, in its final section, this website.
        </p>

        <Section title="The short version">
          <ul style={list}>
            <li>We collect only what the app needs to work, plus opt-out-able diagnostics.</li>
            <li>
              <span style={strong}>We never show ads and never sell your individual data.</span>{" "}
              Both are permanent commitments.
            </li>
            <li>
              We use your golf activity to build aggregated, anonymised insights that may be sold
              to golf clubs — never anything that identifies you. You can opt out of contributing
              entirely.
            </li>
            <li>
              You can export everything we hold about you, and delete your account (and all of its
              data) from inside the app at any time.
            </li>
          </ul>
        </Section>

        <Section title="Who we are">
          <p style={para}>
            The data controller is <span style={strong}>{studio}</span>, a company registered in
            England and Wales (company number 17212889) with its registered office at 82A James
            Carter Road, Mildenhall, Bury St. Edmunds, IP28 7DE, United Kingdom. For any privacy
            question or request, contact{" "}
            <a href={mailto} style={link}>
              {CONTACT}
            </a>
            .
          </p>
        </Section>

        <Section title="What we collect">
          <p style={para}>
            <span style={strong}>Account &amp; profile.</span> Your email address, username,
            display name, and optionally your first name, home club, home county, a short bio, and
            an avatar/cover photo. If you sign in with Apple or Google, we receive the identifier
            those services return to us; if you use Apple&rsquo;s Hide My Email, we receive
            Apple&rsquo;s private relay address instead of your real one.
          </p>
          <p style={para}>
            <span style={strong}>Your golf activity.</span> The courses you mark as played, rounds
            you log (date, optional score, optional notes/reflections), the lists you create, and
            your friend connections.
          </p>
          <p style={para}>
            <span style={strong}>About you (optional).</span> During onboarding we ask three
            optional questions: your age band, your handicap band, and how you mostly play. You
            can skip them entirely. We use these answers only in aggregate — to understand{" "}
            {brandName}&rsquo;s audience and in the club insights described below — never to
            profile you individually, and they are never shown on your profile.
          </p>
          <p style={para}>
            <span style={strong}>Photos you upload.</span> Round photos, course photos, and
            profile images. When you add a photo we extract its embedded metadata (capture time
            and, if present, GPS location) and keep those details alongside the photo to associate
            it with a round or course; the image copies we store are re-encoded, which strips the
            embedded metadata from the stored files. Photos are also checked automatically for
            unsafe content shortly after upload — the copy sent for that check is the re-encoded
            one, so it carries no embedded metadata, and it is sent without your name or handle
            attached.
          </p>
          <p style={para}>
            <span style={strong}>Messages.</span> Messages you send in the app &mdash; today, to the{" "}
            {brandName} team, including replies to your feedback &mdash; are stored so the
            conversation can be read back by you and by us. They are private to the people in the
            conversation and are never shown on your profile or to other users. You can unsend a
            message; it is then withheld from everyone, and the conversation itself is deleted
            with your account.
          </p>
          <p style={para}>
            <span style={strong}>Location.</span> Only when you use a feature that needs it:
            sorting the course suggestions on your home screen by distance, and showing your
            position on the map when you ask for it. We take a single reading while the app is
            open and use it on your device — the reading itself is never uploaded to our servers
            or stored, and we never track your location in the background. (Location embedded in
            photos you upload is covered above.)
          </p>
          <p style={para}>
            <span style={strong}>Notifications.</span> If you enable push notifications, we store
            your device&rsquo;s push token so Apple can deliver them. You can turn categories of
            notification off in Settings, or revoke the permission entirely in iOS Settings.
          </p>
          <p style={para}>
            <span style={strong}>Diagnostics.</span> Crash reports and basic
            performance/diagnostic data (via Sentry, hosted in the EU, and Apple&rsquo;s
            MetricKit), to find and fix problems. This is associated with your account unless you
            turn analytics off.
          </p>
          <p style={para}>
            <span style={strong}>Usage analytics.</span> Anonymous-by-default records of in-app
            events (e.g. screens viewed) to understand how the app is used. These respect your
            analytics opt-out.
          </p>
          <p style={para}>
            <span style={strong}>What we do not collect:</span> we do not read your
            contacts/address book, we do not use third-party advertising or tracking SDKs, and we
            do not track you across other apps or websites.
          </p>
        </Section>

        <Section title="How we use your data">
          <ul style={list}>
            <li>To run the app: your collection, map, stats, lists, friends, and leaderboards.</li>
            <li>To keep it working: diagnosing crashes and improving performance.</li>
            <li>To improve it: understanding which features are used (analytics).</li>
            <li>
              To keep {brandName} a decent place to be. Text you post — your bio, list names and
              descriptions, round notes and captions, comments, and the names you type for playing
              partners — is screened against our own word list as you post it, and may be refused.
              That same text, and the photos you upload, are also checked by Microsoft&rsquo;s
              Azure AI Content Safety service (EU region) as a second opinion: it can flag
              something for a person to look at, and can hide a photo pending that review, but it
              never decides anything about your account. Messages you send are never refused by
              the word list; they are only checked by that second-opinion service, so that a
              person can look if something is reported or flagged. Private notes you keep to
              yourself, and the bug reports you send us, are deliberately not screened at all.
            </li>
            <li>
              To produce{" "}
              <span style={strong}>aggregated, anonymised insights for golf clubs</span> — for
              example, how many {brandName} users played a club, or added it to one of their
              lists, over a period. These insights are always aggregated across many users, never
              individual-level, never personally identifiable, and exclude anyone who has opted
              out of analytics. A club will never see that a named person visited.
            </li>
          </ul>
        </Section>

        <Section title="Who we share it with">
          <p style={para}>
            We use a small number of service providers (&ldquo;processors&rdquo;) to run{" "}
            {brandName}:
          </p>
          <ul style={list}>
            <li>
              <span style={strong}>Supabase</span> — database, authentication, and file storage
              (EU region).
            </li>
            <li>
              <span style={strong}>Sentry</span> — crash reporting (EU region).
            </li>
            <li>
              <span style={strong}>Apple</span> — Sign in with Apple, and push notification
              delivery.
            </li>
            <li>
              <span style={strong}>Google</span> — Sign in with Google, where you use it.
            </li>
            <li>
              <span style={strong}>Mapbox</span> — map rendering.
            </li>
            <li>
              <span style={strong}>Microsoft</span> — automated content-safety checks on photos
              and text (Azure AI Content Safety, EU region).
            </li>
          </ul>
          <p style={para}>
            We do not sell your personal data. The only data that leaves {brandName} in a form
            that could be sold is the aggregated, anonymised club insights described above.
          </p>
        </Section>

        <Section title="Where your data is held">
          <p style={para}>
            {brandName} is a United Kingdom product: the app is distributed on the{" "}
            <span style={strong}>UK App Store only</span>, and it is intended for use in the
            United Kingdom.
          </p>
          <p style={para}>
            Your data is stored in the European Economic Area (Supabase and Sentry both run in EU
            regions, and the content-safety checks run in Microsoft&rsquo;s Sweden Central
            region). Transfers from the UK to the EEA are covered by the UK&rsquo;s adequacy
            regulations. Where a processor operates outside the UK and the EEA (for example
            Apple&rsquo;s push delivery and Mapbox&rsquo;s map rendering, which are United States
            companies), the transfer is made under the UK International Data Transfer Addendum to
            the EU Standard Contractual Clauses, or another safeguard permitted by UK GDPR.
          </p>
        </Section>

        <Section title="Legal basis (UK GDPR)">
          <p style={para}>
            We process your data to perform our contract with you (providing the app); on the
            basis of your consent for the features you switch on (location and push
            notifications — both asked for in context, both refusable); and for our legitimate
            interests in keeping the app secure, keeping its content safe, understanding how it
            is used, and improving it — always subject to the analytics opt-out described above.
            Where we rely on legitimate interests we have balanced them against your rights, and
            you can object at any time.
          </p>
          <p style={para}>
            The content checks described above are automated, but they do not decide anything
            about you on their own: at most they refuse a piece of text or hide a photo so a
            person can look at it. Every decision about an account — a warning, a restriction, a
            suspension — is made by a person, and you can reply to us through the feedback thread
            in the app.
          </p>
        </Section>

        <Section title="Your rights">
          <p style={para}>You can, at any time:</p>
          <ul style={list}>
            <li>
              <span style={strong}>Access &amp; export</span> your data — Settings → Privacy &amp;
              data → Export my data.
            </li>
            <li>
              <span style={strong}>Delete your account</span> — Settings → Account → Delete
              account. This permanently removes your account and all associated data, including
              your uploaded photos.
            </li>
            <li>
              <span style={strong}>Opt out of analytics</span> — Settings → Privacy &amp; data.
              Opting out also excludes you from all aggregated club insights.
            </li>
            <li>
              <span style={strong}>Control your visibility</span> — set your profile to Private or
              Public at any time, and choose whether you appear on the global and local
              leaderboards (Settings → Privacy &amp; data).
            </li>
          </ul>
          <p style={para}>
            Under UK GDPR you also have rights to rectification, restriction, objection, and to
            complain to the Information Commissioner&rsquo;s Office (ICO) at{" "}
            <a href="https://ico.org.uk" style={link}>
              ico.org.uk
            </a>
            .
          </p>
        </Section>

        <Section title="Data retention">
          <p style={para}>
            We keep your data while your account is active. When you delete your account, your
            data (including stored photos) is removed. Aggregated insights that no longer identify
            any individual may be retained.
          </p>
          <p style={para}>
            The content-safety checks described above do not create a second copy of anything:
            Microsoft does not store the photos or text we send for analysis, does not use them to
            train its models, and processes them only in the region we chose. What we keep is the
            result — a score, and whether a person needs to look at it — alongside the content you
            posted, on our own servers.
          </p>
        </Section>

        <Section title="Children">
          <p style={para}>
            {brandName} is intended for users aged 17 and over and is not directed at children.
          </p>
        </Section>

        <Section title="This website">
          <p style={para}>
            This website asks for one piece of personal information: the email address you give
            the waiting list, held to contact you about {brandName} and deleted once it has done
            its job or on request. It is stored and delivered through Resend, our email provider,
            and the site is hosted by Vercel — both acting only on our instructions. We also use
            Vercel&rsquo;s privacy-first analytics to count visits; it sets no cookies and does
            not identify you.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p style={para}>
            We may update this policy; we will change the &ldquo;Last updated&rdquo; date above
            and, for material changes, notify you in-app.
          </p>
        </Section>

        <Section title="Contact">
          <p style={para}>
            <a href={mailto} style={link}>
              {CONTACT}
            </a>{" "}
            · {studio}
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
          Questions about your privacy?{" "}
          <a href={mailto} style={link}>
            {CONTACT}
          </a>
        </p>
      </div>
    </main>
  );
}
