"use client";

import { siteConfig } from "@/lib/siteConfig";
import { fwF, fwT } from "./palette";
import { useViewScrub } from "./hooks";
import { Reveal } from "./Reveal";

/**
 * Roadmap timeline — three milestones between now and the App Store.
 *
 * Layout mirrors the rest of the site: eyebrow + serif h2 (with italic
 * mint-gradient shimmer on one word) + italic sub + visual block.
 *
 * The connecting line is scrubbed to scroll — it draws left-to-right
 * as the timeline travels up the viewport (and undraws if you scroll
 * back), via the `--p` variable useViewScrub writes on the container.
 * Each milestone fades up in stagger via <Reveal>; dots pulse.
 */
export function Roadmap() {
  const { eyebrow, titlePre, titleItalic, titlePost, sub, milestones } =
    siteConfig.roadmap;
  // precision 2 — the fill width relayouts/repaints, so step at ~1%
  const trackRef = useViewScrub<HTMLDivElement>({
    start: 0.92,
    end: 0.4,
    precision: 2,
  });

  return (
    <section id="roadmap" className="fw-roadmap-section">
      <Reveal>
        <div className="fw-roadmap-header">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: fwF.ui,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: 999,
                background: "var(--accent)",
              }}
            />
            {eyebrow}
          </span>
          <h2 className="fw-roadmap-title">
            {titlePre}
            <span
              style={{
                fontWeight: 500,
                background:
                  "linear-gradient(120deg, var(--accent), var(--accent-2), var(--accent))",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "fw-italic-shimmer 6s linear infinite",
              }}
            >
              {titleItalic}
            </span>
            {titlePost}
          </h2>
          <p className="fw-roadmap-sub">{sub}</p>
        </div>
      </Reveal>

      {/* --n lets the CSS size the grid and centre the track's ends on the
          first and last dots for any number of milestones. */}
      <div
        ref={trackRef}
        className="fw-timeline"
        style={{ "--n": milestones.length } as React.CSSProperties}
      >
        <div className="fw-timeline-track">
          <div className="fw-timeline-track-fill" />
        </div>
        <div className="fw-timeline-nodes">
          {milestones.map((m, i) => (
            <Reveal key={i} delay={250 + i * 180}>
              <article
                className={
                  m.status === "headline"
                    ? "fw-timeline-node fw-timeline-node--headline"
                    : "fw-timeline-node"
                }
              >
                <div className="fw-timeline-dot" />
                <p className="fw-timeline-date">
                  <span style={{ textTransform: "none", color: fwT.ink2, fontWeight: 600 }}>
                    {m.status === "now" ? "Now" : "Targeting"}{" "}
                  </span>
                  {m.month.toUpperCase()} · {m.year}
                </p>
                <h3 className="fw-timeline-label">{m.label}</h3>
                <p className="fw-timeline-body">{m.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
