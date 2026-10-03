"use client";

import { accentFor, type Palette } from "./palette";
import { useTilt } from "./hooks";
import { BRITAIN_PATH, COURSE_PINS } from "./britain";

export type MotifKind = "atlas" | "tap" | "board";

/**
 * Three SVG feature motifs, each tuned to match its card body copy:
 *
 *   atlas  — Simplified Great Britain silhouette with pulsing course pins.
 *            Matches "Every course in Britain."
 *   tap    — Tap ripple + a logged-round receipt pill underneath.
 *            Matches "Tap the course. Add a score if you want to."
 *   board  — 5-row leaderboard, middle row highlighted as "you".
 *            Matches "A polite competition. Your friends, and across
 *            the country."
 */
function FeatureMotif({ kind, palette }: { kind: MotifKind; palette: Palette }) {
  const acc = accentFor(palette);

  if (kind === "atlas") {
    // Silhouette + real-course pin positions live in britain.ts —
    // shared with the fixed AtlasMini scroll companion.
    const pins = COURSE_PINS;
    return (
      <svg
        viewBox="0 0 200 140"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id={`mot-atlas-${palette}`} cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor={acc.a} stopOpacity="0.45" />
            <stop offset="100%" stopColor={acc.a} stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id={`mot-atlas-fill-${palette}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={acc.a} stopOpacity="0.14" />
            <stop offset="100%" stopColor={acc.b} stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="140" fill={`url(#mot-atlas-${palette})`} />

        {/* Great Britain silhouette — source noted in britain.ts */}
        <path
          d={BRITAIN_PATH}
          fill={`url(#mot-atlas-fill-${palette})`}
          stroke={acc.a}
          strokeOpacity="0.6"
          strokeWidth="0.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Course pins scattered across the map */}
        {pins.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.bright ? 2.2 : 1.6}
            fill={p.bright ? acc.a : "#9BB3C6"}
            opacity={p.bright ? 0.9 : 0.5}
            style={{
              animation: `fw-motif-pulse ${3 + ((i * 7) % 5)}s ease-in-out ${
                ((i * 11) % 20) / 10
              }s infinite`,
              transformBox: "fill-box",
              transformOrigin: "center",
              filter: p.bright ? `drop-shadow(0 0 4px ${acc.a})` : undefined,
            }}
          />
        ))}
      </svg>
    );
  }

  if (kind === "tap") {
    return (
      <svg
        viewBox="0 0 200 140"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id={`mot-tap-${palette}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={acc.a} stopOpacity="0.5" />
            <stop offset="100%" stopColor={acc.a} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="200" height="140" fill={`url(#mot-tap-${palette})`} />

        {/* Tap ripples — three expanding rings */}
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="100"
            cy="52"
            r="10"
            fill="none"
            stroke={acc.a}
            strokeWidth="0.8"
            opacity="0.5"
            style={{
              animation: `fw-motif-ring 2.6s ease-out ${i * 0.85}s infinite`,
              transformOrigin: "100px 52px",
            }}
          />
        ))}
        {/* Central tap dot */}
        <circle
          cx="100"
          cy="52"
          r="6"
          fill={acc.a}
          style={{
            filter: `drop-shadow(0 0 10px ${acc.a})`,
            animation: "fw-motif-bob 2.6s ease-in-out infinite",
            transformBox: "fill-box",
            transformOrigin: "center",
          }}
        />

        {/* Logged-round receipt pill below — visualises the optional score */}
        <g transform="translate(55, 96)">
          <rect
            x="0"
            y="0"
            width="90"
            height="24"
            rx="6"
            fill="rgba(0,0,0,0.4)"
            stroke={acc.a}
            strokeOpacity="0.45"
            strokeWidth="0.7"
          />
          {/* mint dot — the played marker */}
          <circle
            cx="13"
            cy="12"
            r="3.2"
            fill={acc.a}
            style={{ filter: `drop-shadow(0 0 4px ${acc.a})` }}
          />
          {/* course name placeholder */}
          <rect x="23" y="7" width="38" height="2.6" rx="1.3" fill="rgba(255,255,255,0.45)" />
          <rect x="23" y="14" width="26" height="2" rx="1" fill="rgba(255,255,255,0.22)" />
          {/* score chip on the right */}
          <rect
            x="66"
            y="6"
            width="18"
            height="12"
            rx="3"
            fill={`${acc.a}40`}
            stroke={acc.a}
            strokeOpacity="0.7"
            strokeWidth="0.6"
          />
        </g>
      </svg>
    );
  }

  // kind === "board" — leaderboard rows, middle row highlighted as "you"
  const rows = [
    { width: 130, isYou: false },
    { width: 108, isYou: false },
    { width: 88, isYou: true },
    { width: 72, isYou: false },
    { width: 56, isYou: false },
  ];
  return (
    <svg
      viewBox="0 0 200 140"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`mot-board-${palette}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={acc.a} stopOpacity="0.25" />
          <stop offset="100%" stopColor={acc.a} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="140" fill={`url(#mot-board-${palette})`} />

      {rows.map((row, i) => {
        const y = 16 + i * 22;
        return (
          <g key={i}>
            {/* avatar dot on the left */}
            <circle
              cx="22"
              cy={y + 4}
              r="3.5"
              fill={row.isYou ? acc.a : "#9BB3C6"}
              opacity={row.isYou ? 1 : 0.55}
              style={row.isYou ? { filter: `drop-shadow(0 0 4px ${acc.a})` } : undefined}
            />
            {/* score-length bar — width descends to suggest ranking */}
            <rect
              x="34"
              y={y}
              width={row.width}
              height="8"
              rx="4"
              fill={row.isYou ? acc.a : "rgba(255,255,255,0.08)"}
              fillOpacity={row.isYou ? 0.6 : 1}
              stroke={row.isYou ? acc.a : "rgba(255,255,255,0.15)"}
              strokeWidth="0.6"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function FeatureCard({
  kind,
  eyebrow,
  title,
  body,
  palette,
}: {
  kind: MotifKind;
  eyebrow: string;
  title: string;
  body: string;
  palette: Palette;
}) {
  const acc = accentFor(palette);
  // Pointer-tracked 3D tilt + glare — --rx/--ry/--gx/--gy land on the
  // article and the CSS turns them into the perspective transform.
  const tiltRef = useTilt<HTMLElement>(5);
  return (
    <article ref={tiltRef} className="fw-feature">
      <div className="fw-feature-motif">
        <FeatureMotif kind={kind} palette={palette} />
      </div>
      <div className="fw-feature-body">
        <div className="fw-feature-eyebrow" style={{ color: acc.a }}>
          {eyebrow}
        </div>
        <h3 className="fw-feature-title">{title}</h3>
        <p className="fw-feature-copy">{body}</p>
      </div>
    </article>
  );
}
