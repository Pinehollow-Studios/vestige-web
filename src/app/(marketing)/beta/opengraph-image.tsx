import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The preview card for `vestige.golf/beta` - what a texted invite shows in
 * Messages / WhatsApp. Same construction as the site card
 * (app/opengraph-image.tsx) - lockup, headline, meta line - but on the
 * ocean gradient with mint and lime glows, the accent gradient in the text,
 * 1200×630, generated at build time.
 */

export const alt = "The Vestige beta is open.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [m700, m600, glyph] = await Promise.all([
    readFile(join(process.cwd(), "assets/Manrope-700.woff")),
    readFile(join(process.cwd(), "assets/Manrope-600.woff")),
    readFile(join(process.cwd(), "public/brand/vestige-globe.png")),
  ]);

  const glyphSrc = `data:image/png;base64,${glyph.toString("base64")}`;

  const ink = "#F6F4EE";
  const sub = "#B4C0CC";
  const muted = "#8C99A8";
  const dot = "#4A5A6C";
  // The signature gradient (marketing.css --gradient-accent), drawn
  // through the text it sits on.
  const accentText = {
    backgroundImage: "linear-gradient(135deg, #5BE4C3 0%, #8FE85B 100%)",
    backgroundClip: "text",
    color: "transparent",
  } as const;

  const meta = ["iPhone, iOS 26+", "Free", `${siteConfig.domain}/beta`];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // Gradient-led (Tom, 2026-10-02): the site's ocean under a mint
          // glow top-right and a lime one bottom-left, all in the ground
          // itself - an absolutely placed glow box (as on the site card)
          // renders with a hard edge.
          background: [
            "radial-gradient(circle at 88% 8%, rgba(91,228,195,0.42) 0%, rgba(91,228,195,0) 48%)",
            "radial-gradient(circle at 6% 104%, rgba(143,232,91,0.24) 0%, rgba(143,232,91,0) 44%)",
            "radial-gradient(ellipse at 50% 40%, #26405E 0%, #1B2D42 48%, #0E1822 100%)",
          ].join(", "),
          padding: "76px 84px",
          fontFamily: "Manrope",
          position: "relative",
        }}
      >
        {/* lockup - the app icon's globe, then the wordmark */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={glyphSrc} width={46} height={46} alt="" style={{ marginRight: 18 }} />
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 7,
              color: ink,
            }}
          >
            VESTIGE
          </div>
        </div>

        {/* headline + hook */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: -3,
              color: ink,
            }}
          >
            The beta is&nbsp;<span style={accentText}>open.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 34,
              fontWeight: 600,
              color: sub,
            }}
          >
            Every course you’ve played, on one map.
          </div>
        </div>

        {/* meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 24,
            fontWeight: 600,
            color: muted,
          }}
        >
          {meta.map((item, i) => (
            <div key={item} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ display: "flex", margin: "0 14px", color: dot }}>·</div>}
              <div style={i === meta.length - 1 ? { display: "flex", ...accentText } : { display: "flex", color: muted }}>
                {item}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: m700, weight: 700, style: "normal" },
        { name: "Manrope", data: m600, weight: 600, style: "normal" },
      ],
    }
  );
}
