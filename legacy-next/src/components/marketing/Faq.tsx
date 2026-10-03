"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { accentFor, type Palette } from "./palette";
import { Reveal } from "./Reveal";

/**
 * FAQ — single-open accordion with an animated reveal. The panel height
 * animates via a CSS grid-rows 0fr→1fr transition (smooth, no JS measuring),
 * with the answer fading + lifting in. Buttons carry aria-expanded/controls
 * so it stays keyboard- and screen-reader-friendly.
 */
export function Faq({ palette = "mint" }: { palette?: Palette }) {
  const acc = accentFor(palette);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="fw-faq-section">
      <Reveal>
        <div className="fw-faq-head">
          <span className="fw-faq-eyebrow" style={{ color: acc.a }}>
            <span
              style={{ width: 5, height: 5, borderRadius: 999, background: acc.a }}
            />
            Good to know
          </span>
          <h2 className="fw-faq-title">Before you ask.</h2>
        </div>

      </Reveal>

      <div className="fw-faq-list">
        {siteConfig.faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={i} delay={i * 60} offset={18}>
              <div className="fw-faq-item" data-open={isOpen}>
                <button
                  type="button"
                  className="fw-faq-q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-q-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="fw-faq-mark" aria-hidden>
                    +
                  </span>
                </button>
                <div
                  className="fw-faq-panel"
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                >
                  <div className="fw-faq-panel-inner">
                    <p className="fw-faq-a">
                      {item.a}
                      {item.link && (
                        <>
                          {" "}
                          {/* Out of the tab order while its panel is shut:
                              the closed panel is only collapsed, not gone. */}
                          <Link
                            className="fw-faq-link"
                            href={item.link.href}
                            tabIndex={isOpen ? undefined : -1}
                          >
                            {item.link.label} →
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
