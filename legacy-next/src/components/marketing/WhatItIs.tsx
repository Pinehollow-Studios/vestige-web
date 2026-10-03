"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { accentFor, fwF, fwT, type Palette } from "./palette";
import { Reveal } from "./Reveal";
import { useViewScrub } from "./hooks";

/**
 * "Why we're building it" — studio-voice narrative between the stats and the
 * feature cards. Also carries the `#what` anchor the top-bar "What it is" link
 * points at (previously a dead link — no element had that id).
 *
 * The body copy is scroll-scrubbed word by word: the section writes a
 * 0..1 `--p` as it travels up the viewport, each word carries its index
 * as `--i`, and the CSS brightens words in sequence — so the paragraph
 * "reads itself in" at the visitor's own scroll pace.
 */
export function WhatItIs({ palette = "mint" }: { palette?: Palette }) {
  const acc = accentFor(palette);
  const { titlePre, titleItalic, body } = siteConfig.what;
  // precision 2 — word opacities repaint the paragraph, so step at ~1%
  const scrubRef = useViewScrub<HTMLDivElement>({
    start: 0.92,
    end: 0.38,
    precision: 2,
  });

  // Pre-split paragraphs into words with a running index across both,
  // so the brighten wave flows continuously from one into the next.
  let wordIndex = 0;
  const paragraphs = body.map((p) =>
    p.split(/\s+/).map((w) => ({ w, i: wordIndex++ }))
  );
  const totalWords = wordIndex;

  return (
    <section
      id="what"
      style={{
        position: "relative",
        zIndex: 2,
        padding: "clamp(64px, 9vw, 150px) clamp(20px, 5vw, 80px)",
        scrollMarginTop: 80,
      }}
    >
      <Reveal>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: fwF.display,
              fontSize: "clamp(30px, 4.4vw, 56px)",
              fontWeight: 500,
              letterSpacing: "-1.5px",
              lineHeight: 1.05,
              color: fwT.ink,
              margin: 0,
            }}
          >
            {titlePre}
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
              {titleItalic}
            </span>
          </h2>
        </div>
      </Reveal>

      <div
        ref={scrubRef}
        className="fw-scrub"
        style={{ "--n": totalWords } as CSSProperties}
      >
        {paragraphs.map((words, pi) => (
          <p
            key={pi}
            style={{
              fontFamily: fwF.ui,
              fontSize: "clamp(17px, 1.9vw, 24px)",
              lineHeight: 1.65,
              color: fwT.ink,
              margin: pi === 0 ? "30px auto 0" : "18px auto 0",
              maxWidth: 680,
              textAlign: "center",
              fontWeight: 450,
            }}
          >
            {words.map(({ w, i }, wi) => (
              <span key={wi}>
                <span
                  className="fw-scrub-word"
                  style={{ "--i": i } as CSSProperties}
                >
                  {w}
                </span>{" "}
              </span>
            ))}
          </p>
        ))}
      </div>

      {/* the three small ideas live on their own page now */}
      <Reveal>
        <Link href="/app" className="fw-peek-more">
          Inside the app →
        </Link>
      </Reveal>
    </section>
  );
}
