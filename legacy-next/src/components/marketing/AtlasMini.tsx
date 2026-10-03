"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BRITAIN_PATH, COURSE_PINS } from "./britain";
import { progressConfig, COURSES_EXACT_TEXT } from "@/lib/progressConfig";

/**
 * The atlas companion — a small fixed map of Britain that rides along in
 * the corner and fills in as the visitor scrolls: the coastline draws
 * itself, course pins light one by one, and the counter ticks up to the
 * real course count. The product's promise ("your map of the country,
 * filling in") acted out by the page itself, and at the foot of the
 * page it lands on the finished number.
 *
 * Pin opacities and the outline draw are pure CSS off the global --gp
 * variable; only the counter number is a per-frame DOM write.
 */
export function AtlasMini() {
  const [shown, setShown] = useState(false);
  const numRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setShown(window.scrollY > window.innerHeight * 0.85);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Counter ticks with (lerped) global progress — written straight to
  // the DOM so the number can change every frame without re-rendering.
  useEffect(() => {
    const total = progressConfig.coursesMapped;
    let raf = 0;
    let cur = -1;
    let lastN = -1;
    let full: boolean | null = null;
    const loop = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      cur = cur < 0 ? target : cur + (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      const n = Math.round(cur * total);
      // text writes dirty layout — only touch the DOM when the number moves
      if (n !== lastN && numRef.current) {
        numRef.current.textContent = n.toLocaleString("en-GB");
        lastN = n;
      }
      // ...and the same guard for the "you've reached the whole country"
      // state, which turns the counter mint at the foot of the page.
      const isFull = n >= total;
      if (isFull !== full && metaRef.current) {
        metaRef.current.setAttribute("data-full", isFull ? "1" : "0");
        full = isFull;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fw-atlasmini" data-shown={shown ? "1" : "0"} aria-hidden="true">
      <svg viewBox="0 0 200 140" width="100%">
        <path d={BRITAIN_PATH} className="fw-atlasmini-outline" pathLength={1} />
        {COURSE_PINS.map((p, i) => (
          <g key={i}>
            <circle className="fw-atlasmini-pin-base" cx={p.x} cy={p.y} r={1.7} />
            <circle
              className="fw-atlasmini-pin"
              cx={p.x}
              cy={p.y}
              r={p.bright ? 2.4 : 2}
              style={{ "--pi": i + 1 } as CSSProperties}
            />
          </g>
        ))}
      </svg>
      <div className="fw-atlasmini-meta" ref={metaRef} data-full="0">
        <span className="fw-atlasmini-count">
          <span ref={numRef}>0</span>
          <span className="fw-atlasmini-of"> / {COURSES_EXACT_TEXT}</span>
        </span>
        <span className="fw-atlasmini-label">collected</span>
      </div>
    </div>
  );
}
