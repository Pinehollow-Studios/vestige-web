"use client";

import { useMemo } from "react";
import { accentFor, type Palette } from "./palette";

// ─── Three hero backdrops — verbatim from marketing-motion.jsx ─

type BgProps = { palette?: Palette };

export function AuroraBg({ palette = "mint" }: BgProps) {
  const acc = accentFor(palette);
  return (
    <div className="fw-aurora" aria-hidden="true">
      <div className="fw-aurora-base" />
      <div
        className="fw-aurora-blob fw-blob-1"
        style={{ background: `radial-gradient(circle, ${acc.a} 0%, transparent 60%)` }}
      />
      <div
        className="fw-aurora-blob fw-blob-2"
        style={{ background: `radial-gradient(circle, ${acc.b} 0%, transparent 60%)` }}
      />
      <div
        className="fw-aurora-blob fw-blob-3"
        style={{ background: `radial-gradient(circle, ${acc.a}dd 0%, transparent 60%)` }}
      />
      <div className="fw-aurora-grain" />
      <div
        className="fw-aurora-cursor"
        style={{ background: `radial-gradient(circle, ${acc.a}55 0%, transparent 60%)` }}
      />
    </div>
  );
}

export function ConstellationBg({ palette = "mint" }: BgProps) {
  const acc = accentFor(palette);
  const dots = useMemo(() => {
    const out: Array<{
      x: number;
      y: number;
      r: number;
      d: number;
      ad: number;
      bright: boolean;
    }> = [];
    for (let i = 0; i < 90; i++) {
      const a = Math.sin(i * 7.13) * 1000;
      const b = Math.cos(i * 5.91) * 1000;
      out.push({
        x: (Math.abs(a) % 1000) / 1000,
        y: (Math.abs(b) % 1000) / 1000,
        r: 0.4 + (((i * 13) % 7) / 7) * 1.6,
        d: 4 + ((i * 9) % 9),
        ad: ((i * 17) % 50) / 10,
        bright: (i * 23) % 5 === 0,
      });
    }
    return out;
  }, []);
  return (
    <div className="fw-constellation" aria-hidden="true">
      <div className="fw-constellation-base" />
      <div
        className="fw-constellation-glow"
        style={{
          background: `radial-gradient(ellipse at calc(var(--mx, 0.5) * 100%) calc(var(--my, 0.4) * 100%), ${acc.a}33 0%, transparent 55%)`,
        }}
      />
      <svg
        className="fw-constellation-svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="fw-dot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={acc.a} stopOpacity="1" />
            <stop offset="100%" stopColor={acc.a} stopOpacity="0" />
          </radialGradient>
        </defs>
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x * 1000}
            cy={d.y * 1000}
            r={d.r}
            fill={d.bright ? acc.a : "#9BB3C6"}
            opacity={d.bright ? 0.85 : 0.35}
            style={{
              animation: `fw-dot-drift ${d.d}s ease-in-out ${d.ad}s infinite alternate`,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          />
        ))}
      </svg>
      <div className="fw-constellation-fade" />
    </div>
  );
}

export function GlasscaseBg({ palette = "mint" }: BgProps) {
  const acc = accentFor(palette);
  return (
    <div className="fw-glasscase" aria-hidden="true">
      <div className="fw-glasscase-base" />
      <div
        className="fw-glasscase-disc"
        style={{
          background: `conic-gradient(from 0deg, ${acc.a}, ${acc.b}, #4D9DB8, ${acc.a}, ${acc.b})`,
        }}
      />
      <div
        className="fw-glasscase-disc-2"
        style={{
          background: `conic-gradient(from 180deg, ${acc.b}66, transparent, ${acc.a}66, transparent, ${acc.b}66)`,
        }}
      />
      <div className="fw-glasscase-glass" />
      <div className="fw-glasscase-grain" />
    </div>
  );
}

export type HeroMode = "aurora" | "constellation" | "glasscase";

export function HeroBackdrop({
  mode = "aurora",
  palette = "mint",
}: {
  mode?: HeroMode;
  palette?: Palette;
}) {
  if (mode === "constellation") return <ConstellationBg palette={palette} />;
  if (mode === "glasscase") return <GlasscaseBg palette={palette} />;
  return <AuroraBg palette={palette} />;
}
