"use client";

import { siteConfig } from "@/lib/siteConfig";
import { accentFor, fwF, fwT, type Palette } from "./palette";
import { useCountUp } from "./hooks";
import { GlassEmail } from "./GlassEmail";

export function ClosingCTA({
  palette = "mint",
  joinedTotal = null,
}: {
  palette?: Palette;
  joinedTotal?: number | null;
}) {
  const acc = accentFor(palette);
  const { eyebrowLabel, headlinePre, headlineItalic, sub, ctaLabel, forwardNudge } =
    siteConfig.closingCta;
  const joined = useCountUp(joinedTotal ?? 0, { duration: 1800, delay: 200 });
  // Pull off a leading "P.S." so it can be tinted mint.
  const psMatch = forwardNudge.match(/^(P\.S\.)\s+([\s\S]*)$/);

  return (
    <section id="join" className="fw-cta-section">
      {joinedTotal != null && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 14px 7px 11px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 999,
            marginBottom: 32,
          }}
        >
          <span style={{ position: "relative", display: "inline-flex" }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: acc.a,
                animation: "fw-pulse-dot 1.8s ease-in-out infinite",
              }}
            />
          </span>
          <span
            style={{
              fontFamily: fwF.ui,
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(246,244,238,0.7)",
              fontFeatureSettings: '"tnum" 1',
            }}
          >
            <span style={{ color: fwT.ink, fontWeight: 700 }}>
              {joined.toLocaleString("en-GB")}
            </span>{" "}
            {eyebrowLabel}
          </span>
        </div>
      )}
      <h2 className="fw-cta-title">
        {headlinePre}
        <span
          style={{
            fontWeight: 500,
            background: `linear-gradient(120deg, ${acc.a}, ${acc.b}, ${acc.a})`,
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "fw-italic-shimmer 6s linear infinite",
          }}
        >
          {headlineItalic}
        </span>
      </h2>
      <p className="fw-cta-sub">{sub}</p>
      <div style={{ position: "relative", zIndex: 2 }}>
        <GlassEmail palette={palette} cta={ctaLabel} />
      </div>
      <p
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: 16,
          fontFamily: fwF.ui,
          fontSize: 12.5,
          color: "rgba(246,244,238,0.45)",
        }}
      >
        No spam. Just {siteConfig.brandName}. Unsubscribe anytime ·{" "}
        <a
          href="/privacy"
          style={{
            color: "rgba(246,244,238,0.7)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          Privacy
        </a>
      </p>
      <p
        style={{
          position: "relative",
          zIndex: 2,
          margin: "48px auto 0",
          maxWidth: 470,
          fontFamily: fwF.ui,
          fontSize: 14.5,
          lineHeight: 1.6,
          color: "rgba(246,244,238,0.62)",
        }}
      >
        {psMatch ? (
          <>
            <span style={{ color: acc.a, fontWeight: 700 }}>{psMatch[1]}</span>{" "}
            {psMatch[2]}
          </>
        ) : (
          forwardNudge
        )}
      </p>
    </section>
  );
}
