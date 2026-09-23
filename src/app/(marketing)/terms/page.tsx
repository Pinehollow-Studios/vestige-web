import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Terms of Service — the end-user terms for the Vestige app (including the
 * Vestige Pro membership). Rendered from `legal/terms-of-service.md`; the two
 * must be kept in step. Linked from the app's paywall + About screen via the
 * `VestigeTermsURL` Info.plist key, and from App Store Connect.
 */

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern your use of the ${siteConfig.brandName} app, including the ${siteConfig.brandName} Pro membership.`,
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

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ color: "#5F6B7A", fontSize: 13, margin: "14px 0 40px" }}>
          The {brandName} app · Last updated {UPDATED}
        </p>

        <p style={{ fontSize: 17, lineHeight: 1.72, color: "rgba(246,244,238,0.85)", margin: 0 }}>
          These Terms of Service (&ldquo;Terms&rdquo;) are a legal agreement between you and{" "}
          <span style={strong}>{studio}</span>, a company registered in England and Wales
          (company number 17212889) with its registered office at 82A James Carter Road,
          Mildenhall, Bury St. Edmunds, IP28 7DE, United Kingdom
          (&ldquo;{brandName}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), governing your use of
          the {brandName} iPhone app and related services (the &ldquo;Service&rdquo;). By creating
          an account or using the Service, you agree to these Terms. If you do not agree, do not
          use the Service.
        </p>

        <Section title="1. Eligibility">
          <p style={para}>
            You must be at least <span style={strong}>17</span> years old to use {brandName}. By
            using the Service you confirm that you are.
          </p>
        </Section>

        <Section title="2. The Service">
          <p style={para}>
            {brandName} is a map-based tracker for the golf courses you have played in Great
            Britain.
            The core experience — logging rounds, completing counties, and comparing with friends
            — is, and will remain, <span style={strong}>free</span>. We do not show advertising.
          </p>
          <p style={para}>
            The Service covers England, Scotland and Wales. England is fully mapped; Scotland
            and Wales are being added, and until their courses are in they are shown as
            &ldquo;coming soon&rdquo;. We may add, change, or remove features over time.
          </p>
          <p style={para}>
            The app is distributed on the{" "}
            <span style={strong}>United Kingdom App Store only</span>, and is intended for use in
            the United Kingdom. We make no representation that the Service is appropriate or
            available in any other territory, and we may add or remove territories at any time.
            Using the Service from outside the United Kingdom is at your own initiative and you
            are responsible for compliance with local law.
          </p>
        </Section>

        <Section title={`3. ${siteConfig.brandName} Pro (optional paid membership)`}>
          <p style={para}>
            {brandName} Pro is an optional paid membership that adds extra features on top of the
            free Service. The free core described in section 2 stays free whether or not you
            subscribe — Pro only ever adds to it.
          </p>
          <p style={para}>
            <span style={strong}>Plans and billing.</span> Pro is offered as an auto-renewing
            subscription (monthly or annual) and as a one-time lifetime purchase. All payment is
            handled by Apple through your App Store account; we never see or store your payment
            details. The price is always shown in the app before you buy and may vary by region.
          </p>
          <p style={para}>
            <span style={strong}>Auto-renewal and cancellation.</span> Subscriptions renew
            automatically unless cancelled at least 24 hours before the end of the current period,
            and your App Store account is charged for renewal within 24 hours before the period
            ends. You can manage or cancel at any time in your App Store account settings
            (Settings → your name → Subscriptions on your device). Cancelling stops future
            renewals; you keep Pro until the end of the period you have already paid for. Deleting
            the app does not cancel a subscription.
          </p>
          <p style={para}>
            <span style={strong}>Free trials and introductory offers.</span> Where a free trial or
            introductory offer applies, it converts to a paid subscription unless cancelled at
            least 24 hours before the trial ends. Any unused portion of a free trial is forfeited
            when you purchase a subscription.
          </p>
          <p style={para}>
            <span style={strong}>Lifetime and founding-member pricing.</span> The lifetime option
            is a one-time purchase that grants Pro for as long as we operate the Service. We may
            offer reduced pricing or free periods to particular groups (for example, founding
            members who joined during the beta); eligibility for such offers is determined by us.
          </p>
          <p style={para}>
            <span style={strong}>Refunds.</span> Because purchases are made through Apple, refunds
            are handled by Apple under Apple&rsquo;s terms, not by us. You can request a refund
            from Apple at{" "}
            <a href="https://reportaproblem.apple.com" style={link}>
              reportaproblem.apple.com
            </a>
            .
          </p>
          <p style={para}>
            <span style={strong}>If Pro ends.</span> If your subscription lapses or is refunded,
            you lose access to Pro features but never to the free core of the Service or to any of
            your data.
          </p>
          <p style={para}>
            <span style={strong}>Changes to Pro.</span> We may change Pro&rsquo;s price or what it
            includes over time. Price changes to an existing subscription follow Apple&rsquo;s
            notice and consent rules; material reductions to what Pro includes are treated as
            material changes under section 13.
          </p>
        </Section>

        <Section title="4. Your account">
          <p style={para}>
            You are responsible for the accuracy of your account information and for keeping your
            login credentials secure. You are responsible for activity that happens under your
            account. Tell us promptly at{" "}
            <a href={mailto} style={link}>
              {CONTACT}
            </a>{" "}
            if you believe your account has been compromised.
          </p>
        </Section>

        <Section title="5. Acceptable use">
          <p style={para}>You agree not to:</p>
          <ul style={list}>
            <li>break the law, or infringe anyone else&rsquo;s rights, using the Service;</li>
            <li>
              upload content that is unlawful, abusive, harassing, hateful, obscene, or that you
              do not have the right to share;
            </li>
            <li>impersonate others or misrepresent your identity;</li>
            <li>
              attempt to game leaderboards or other features through false records (see section
              8);
            </li>
            <li>
              scrape, harvest, or bulk-extract data from the Service, or use it to build a
              competing dataset;
            </li>
            <li>
              interfere with, probe, or attempt to gain unauthorised access to the Service or its
              infrastructure.
            </li>
          </ul>
        </Section>

        <Section title="6. Your content">
          <p style={para}>
            You keep ownership of the photos, notes, lists, and other content you create
            (&ldquo;Your Content&rdquo;). By submitting Your Content, you grant us a worldwide,
            royalty-free licence to host, store, reproduce, and display it solely to operate and
            provide the Service to you and the people you choose to share it with. This licence
            ends when you delete the content or your account, except for copies retained as
            required by law or already irreversibly anonymised.
          </p>
          <p style={para}>
            You are responsible for Your Content. We have no tolerance for objectionable content
            or abusive behaviour. We may remove content that breaches these Terms, our{" "}
            <Link href="/guidelines" style={link}>
              Community Guidelines
            </Link>
            , or the law, and we operate moderation and reporting tools, including the ability to
            block other users and report problems from within the app.
          </p>
          <p style={para}>
            Some of that moderation is automated. Text you submit is screened as you post it and
            may be refused, and photos you upload are checked for unsafe content after upload and
            may be hidden while a person reviews them. Our{" "}
            <Link href="/privacy" style={link}>
              Privacy Policy
            </Link>{" "}
            explains what this involves and who performs it. Automated checks never decide
            anything about your account on their own — a person makes those decisions — and if
            you think we have got one wrong, reply through the feedback thread in the app and we
            will look at it.
          </p>
        </Section>

        <Section title="7. Privacy">
          <p style={para}>
            Our{" "}
            <Link href="/privacy" style={link}>
              Privacy Policy
            </Link>{" "}
            explains how we handle your personal data, including the aggregated, anonymised
            insights we provide to golf clubs and your right to opt out. By using the Service you
            acknowledge that policy.
          </p>
        </Section>

        <Section title="8. Integrity and fair play">
          <p style={para}>
            We trust the rounds you log. To keep public leaderboards fair, we use automated,
            behind-the-scenes checks for unrealistic logging patterns. Where appropriate, we may
            hide an account from public leaderboards, contact the user, or restrict or suspend an
            account. We will act proportionately and, where we can, transparently with the
            affected user.
          </p>
        </Section>

        <Section title="9. Editorial decisions">
          <p style={para}>
            Course tiers, curated lists, and what counts as a &ldquo;course&rdquo; or a
            &ldquo;played&rdquo; course are editorial decisions made by {brandName}. They are not
            user-configurable, and we make the final call.
          </p>
        </Section>

        <Section title="10. Intellectual property">
          <p style={para}>
            The Service, the {brandName} and {brandName} Golf names and branding, the app
            software, and the underlying course and county dataset are owned by us or our
            licensors and are protected by intellectual-property laws. These Terms grant you a
            limited, personal, non-transferable, revocable licence to use the Service for its
            intended purpose. You may not copy, modify, distribute, or create derivative works
            from the Service except as the law expressly permits.
          </p>
        </Section>

        <Section title="11. Third-party services">
          <p style={para}>
            The Service relies on third parties including Apple, Google, Supabase, Mapbox, and
            Sentry. Your use of features provided through them may also be subject to their terms.
            We are not responsible for third-party services.
          </p>
        </Section>

        <Section title="12. App Store terms">
          <p style={para}>
            You obtain {brandName} through the Apple App Store, and your use is also subject to
            Apple&rsquo;s terms. Apple&rsquo;s standard{" "}
            <a
              href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
              style={link}
            >
              Licensed Application End User Licence Agreement
            </a>{" "}
            applies to the extent it is not inconsistent with these Terms. You acknowledge that
            Apple is not responsible for the Service or for support, and is a third-party
            beneficiary of these Terms entitled to enforce them.
          </p>
        </Section>

        <Section title="13. Availability and changes">
          <p style={para}>
            We work to keep the Service available, but we provide it &ldquo;as is&rdquo; and do
            not guarantee it will be uninterrupted or error-free. We may modify, suspend, or
            discontinue parts of the Service, and we may update these Terms. If we make a material
            change to these Terms, we will give you notice in the app or by email before it takes
            effect; continuing to use the Service after that means you accept the change.
          </p>
        </Section>

        <Section title="14. Disclaimers and liability">
          <p style={para}>
            To the fullest extent permitted by law, the Service is provided without warranties of
            any kind. Nothing in these Terms limits liability that cannot be limited by law
            (including for death or personal injury caused by negligence, or for fraud). Subject
            to that, we are not liable for indirect or consequential loss, and our total liability
            arising out of or relating to the Service is limited to the greater of £100 and the
            amounts you paid us in the 12 months before the event giving rise to the claim.
          </p>
          <p style={para}>
            Nothing in these Terms affects your statutory rights as a consumer under the laws of
            England and Wales.
          </p>
        </Section>

        <Section title="15. Termination">
          <p style={para}>
            You may stop using the Service and delete your account at any time (Settings → Account
            → Delete account). We may suspend or terminate your access if you breach these Terms
            or to protect the Service or other users. On termination, your right to use the
            Service ends; sections that by their nature should survive (ownership, disclaimers,
            liability, governing law) will survive.
          </p>
        </Section>

        <Section title="16. Governing law and disputes">
          <p style={para}>
            These Terms are governed by the laws of England and Wales, and the courts of England
            and Wales have exclusive jurisdiction, subject to any mandatory consumer protections
            in your country of residence.
          </p>
        </Section>

        <Section title="17. General">
          <p style={para}>
            These Terms, together with the Privacy Policy and any beta or supplemental terms we
            present to you in the app, are the entire agreement between you and us about the
            Service. If any part of these Terms is found unenforceable, the rest remains in
            force. If we do not enforce a term straight away, we have not waived it. You may not
            transfer your rights under these Terms to anyone else; we may transfer ours to a
            successor of the business, with your protections intact.
          </p>
        </Section>

        <Section title="18. Contact">
          <p style={para}>
            {studio} (company number 17212889) · 82A James Carter Road, Mildenhall, Bury St.
            Edmunds, IP28 7DE, United Kingdom ·{" "}
            <a href={mailto} style={link}>
              {CONTACT}
            </a>
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
          Questions about these terms?{" "}
          <a href={mailto} style={link}>
            {CONTACT}
          </a>
        </p>
      </div>
    </main>
  );
}
