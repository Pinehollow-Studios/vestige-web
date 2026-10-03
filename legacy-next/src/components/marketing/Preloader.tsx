"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { FwMark } from "./atoms";

type Phase = "loading" | "exit" | "gone";

/**
 * Cinematic intro — the brand mark settles, wordmark letters rise out of
 * a clipped baseline, a gradient hairline draws underneath, then the
 * whole curtain wipes up to reveal the hero. `onReveal` fires the moment
 * the wipe starts so the hero entrance overlaps the exit (no dead frame
 * between them).
 *
 * First visit holds ~1.5s; repeat visits in the same session get a
 * fast 350ms flash-wipe via sessionStorage.
 */
export function Preloader({ onReveal }: { onReveal: () => void }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("fw-intro-seen") === "1";
      sessionStorage.setItem("fw-intro-seen", "1");
    } catch {
      /* private mode — play the full intro */
    }
    // Written straight to the DOM (not state): it only retimes CSS
    // animations, and a sync setState here would cascade a re-render.
    if (seen) rootRef.current?.setAttribute("data-fast", "1");
    const hold = seen ? 350 : 1500;
    const t1 = setTimeout(() => {
      setPhase("exit");
      onReveal();
    }, hold);
    const t2 = setTimeout(() => setPhase("gone"), hold + 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "gone") return null;

  const letters = siteConfig.brandName.toUpperCase().split("");

  return (
    <div
      ref={rootRef}
      className="fw-preloader"
      data-phase={phase}
      data-fast="0"
      aria-hidden="true"
    >
      <div className="fw-preloader-inner">
        {/* The mark settles first, then the letters rise into it. Asked for
            at a size that covers the widest the clamp below ever goes. */}
        <FwMark
          size={96}
          className="fw-pre-mark"
          style={{ width: "clamp(52px, 8.4vw, 92px)", height: "auto" }}
        />
        <div className="fw-pre-word">
          {letters.map((ch, i) => (
            <span key={i} className="fw-pre-letterbox">
              <span
                className="fw-pre-letter"
                style={{ animationDelay: `${120 + i * 55}ms` }}
              >
                {ch}
              </span>
            </span>
          ))}
        </div>
        <span className="fw-pre-line" />
        <span className="fw-pre-tag">{siteConfig.tagline}</span>
      </div>
    </div>
  );
}
