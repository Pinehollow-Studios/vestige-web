"use client";

/**
 * Thin mint→lime gradient bar at the top of the viewport. Width is
 * pure CSS — calc(var(--gp) * 100%) off the global progress variable
 * written by useGlobalProgress — so it costs no React renders.
 */
export function ScrollProgress() {
  return <div aria-hidden className="fw-scroll-progress" />;
}
