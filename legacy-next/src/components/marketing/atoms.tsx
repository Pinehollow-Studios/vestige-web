"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { accentFor, fwF, fwT, type Palette } from "./palette";
import { useCountUp } from "./hooks";

// ─── Word-by-word reveal animation ──────────────────────────
// Direct port from marketing-shared.jsx :: RevealHeadline.

type RevealHeadlineProps = {
  pre: string;
  ital: string;
  post: string;
  palette?: Palette;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  italGradient?: boolean;
  /**
   * External gate for the word-by-word reveal. When provided, the
   * animation waits for `play` to flip true (e.g. the intro preloader
   * finishing) instead of firing on its own mount timer.
   */
  play?: boolean;
};

export function RevealHeadline({
  pre,
  ital,
  post,
  palette = "mint",
  fontSize,
  lineHeight,
  letterSpacing,
  italGradient = true,
  play,
}: RevealHeadlineProps) {
  const acc = accentFor(palette);
  const [internalVisible, setInternalVisible] = useState(false);
  useEffect(() => {
    if (play !== undefined) return;
    const t = setTimeout(() => setInternalVisible(true), 60);
    return () => clearTimeout(t);
  }, [play]);
  const visible = play === undefined ? internalVisible : play;
  // Pre-compute each word's character offset up front — mutating a
  // counter inside the JSX map callback trips react-hooks/immutability.
  const words: Array<{ w: string; start: number }> = [];
  {
    let off = 0;
    for (const w of (pre + ital + post).split(/(\s+)/)) {
      words.push({ w, start: off });
      off += w.length;
    }
  }
  const italStart = pre.length;
  const italEnd = italStart + ital.length;
  return (
    <h1
      style={{
        fontFamily: fwF.display,
        fontWeight: 500,
        color: fwT.ink,
        margin: 0,
        fontSize,
        lineHeight,
        letterSpacing,
        wordSpacing: "0.12em",
        textWrap: "pretty",
      }}
    >
      {words.map(({ w, start: wStart }, i) => {
        const wEnd = wStart + w.length;
        const inItal = wStart < italEnd && wEnd > italStart;
        if (/^\s+$/.test(w)) return <Fragment key={i}>{" "}</Fragment>;
        const child = inItal ? (
          <span
            style={{
              background: italGradient
                ? `linear-gradient(120deg, ${acc.a} 0%, ${acc.b} 50%, ${acc.a} 100%)`
                : undefined,
              backgroundSize: italGradient ? "200% 100%" : undefined,
              WebkitBackgroundClip: italGradient ? "text" : undefined,
              backgroundClip: italGradient ? "text" : undefined,
              WebkitTextFillColor: italGradient ? "transparent" : undefined,
              color: italGradient ? "transparent" : acc.a,
              animation: italGradient
                ? "fw-italic-shimmer 6s linear infinite"
                : undefined,
            }}
          >
            {w}
          </span>
        ) : (
          w
        );
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: visible
                ? "translateY(0) scale(1)"
                : "translateY(40%) scale(0.98)",
              opacity: visible ? 1 : 0,
              filter: visible ? "blur(0)" : "blur(8px)",
              transition: `transform 800ms cubic-bezier(0.2,0.8,0.2,1) ${i * 60}ms, opacity 800ms ease ${i * 60}ms, filter 800ms ease ${i * 60}ms`,
              willChange: "transform,opacity,filter",
            }}
          >
            {child}
          </span>
        );
      })}
    </h1>
  );
}

// ─── Brand mark + lockup ────────────────────────────────────

type FwMarkProps = {
  /** Laid-out size in px. Also the basis for the 2× source request. */
  size?: number;
  className?: string;
  /** Merged last — for callers that need a responsive width instead. */
  style?: React.CSSProperties;
};

/**
 * The brand mark — the same globe the app icon is built from.
 *
 * `public/brand/vestige-globe.png` is rendered out of the iOS Icon
 * Composer document by `scripts/build-brand-icons.sh`: the icon's globe
 * layer, cropped to its own edges, with no navy ground. Bare like this
 * it reads as a logo beside the wordmark; the grounded tile is what the
 * favicon and the touch icon use. Never redraw it — re-run the script.
 *
 * Sized at roughly 1.7× the wordmark's 13px — bigger and it reads as a
 * badge parked next to the type rather than one lockup.
 *
 * The intrinsic size is asked for at 2× the laid-out size and constrained
 * back down in CSS. next/image derives its srcset from the width prop, so
 * declaring the true 26px would leave a 3× phone rendering a 2× source of
 * a glossy 3D render — visibly soft on the one mark the eye returns to.
 * The extra weight is a few KB.
 *
 * `priority` because it sits in the first viewport of every page and a
 * lazily-loaded logo pops in after the text it belongs to.
 */
export function FwMark({ size = 22, className, style }: FwMarkProps) {
  return (
    <Image
      className={className}
      src="/brand/vestige-globe.png"
      alt=""
      aria-hidden="true"
      width={size * 2}
      height={size * 2}
      priority
      style={{ display: "block", flexShrink: 0, width: size, height: size, ...style }}
    />
  );
}

type FwLockupProps = {
  size?: number;
  color?: string;
  gap?: number;
  /** Caption to the right of the mark. Defaults to siteConfig.brandName. */
  label?: string;
  /** Show the globe mark to the left of the wordmark. */
  showMark?: boolean;
};

export function FwLockup({
  size = 22,
  color,
  gap = 10,
  label = "VESTIGE",
  showMark = true,
}: FwLockupProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap }}>
      {showMark && <FwMark size={size} />}
      <span
        style={{
          fontFamily: fwF.ui,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: color || fwT.ink,
        }}
      >
        {label}
      </span>
    </span>
  );
}

// ─── Live-counter eyebrow ───────────────────────────────────

type LiveEyebrowProps = {
  palette?: Palette;
  target?: number | null;
  label?: string;
  children?: React.ReactNode;
};

export function LiveEyebrow({
  palette = "mint",
  target,
  label,
  children,
}: LiveEyebrowProps) {
  const acc = accentFor(palette);
  const n = useCountUp(target ?? 0, { duration: 2200, delay: 200 });
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 13px 7px 11px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 999,
        fontFamily: fwF.ui,
        fontSize: 12,
        fontWeight: 600,
        color: fwT.ink2,
        letterSpacing: 0.1,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <span style={{ position: "relative", display: "inline-flex" }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: acc.a,
            animation: "fw-pulse-dot 1.8s ease-in-out infinite",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 999,
            border: `1px solid ${acc.a}`,
            opacity: 0.4,
            animation: "fw-pulse-ring 1.8s ease-out infinite",
          }}
        />
      </span>
      <span>
        {target != null && (
          <span
            style={{
              color: fwT.ink,
              fontWeight: 700,
              fontFeatureSettings: '"tnum" 1',
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {n.toLocaleString("en-GB")}
          </span>
        )}
        {target != null && " "}
        {label || children}
      </span>
    </span>
  );
}

// ─── Footer mark ────────────────────────────────────────────

export function FooterMark({
  children,
  dim,
}: {
  children: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <span
      style={{
        fontFamily: fwF.ui,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 2.2,
        textTransform: "uppercase",
        color: dim ? fwT.ink3 : fwT.ink2,
      }}
    >
      {children}
    </span>
  );
}
