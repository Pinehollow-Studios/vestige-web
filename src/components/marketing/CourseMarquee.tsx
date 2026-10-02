"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { fwF } from "./palette";
import { useScrollVelocity } from "./hooks";

/**
 * The course-name strip under the hero. Names with a directory page link
 * to it; `links` (name -> slug) comes from the server, which has checked
 * every configured slug resolves (lib/directory/marketing.ts), so a name
 * only links when its page exists. Without it every name is plain text.
 * The strip pauses on hover (marketing.css), so a name can be caught.
 */
export function CourseMarquee({ links }: { links?: Record<string, string> | null }) {
  // Duplicate the list so the translateX(-50%) loop reads seamlessly. The
  // copy is for the eye only: hidden from screen readers and out of the
  // tab order, so each course is announced and focusable once.
  const items = [
    ...siteConfig.marquee.map((m) => ({ ...m, copy: false })),
    ...siteConfig.marquee.map((m) => ({ ...m, copy: true })),
  ];
  // Lerped scroll velocity lands on the wrapper as --sv; the mask
  // converts it into a skew so the strip leans with scroll momentum.
  const velRef = useScrollVelocity<HTMLDivElement>();
  return (
    <div ref={velRef} className="fw-marquee">
      <div className="fw-marquee-mask">
        <div className="fw-marquee-track">
          {items.map((c, i) => {
            const slug = links?.[c.name];
            const style = { fontFamily: fwF.display, fontWeight: 400 };
            return (
              <span key={i} className="fw-marquee-item" aria-hidden={c.copy || undefined}>
                <span className="fw-marquee-sep">●</span>
                {slug ? (
                  <Link
                    className="fw-marquee-link"
                    href={`/courses/${slug}`}
                    tabIndex={c.copy ? -1 : undefined}
                    style={style}
                  >
                    {c.name}
                  </Link>
                ) : (
                  <span style={style}>{c.name}</span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
