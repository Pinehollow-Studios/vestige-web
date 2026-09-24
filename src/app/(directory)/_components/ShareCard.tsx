import "server-only";

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The directory's share cards (plan §2.5), drawn with `ImageResponse` from
 * our own text and shapes - never Mapbox imagery, never a course outline.
 * The brand's dark ground and mint, as the site card (app/opengraph-image.tsx),
 * with the same font-loading pattern: Manrope 600 / 700 as woff (17 KB each)
 * and the small 128 px globe (30 KB), read once per server, well inside the
 * 500 KB bundle cap.
 */

export const shareCardSize = { width: 1200, height: 630 };
export const shareCardContentType = "image/png";

const ink = "#F6F4EE";
const mint = "#5BE4C3";
const sub = "#9BA7B5";
const muted = "#6E7A89";

let assets: Promise<{ m700: Buffer; m600: Buffer; glyphSrc: string }> | null = null;

function loadAssets() {
  assets ??= Promise.all([
    readFile(join(process.cwd(), "assets/Manrope-700.woff")),
    readFile(join(process.cwd(), "assets/Manrope-600.woff")),
    readFile(join(process.cwd(), "public/brand/vestige-globe-128.png")),
  ]).then(([m700, m600, glyph]) => ({
    m700,
    m600,
    glyphSrc: `data:image/png;base64,${glyph.toString("base64")}`,
  }));
  return assets;
}

/** The card's frame: the lockup up top, the page's own content, the address at the foot. */
async function render(content: ReactNode, foot: string): Promise<ImageResponse> {
  const { m700, m600, glyphSrc } = await loadAssets();
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
          padding: "72px 84px 64px",
          fontFamily: "Manrope",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            display: "flex",
            background: "linear-gradient(90deg, #5BE4C3 0%, #8FE85B 100%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Satori draws a plain <img>; next/image has no meaning inside ImageResponse. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={glyphSrc} width={44} height={44} alt="" style={{ marginRight: 16 }} />
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 7, color: ink }}>
            VESTIGE
          </div>
        </div>

        {content}

        <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: muted }}>{foot}</div>
      </div>
    ),
    {
      ...shareCardSize,
      fonts: [
        { name: "Manrope", data: m700, weight: 700, style: "normal" },
        { name: "Manrope", data: m600, weight: 600, style: "normal" },
      ],
    }
  );
}

/** Long names step down so the longest club name still sits on two lines. */
function nameSize(name: string): number {
  if (name.length <= 16) return 104;
  if (name.length <= 24) return 88;
  if (name.length <= 34) return 74;
  if (name.length <= 46) return 62;
  return 52;
}

/** One course: county over the name, style and founding year under, the Index only when present. */
export function courseShareCard(course: {
  name: string;
  county: string;
  style: string | null;
  founded: number | null;
  index: number | null;
}): Promise<ImageResponse> {
  const facts = [course.style, course.founded != null ? `Founded ${course.founded}` : null].filter(
    (f): f is string => Boolean(f)
  );
  return render(
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: course.index != null ? 760 : 1032 }}>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: mint }}>{course.county}</div>
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontSize: nameSize(course.name),
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: -2,
            color: ink,
          }}
        >
          {course.name}
        </div>
        {facts.length > 0 ? (
          <div style={{ display: "flex", marginTop: 26, fontSize: 32, fontWeight: 600, color: sub }}>
            {facts.join("  ·  ")}
          </div>
        ) : null}
      </div>
      {course.index != null ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginLeft: 40 }}>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -4,
              color: ink,
            }}
          >
            {String(course.index)}
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 26, fontWeight: 600, color: sub }}>
            Vestige Index
          </div>
        </div>
      ) : null}
    </div>,
    `${siteConfig.domain}/courses`
  );
}

/** The directory's one shared card: the front door, counties, styles and lists. */
export function directoryShareCard(counts: { courses: number; counties: number } | null, coverage: string): Promise<ImageResponse> {
  const fmt = new Intl.NumberFormat("en-GB");
  return render(
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 92,
          fontWeight: 700,
          lineHeight: 1.04,
          letterSpacing: -3,
          color: ink,
        }}
      >
        <div style={{ display: "flex" }}>Golf courses</div>
        <div style={{ display: "flex", color: mint }}>{`in ${coverage}`}</div>
      </div>
      {counts ? (
        <div style={{ display: "flex", marginTop: 28, fontSize: 34, fontWeight: 600, color: sub }}>
          {`${fmt.format(counts.courses)} courses  ·  ${fmt.format(counts.counties)} counties`}
        </div>
      ) : null}
    </div>,
    `${siteConfig.domain}/courses`
  );
}
