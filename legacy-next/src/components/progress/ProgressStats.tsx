"use client";

import { useCountUp, useScrollReveal } from "../marketing/hooks";

type Stat = {
  label: string;
  value: number;
  /**
   * Denominator of the "x of y" fraction. Null once the counting is
   * finished and the value IS the total — the bar fills and `note`
   * takes the place of the fraction.
   */
  total?: number | null;
  /** Render the total as approximate ("~2,000"). */
  approx?: boolean;
  /** Stands in for "of y" when there's no denominator left. */
  note?: string;
};

function StatRow({
  stat,
  revealed,
  delay,
}: {
  stat: Stat;
  revealed: boolean;
  delay: number;
}) {
  const n = useCountUp(stat.value, { duration: 1800, delay: 200 + delay, enabled: revealed });
  const fraction = stat.total ? stat.value / stat.total : 1;
  const pct = Math.round(fraction * 100);
  return (
    <div
      className="fw-prog-stat"
      style={{
        transform: revealed ? "translateY(0)" : "translateY(20px)",
        opacity: revealed ? 1 : 0,
        transition: `transform 720ms cubic-bezier(0.2,0.8,0.2,1) ${delay}ms, opacity 720ms ease ${delay}ms`,
      }}
    >
      <div className="l">{stat.label}</div>
      <div className="row">
        <span className="v">{n.toLocaleString("en-GB")}</span>
        <span className={stat.total ? "of" : "of of-note"}>
          {stat.total ? (
            <>
              of {stat.approx && "~"}
              {stat.total.toLocaleString("en-GB")}
            </>
          ) : (
            stat.note
          )}
        </span>
        {/* The percentage earns its place only against a denominator.
            Next to "every one in Britain" it says nothing new, and on a
            phone it was the thing that pushed the row onto two lines. */}
        {stat.total && <span className="pct">{pct}%</span>}
      </div>
      <div className="fw-prog-bar">
        <i
          style={{
            width: `${fraction * 100}%`,
            transform: revealed ? "scaleX(1)" : "scaleX(0)",
            transitionDelay: `${200 + delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * The ledger under the map — both headline fractions with their
 * progress bars, and (when given) the last-updated stamp. Numbers
 * count up and the bars draw once the card scrolls into view, same
 * choreography as the homepage StatsStrip. The homepage snapshot
 * omits `lastUpdated`; the full /progress page carries it.
 *
 * With the whole map finished the card leads with the completion
 * banner and the fractions become statements: 3 of 3, and a course
 * count with nothing left to divide it by. Short of that, a finished
 * country is a `milestone` — the same banner, above fractions that
 * still have somewhere to go. `latest` is ignored in either state —
 * "just added" stops being the news once a country is done.
 */
export function ProgressStats({
  countries,
  courses,
  latest,
  lastUpdated,
  complete,
  completedOn,
  milestone,
}: {
  countries: Stat;
  courses: Stat;
  /** Most recently mapped county — named in a "Just added" ledger line. */
  latest?: string;
  lastUpdated?: string;
  /** Every country mapped — leads with the banner instead of the beacon. */
  complete?: boolean;
  /** The day the last county landed, stamped on the banner. */
  completedOn?: string;
  /** A finished country while the rest is still filling in. */
  milestone?: { label: string; date?: string } | null;
}) {
  const [ref, revealed] = useScrollReveal<HTMLDivElement>({ threshold: 0.25 });
  const banner = complete
    ? { label: "Great Britain complete", date: completedOn }
    : milestone ?? null;
  const showLatest = !complete && !milestone && latest;
  return (
    <div
      ref={ref}
      className="fw-prog-card"
      data-complete={complete ? "1" : "0"}
      data-milestone={!complete && banner ? "1" : "0"}
    >
      {banner && (
        <div
          className="fw-prog-banner"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "translateY(0)" : "translateY(-8px)",
            transition: "transform 720ms cubic-bezier(0.2,0.8,0.2,1), opacity 720ms ease",
          }}
        >
          <span className="fw-prog-banner-tick" aria-hidden="true" />
          <span className="fw-prog-banner-text">{banner.label}</span>
          {banner.date && <span className="fw-prog-banner-date">{banner.date}</span>}
        </div>
      )}
      <StatRow stat={countries} revealed={revealed} delay={banner ? 120 : 0} />
      <StatRow stat={courses} revealed={revealed} delay={banner ? 240 : 120} />
      {showLatest && (
        <div className="fw-prog-stamp fw-prog-latest">
          <span className="dot" aria-hidden="true" />
          Just added <b>{latest}</b>
        </div>
      )}
      {/* The banner already carries the completion date, and on the day
          the map finished it IS the last-updated date — printing it twice
          in one card just looks like a bug. */}
      {lastUpdated && !(banner && lastUpdated === banner.date) && (
        <div
          className={`fw-prog-stamp${showLatest ? " fw-prog-stamp-plain" : ""}`}
        >
          <span className="dot" aria-hidden="true" />
          Last updated <b>{lastUpdated}</b>
        </div>
      )}
    </div>
  );
}
