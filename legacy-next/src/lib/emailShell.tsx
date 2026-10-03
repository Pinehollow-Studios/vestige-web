import * as React from "react";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { siteConfig } from "./siteConfig";

/**
 * Shared branded shell + tokens for Vestige emails, aligned to the Vestige
 * Design System (dark appearance — the brand default for outward-facing work):
 * premium near-black `Surface` with a quiet blue atmosphere, one mint accent,
 * warm-cream primary text, Manrope display. Values are the canonical dark-mode
 * tokens; email-safe where the medium forces it (solid fills, web-font with a
 * platform-sans fallback, table-friendly components). Lives in lib/ (not
 * emails/) so the react-email dev server lists only real templates.
 */

export const brand = {
  // Surfaces (dark tokens)
  bg: "#070A10", // Surface — page background
  card: "#0C1220", // SurfaceRaised — the content card
  border: "rgba(255,255,255,0.12)", // Border (on glass/raised)
  separator: "rgba(255,255,255,0.10)", // Separator hairline
  // Text (dark tokens) — primary is a warm cream, not white
  ink: "#F2EFE6", // TextPrimary
  ink2: "#9DA9B6", // TextSecondary
  ink3: "#66717E", // TextTertiary
  // Accent — the one brand colour. In dark, Accent == AccentInk == mint.
  accent: "#5BE4C3",
  accentLime: "#8FE85B", // second gradient stop; never used alone
  onAccent: "#06231C", // near-black ink drawn ON mint fills / the gradient
  // Atmosphere — the blue soul (decorative only; mint never appears here)
  atmosphereGlow: "rgba(62,116,176,0.20)", // AtmosphereGlow (dark)
  atmosphereWash: "rgba(27,45,66,0.22)", // AtmosphereWash (dark)
  // Manrope is the only brand font; where it can't load, fall back to the
  // platform's native sans — never a serif, never a third face.
  display:
    "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  sans:
    "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
};

/** The signature mint→lime gradient (135°), with a flat mint fallback for
 *  clients that drop background images. Rationed to sanctioned CTA moments. */
export const accentGradient = {
  backgroundColor: brand.accent,
  backgroundImage: `linear-gradient(135deg, ${brand.accent} 0%, ${brand.accentLime} 100%)`,
};

/** Text style behind the <Eyebrow> motif: tracked uppercase in TextSecondary. */
export const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: brand.ink2,
  fontWeight: 700,
  fontFamily: brand.sans,
};

/**
 * Section eyebrow — a 5pt mint dot + a tracked uppercase caption in
 * TextSecondary (Design System §7.3). One per section, maximum.
 */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text style={eyebrowStyle}>
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: brand.accent,
          marginRight: 8,
          verticalAlign: "middle",
        }}
      />
      <span style={{ verticalAlign: "middle" }}>{children}</span>
    </Text>
  );
}

export const h1Style: React.CSSProperties = {
  margin: "14px 0 0",
  fontFamily: brand.display,
  fontSize: 30,
  lineHeight: "34px",
  letterSpacing: "-0.8px", // negative tracking at display sizes is part of the look
  color: brand.ink,
  fontWeight: 500,
};

export const pStyle: React.CSSProperties = {
  margin: "16px 0 0",
  fontSize: 15,
  lineHeight: "24px",
  color: brand.ink2,
};

export function EmailShell({
  preview,
  children,
  footer,
}: {
  preview: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        {/* Declare this as a dark-scheme email so clients render the dark
            design as authored instead of force-inverting it (iOS Mail) or
            washing the near-blacks to grey (Outlook dark mode). */}
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        <style
          dangerouslySetInnerHTML={{
            __html:
              // @import must come first in a stylesheet, before other rules.
              "@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');" +
              ":root{color-scheme:dark;supported-color-schemes:dark;}" +
              // Outlook dark mode lightens dark backgrounds; it tags remapped
              // elements with data-ogsb (background) / data-ogsc (text). Pin our
              // surfaces so they stay the intended near-black.
              ".vs-body,[data-ogsb] .vs-body{background-color:#070A10!important;}" +
              ".vs-card,[data-ogsb] .vs-card{background-color:#0C1220!important;}" +
              ".vs-sunken,[data-ogsb] .vs-sunken{background-color:#070A10!important;}",
          }}
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="vs-body"
        style={{
          backgroundColor: brand.bg,
          // Blue atmosphere (top glow + floor wash) — decorative progressive
          // enhancement; clients that drop it fall back to the flat Surface.
          backgroundImage: `radial-gradient(120% 65% at 50% 0%, ${brand.atmosphereGlow}, transparent 70%), radial-gradient(120% 60% at 50% 100%, ${brand.atmosphereWash}, transparent 70%)`,
          margin: 0,
          padding: "32px 0",
          fontFamily: brand.sans,
        }}
      >
        <Container style={{ width: "100%", maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
          <Section style={{ padding: "2px 4px 20px" }}>
            {/* Lockup — the app icon's globe, then the wordmark typeset in
                Manrope, sentence case, TextPrimary (§3). A <Row> rather than
                inline-flex: Outlook lays emails out as tables, and only a
                table keeps the two on one baseline there. The mark is served
                absolutely from the site because an email has no origin; it is
                decorative, so a client that blocks images loses nothing. */}
            <Row>
              <Column style={{ width: 30, paddingRight: 10 }}>
                <Img
                  src={`https://${siteConfig.domain}/brand/vestige-globe-128.png`}
                  width={30}
                  height={30}
                  alt=""
                  style={{ display: "block", border: 0 }}
                />
              </Column>
              <Column>
                <Text
                  style={{
                    margin: 0,
                    fontFamily: brand.display,
                    fontSize: 20,
                    letterSpacing: "-0.3px",
                    color: brand.ink,
                    fontWeight: 600,
                  }}
                >
                  Vestige
                </Text>
              </Column>
            </Row>
          </Section>

          <Section
            className="vs-card"
            style={{
              backgroundColor: brand.card,
              border: `1px solid ${brand.border}`,
              borderRadius: 18,
              padding: "32px 28px",
            }}
          >
            {children}
          </Section>

          <Section style={{ padding: "18px 4px 0" }}>
            <Hr style={{ borderColor: brand.separator, margin: "0 0 14px" }} />
            <Text style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: brand.ink3 }}>
              {siteConfig.brandName} &middot; {siteConfig.tagline}
            </Text>
            {footer && (
              <Text style={{ margin: "8px 0 0", fontSize: 12, lineHeight: "18px", color: brand.ink3 }}>
                {footer}
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export { Heading };
