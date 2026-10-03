"use client";

import { siteConfig } from "@/lib/siteConfig";
import { useViewScrub } from "./hooks";

/**
 * Closing set-piece — a viewport-wide outlined wordmark above the
 * footer. As the visitor scrolls to the end of the page the outline
 * fills left-to-right with the brand gradient and drifts up into
 * place, all scrubbed off the section's `--p` scroll variable.
 */
export function MegaWordmark() {
  // precision 2 — background-size repaints the giant glyphs, step at ~1%
  const ref = useViewScrub<HTMLDivElement>({
    start: 1.05,
    end: 0.68,
    precision: 2,
  });
  return (
    <div ref={ref} className="fw-mega" aria-hidden="true">
      <span className="fw-mega-text">
        {siteConfig.brandName.toUpperCase()}
      </span>
    </div>
  );
}
