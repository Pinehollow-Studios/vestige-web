"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The client shell around the homepage progress snapshot. The map's
 * fill-in choreography is pure CSS animation, which would otherwise
 * play on page load — long before the visitor scrolls here. This gates
 * it: the animations sit paused (data-shown="0") until the map is
 * actually on screen, so the counties sweep in on arrival.
 *
 * Crucially the observer watches the *map*, not the whole section —
 * the heading scrolls into view well before the map does, and gating
 * on the section meant the fill played (and finished) while the
 * visitor was still reading the text above it. Triggering on the map
 * being ~half on screen means the sweep happens while they're looking
 * at it.
 */
export function PeekFrame({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const target = section.querySelector<HTMLElement>(".fw-catlas") ?? section;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      // ~55% of the map visible — enough that it's the thing being looked
      // at, low enough to always be reachable (the map is ~1.2× as tall as
      // it is wide, so it fits any realistic viewport well under this).
      { threshold: 0.55 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="fw-peek" data-shown={shown ? "1" : "0"}>
      <div className="fw-peek-inner">{children}</div>
    </section>
  );
}
