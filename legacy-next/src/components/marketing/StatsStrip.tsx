"use client";

import { Fragment } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { useCountUp, useScrollReveal } from "./hooks";

function StatItem({
  target,
  label,
  prefix = "",
  suffix = "",
  staticVal,
  enabled,
  delay,
  revealed,
}: {
  target?: number;
  label: string;
  prefix?: string;
  suffix?: string;
  staticVal?: string;
  enabled: boolean;
  delay: number;
  revealed: boolean;
}) {
  // Count-up gated on the strip-level scroll trigger — numbers don't
  // tick at all until the user has scrolled the strip into view.
  const n = useCountUp(target ?? 0, {
    duration: 1800,
    delay: 200,
    enabled,
  });
  return (
    <div
      className="fw-stat"
      style={{
        transform: revealed ? "translateY(0)" : "translateY(24px)",
        opacity: revealed ? 1 : 0,
        transition: `transform 720ms cubic-bezier(0.2,0.8,0.2,1) ${delay}ms, opacity 720ms ease ${delay}ms`,
        willChange: "transform, opacity",
      }}
    >
      <div className={staticVal != null ? "v v-static" : "v"}>
        {staticVal != null ? (
          staticVal
        ) : (
          <Fragment>
            {prefix}
            {n.toLocaleString("en-GB")}
            {suffix}
          </Fragment>
        )}
      </div>
      <div className="l">{label}</div>
    </div>
  );
}

export function StatsStrip() {
  // One IntersectionObserver at the strip level — when it fires, all
  // four cells fade-up in stagger AND the count-ups kick off.
  const [stripRef, revealed] = useScrollReveal<HTMLElement>({
    threshold: 0.25,
  });

  return (
    <section ref={stripRef} className="fw-stats">
      {siteConfig.stats.map((s, i) => {
        const delay = i * 90;
        if (s.kind === "static") {
          return (
            <StatItem
              key={i}
              staticVal={s.value}
              label={s.label}
              enabled={false}
              delay={delay}
              revealed={revealed}
            />
          );
        }
        return (
          <StatItem
            key={i}
            target={s.target}
            prefix={s.prefix}
            suffix={s.suffix}
            label={s.label}
            enabled={revealed}
            delay={delay}
            revealed={revealed}
          />
        );
      })}
    </section>
  );
}
