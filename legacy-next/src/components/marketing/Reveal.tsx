"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useScrollReveal } from "./hooks";

type RevealProps = {
  children: ReactNode;
  /** Staggered delay in ms — useful when revealing siblings in sequence. */
  delay?: number;
  /** Initial Y offset in px before the element settles. Default 24. */
  offset?: number;
  /** Pass-through className for the wrapping div. */
  className?: string;
};

/**
 * Scroll-triggered fade + lift wrapper. The wrapping div is a normal
 * block element — sits in the parent's layout context (grid item,
 * flex item, block) without affecting structure. Respects
 * prefers-reduced-motion via useScrollReveal.
 */
export function Reveal({
  children,
  delay = 0,
  offset = 24,
  className,
}: RevealProps) {
  const [ref, revealed] = useScrollReveal<HTMLDivElement>();
  // Once the entrance has fully played, strip the inline styles — a
  // page full of lingering blur(0) filters + will-change wrappers
  // holds dozens of compositor layers alive for no visual gain.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => setSettled(true), delay + 900);
    return () => clearTimeout(t);
  }, [revealed, delay]);
  return (
    <div
      ref={ref}
      className={className}
      style={
        settled
          ? undefined
          : {
              transform: revealed ? "translateY(0)" : `translateY(${offset}px)`,
              opacity: revealed ? 1 : 0,
              filter: revealed ? "blur(0px)" : "blur(10px)",
              transition: `transform 820ms cubic-bezier(0.2,0.8,0.2,1) ${delay}ms, opacity 820ms ease ${delay}ms, filter 820ms ease ${delay}ms`,
              willChange: "transform, opacity, filter",
            }
      }
    >
      {children}
    </div>
  );
}
