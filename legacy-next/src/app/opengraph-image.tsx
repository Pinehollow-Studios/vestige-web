import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The share card — the first (often only) impression when the link is
 * forwarded in Messages / WhatsApp / Snapchat, which is how the site spreads.
 * Generated at build time and cached. 1200×630, brand dark + mint.
 */

export const alt = "Vestige — every course in Britain, collected.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [m700, m600, glyph] = await Promise.all([
    readFile(join(process.cwd(), "assets/Manrope-700.woff")),
    readFile(join(process.cwd(), "assets/Manrope-600.woff")),
    readFile(join(process.cwd(), "public/brand/vestige-globe.png")),
  ]);

  // Satori has no filesystem, so the mark is inlined. It is the app icon's
  // globe — see scripts/build-brand-icons.sh.
  const glyphSrc = `data:image/png;base64,${glyph.toString("base64")}`;

  const ink = "#F6F4EE";
  const mint = "#5BE4C3";
  const muted = "#6E7A89";
  const sub = "#9BA7B5";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#06090E",
          padding: "76px 84px",
          fontFamily: "Manrope",
          position: "relative",
        }}
      >
        {/* mint glow, top-right */}
        <div
          style={{
            position: "absolute",
            top: -240,
            right: -180,
            width: 760,
            height: 760,
            display: "flex",
            background:
              "radial-gradient(circle, rgba(91,228,195,0.22) 0%, rgba(91,228,195,0) 62%)",
          }}
        />

        {/* lockup — the app icon's globe, then the wordmark */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={glyphSrc}
            width={46}
            height={46}
            alt=""
            style={{ marginRight: 18 }}
          />
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
              flexDirection: "column",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: -3,
              color: ink,
            }}
          >
            <div style={{ display: "flex" }}>Every course in Britain,</div>
            <div style={{ display: "flex", color: mint }}>collected.</div>
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
            How many have you played?
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
          <div style={{ display: "flex" }}>iPhone</div>
          <div style={{ display: "flex", margin: "0 14px", color: "#3a4654" }}>·</div>
          <div style={{ display: "flex" }}>Free to download</div>
          <div style={{ display: "flex", margin: "0 14px", color: "#3a4654" }}>·</div>
          <div style={{ display: "flex", color: mint }}>{siteConfig.domain}</div>
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
