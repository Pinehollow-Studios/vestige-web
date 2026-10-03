"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mouse parallax — writes `--mx` / `--my` (0..1) to <html>.
 * AuroraBg + ConstellationBg pick them up from CSS.
 * Verbatim port from marketing-shared.jsx.
 */
export function useMouseParallax() {
  const ref = useRef({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const fn = (e: PointerEvent) => {
      ref.current.x = e.clientX / window.innerWidth;
      ref.current.y = e.clientY / window.innerHeight;
      document.documentElement.style.setProperty("--mx", ref.current.x.toFixed(3));
      document.documentElement.style.setProperty("--my", ref.current.y.toFixed(3));
    };
    window.addEventListener("pointermove", fn, { passive: true });
    return () => window.removeEventListener("pointermove", fn);
  }, []);
  return ref;
}

/**
 * Count-up — chosen to use setTimeout (not RAF) so it ticks in
 * backgrounded tabs and embedded previews.
 *
 * `enabled` defaults true so existing call sites (LiveEyebrow in the
 * hero, ClosingCTA chip) keep firing on mount. Pass `false` to gate the
 * counter and flip it `true` when the parent should kick the count —
 * e.g. when the stats strip scrolls into view.
 */
export function useCountUp(
  target: number,
  {
    duration = 1600,
    delay = 0,
    enabled = true,
  }: { duration?: number; delay?: number; enabled?: boolean } = {}
): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let start: number | null = null;
    const tick = () => {
      const now = performance.now();
      if (start == null) start = now;
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * e));
      if (p < 1) timer = setTimeout(tick, 32);
    };
    timer = setTimeout(tick, delay);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [target, duration, delay, enabled]);
  return v;
}

/**
 * Scroll-triggered reveal. Returns [ref, revealed] — attach the ref to
 * the element, gate transforms/opacity on the boolean. Fires once,
 * disconnects the observer after first hit. Respects
 * `prefers-reduced-motion: reduce` by resolving to revealed=true
 * immediately so no motion runs.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
}: { threshold?: number; rootMargin?: string } = {}) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Note: prefers-reduced-motion is intentionally NOT honoured —
    // motion is part of the brand on this marketing surface.

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return [ref, revealed] as const;
}

/**
 * Scroll-scrubbed progress (0..1) written as a CSS custom property on
 * the element itself — children consume it via calc(). One rAF loop per
 * instance, lerped (`smooth`) so the value glides rather than snaps.
 *
 * mode "view"  — p maps the element's top edge travelling from
 *                `start` (viewport fraction, 0.9 = near bottom) to `end`.
 * mode "exit"  — p maps absolute scrollY across ~0.85 viewport heights;
 *                used by the hero, which is pinned at the document top.
 *
 * While a form field inside the element holds focus, p is frozen at its
 * current value: mobile browsers auto-scroll the page to keep a focused
 * input above the keyboard, and that scroll is indistinguishable from a
 * real one — without the freeze, tapping the hero's email input fades
 * out the very form being typed into. Resumes (and lerps to the true
 * value) on blur.
 */
export function useViewScrub<T extends HTMLElement = HTMLElement>({
  start = 0.9,
  end = 0.35,
  smooth = 0.14,
  varName = "--p",
  mode = "view",
  // Decimal places written to the CSS var. Composited consumers
  // (transform/opacity) can take 4; paint-triggering consumers (text
  // opacity ramps, background-size, widths) should pass 2 so they
  // repaint on ~1% steps instead of every frame.
  precision = 4,
}: {
  start?: number;
  end?: number;
  smooth?: number;
  varName?: string;
  mode?: "view" | "exit";
  precision?: number;
} = {}) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let cur = -1;
    let lastWritten = "";
    let focusHeld = false;
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;
    const isFormField = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.matches("input, textarea, select") || t.isContentEditable);
    const onFocusIn = (e: FocusEvent) => {
      if (isFormField(e.target)) {
        if (releaseTimer) {
          clearTimeout(releaseTimer);
          releaseTimer = undefined;
        }
        focusHeld = true;
      }
    };
    const onFocusOut = () => {
      // Don't resume the instant the field blurs. On mobile, closing the
      // keyboard (e.g. on submit) unwinds its scroll over a few hundred ms,
      // and that motion would otherwise read as a real scroll and fade the
      // hero. Stay frozen briefly so the page settles back first.
      if (releaseTimer) clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        focusHeld = false;
        releaseTimer = undefined;
      }, 800);
    };
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    const loop = () => {
      if (focusHeld) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const vh = window.innerHeight || 1;
      let p: number;
      if (mode === "exit") {
        p = window.scrollY / (vh * 0.85);
      } else {
        const top = el.getBoundingClientRect().top / vh;
        p = (start - top) / (start - end);
      }
      const target = Math.max(0, Math.min(1, p));
      cur = cur < 0 ? target : cur + (target - cur) * smooth;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      const v = cur.toFixed(precision);
      // skip the style write when settled — keeps the page recalc-free at rest
      if (v !== lastWritten) {
        el.style.setProperty(varName, v);
        lastWritten = v;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (releaseTimer) clearTimeout(releaseTimer);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, [start, end, smooth, varName, mode, precision]);
  return ref;
}

/**
 * Scroll velocity (-1..1, lerped) written as a CSS custom property on
 * the element — the marquee consumes it for its scroll-reactive skew.
 * Written on the element (not <html>) to keep style recalc scoped.
 */
export function useScrollVelocity<T extends HTMLElement = HTMLElement>(
  varName = "--sv"
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let last = window.scrollY;
    let v = 0;
    let lastWritten = "";
    const loop = () => {
      const y = window.scrollY;
      const target = Math.max(-1, Math.min(1, (y - last) / 36));
      last = y;
      v += (target - v) * 0.09;
      if (Math.abs(v) < 0.001) v = 0;
      const out = v.toFixed(4);
      if (out !== lastWritten) {
        el.style.setProperty(varName, out);
        lastWritten = out;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [varName]);
  return ref;
}

/**
 * 3D card tilt — writes `--rx`/`--ry` (deg multipliers) and `--gx`/`--gy`
 * (0..1 glare position) onto the element; CSS turns them into a
 * perspective transform + cursor-tracking glare. Mouse only — touch
 * pointers are ignored so cards stay flat on mobile.
 */
export function useTilt<T extends HTMLElement = HTMLElement>(max = 6) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--rx", ((py - 0.5) * -2 * max).toFixed(2));
        el.style.setProperty("--ry", ((px - 0.5) * 2 * max).toFixed(2));
        el.style.setProperty("--gx", px.toFixed(3));
        el.style.setProperty("--gy", py.toFixed(3));
        el.setAttribute("data-tilt", "1");
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--rx", "0");
      el.style.setProperty("--ry", "0");
      el.removeAttribute("data-tilt");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return ref;
}

/**
 * Magnetic pull — the element leans toward the cursor while the pointer
 * is inside the surrounding `areaSelector` ancestor (falls back to the
 * element itself). Writes `--mdx`/`--mdy` px offsets; CSS applies them
 * inside the element's transform so hover scales still compose.
 *
 * The lean is deliberately small and bounded: `maxOffset` caps the travel
 * in px (per axis) so a CTA can never wander into the control beside it,
 * and the pull fades to zero at the edge of `reach` instead of cutting
 * out, so leaving the area doesn't snap the element back.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(
  strength = 0.32,
  areaSelector?: string,
  maxOffset = 8
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const area: HTMLElement =
      (areaSelector && (el.closest(areaSelector) as HTMLElement)) || el;
    let raf = 0;
    const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(r.width, r.height) * 1.4;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Linear falloff: full lean near the button, nothing at the edge
        // of reach. Vertical travel is tighter than horizontal — these
        // pills sit in short rows, so a few px up/down is all there is.
        const falloff = dist < reach ? 1 - dist / reach : 0;
        const ox = clamp(dx * strength * falloff, maxOffset);
        const oy = clamp(dy * strength * falloff, maxOffset * 0.6);
        el.style.setProperty("--mdx", ox.toFixed(2));
        el.style.setProperty("--mdy", oy.toFixed(2));
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--mdx", "0");
      el.style.setProperty("--mdy", "0");
    };
    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, [strength, areaSelector, maxOffset]);
  return ref;
}

/**
 * Global page progress (0..1, lerped) written as `--gp` on <html> —
 * the one variable every cross-page companion evolves against: the
 * progress bar, the ambient colour journey, and the AtlasMini pins
 * all consume it from CSS, so scroll causes zero React re-renders.
 */
export function useGlobalProgress() {
  useEffect(() => {
    let raf = 0;
    let cur = -1;
    let lastWritten = "";
    const loop = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      cur = cur < 0 ? target : cur + (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      // 3 decimals: --gp feeds some paint-triggering consumers (atlas
      // pins), so fewer distinct values = fewer repaints per scroll.
      const v = cur.toFixed(3);
      // writing --gp on <html> recalcs every consumer — only do it on change
      if (v !== lastWritten) {
        document.documentElement.style.setProperty("--gp", v);
        lastWritten = v;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}
