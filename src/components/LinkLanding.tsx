import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The web fallback shared by every Vestige universal link
 * (`/u/<handle>`, `/course/<id>`, `/list/<id>`, `/pro`,
 * `/society/join/<token>`).
 *
 * When the app is installed, iOS opens it straight from the link and
 * none of these pages ever render. This is what the *other* recipient
 * sees - the friend who doesn't have Vestige yet. It has one job: say
 * what they were sent, and give them the way in.
 *
 * The marketing site has no database access by design, so a page can
 * only name its subject when the app puts the name in the link (the
 * `?n=` hint, courses only - list titles are user-authored and stay out
 * of URLs). Without a hint the copy stays true and generic rather than
 * guessing.
 */
export type LinkLandingProps = {
  /** Small uppercase line above the headline. */
  eyebrow: string;
  /** The headline - a course name, `@handle`, or a generic stand-in. */
  headline: string;
  /** One sentence under the headline. Ends the sentence itself. */
  blurb: string;
  /**
   * Replaces the default way in (the App Store once live, else the
   * waiting list) and the small line under it. Only /u/<handle> uses it,
   * to send people to the public TestFlight link once it has gone out.
   */
  cta?: { href: string; label: string; note: string };
};

export function LinkLanding({ eyebrow, headline, blurb, cta }: LinkLandingProps) {
  const launched = siteConfig.appStoreUrl !== null;
  const ctaHref = cta ? cta.href : launched ? (siteConfig.appStoreUrl as string) : "/";
  const ctaLabel = cta
    ? cta.label
    : launched
      ? `Get ${siteConfig.brandName}`
      : "Join the waiting list";

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--s-4)",
        background: "var(--gradient-ocean), var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--font-ui)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--s-3)",
        }}
      >
        {/* The app icon's globe. These pages are the first thing a friend
            without the app ever sees of Vestige, and the mark is what they
            will then be looking for on the App Store. */}
        <Image
          src="/brand/vestige-globe.png"
          alt=""
          aria-hidden="true"
          width={72}
          height={72}
          priority
          style={{ display: "block", width: 72, height: 72 }}
        />

        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--accent)",
            fontWeight: 600,
          }}
        >
          {eyebrow}
        </span>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.4rem, 9vw, 3.4rem)",
            lineHeight: 1.05,
            margin: 0,
            fontWeight: 500,
          }}
        >
          {headline}
        </h1>

        <p style={{ fontSize: 17, lineHeight: 1.5, color: "var(--ink-2)", margin: 0 }}>
          {blurb}
        </p>

        <a
          href={ctaHref}
          style={{
            marginTop: "var(--s-2)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 28px",
            borderRadius: "var(--r-pill)",
            background: "var(--gradient-accent)",
            color: "var(--on-accent)",
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          {ctaLabel}
        </a>

        {cta ? (
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
            {cta.note}
          </p>
        ) : (
          !launched && (
            <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
              {siteConfig.brandName} is launching soon. Open this link on your
              iPhone once the app is installed to go straight there.
            </p>
          )
        )}
      </div>
    </main>
  );
}

/**
 * Read the `?n=` display-name hint the app attaches to course links.
 * Never trusted for a lookup - it is rendered as text only, stripped of
 * control characters and capped, so a hand-edited link cannot turn the
 * page into someone else's billboard.
 */
export function cleanNameHint(raw: string | string[] | undefined): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 60);
  return cleaned.length > 0 ? cleaned : null;
}
