import type { CSSProperties } from "react";
import { COUNTY_SHAPES, COUNTY_VIEW } from "./counties";
import { COUNTRY_SHAPES } from "./countries";
import { ENGLAND_COAST, ENGLAND_ISLES } from "./englandOutline";

/**
 * The hero of /progress — Great Britain, with every ceremonial county of
 * England drawn and the completed ones filling in mint one by one, south
 * to north (the order the database was actually grown in), and Wales and
 * Scotland beside it as single "still to come" shapes until their
 * regions exist. A server component on purpose: the ~9,000 points of
 * geometry render once into HTML and never ship as client JavaScript;
 * the choreography is pure CSS animation-delay, so the map needs no
 * hydration at all.
 *
 * Completed counties are painted twice — once faint in the base layer
 * with all 47, once mint in the overlay — so each fade-in simply
 * reveals the overlay over an already-complete map.
 *
 * When the whole map is done (`complete`) it runs its finale: the seams
 * between the counties dissolve so the pieces become one country, the
 * coastline draws itself round the land, a pulse of light leaves the
 * coast and a flush sweeps across. Every beat is timed off the county
 * count, so it stays glued to the end of the fill sweep however many
 * counties there are. While anything is still to come, the newest
 * county pulses instead (if given) and the finale never runs.
 *
 * NB the finale's coastline is England's (englandOutline.ts). When
 * Scotland and Wales are in and the map really is complete, regenerate
 * it over the whole of Britain first — the outline script traces
 * whatever is in counties.ts.
 */
export function CountyAtlas({
  completed,
  latest,
  courses,
  complete,
}: {
  completed: ReadonlyArray<string>;
  latest?: string;
  /** Courses mapped — the second figure on the completion badge. */
  courses?: number;
  /** Every country mapped — runs the finale instead of the legend. */
  complete: boolean;
}) {
  const known = new Set(COUNTY_SHAPES.map((s) => s.name));
  const unknown = completed.filter((n) => !known.has(n));
  if (unknown.length) {
    // Surfaces at build time (the page is static) — a typo in
    // progressConfig.completedCounties fails the deploy instead of
    // silently leaving a county unfilled.
    throw new Error(
      `progressConfig.completedCounties: no county named ${unknown
        .map((n) => `"${n}"`)
        .join(", ")} — names must match counties.ts exactly.`
    );
  }

  const doneSet = new Set(completed);
  // South → north, so the mint sweep climbs the country the way the
  // course database was built.
  const done = COUNTY_SHAPES.filter((s) => doneSet.has(s.name)).sort(
    (a, b) => b.cy - a.cy
  );

  // The moment the last county has finished fading in. Mirrors the
  // done-path timing in marketing.css (620ms + i*55ms, 500ms each). Every
  // beat that has to land after the sweep — the legend, the "just added"
  // beacon, the whole finale — is offset from this one value in CSS, so
  // the choreography stays glued to the end of the fill at any county
  // count and can be retuned in one place.
  const sweepEnd = 1120 + Math.max(0, done.length - 1) * 55;

  // Mid-fill, the most recent addition gets a "Just added" beacon anchored
  // to its centroid, a beat after the sweep passes it.
  const latestShape =
    !complete && latest ? done.find((s) => s.name === latest) : undefined;

  const coming = complete ? [] : COUNTRY_SHAPES;

  const vars = { "--sweep-end": `${sweepEnd}ms` } as Record<string, string>;
  // The flush crosses the map's own width, so the distance is the viewBox.
  if (complete) vars["--catlas-w"] = `${COUNTY_VIEW.w}px`;

  const label = complete
    ? `Map of Great Britain: all ${COUNTY_SHAPES.length} counties mapped, the map complete`
    : `Map of Great Britain: ${completed.length} of ${COUNTY_SHAPES.length} counties mapped so far${
        latestShape ? `, most recently ${latestShape.name}` : ""
      }${coming.length ? `; ${coming.map((c) => c.name).join(" and ")} still to come` : ""}`;

  return (
    <figure
      className="fw-catlas"
      data-complete={complete ? "1" : "0"}
      role="img"
      aria-label={label}
      style={vars as CSSProperties}
    >
      <svg viewBox={`0 0 ${COUNTY_VIEW.w} ${COUNTY_VIEW.h}`} width="100%">
        <defs>
          <linearGradient
            id="fw-catlas-mint"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={COUNTY_VIEW.w}
            y2={COUNTY_VIEW.h}
          >
            <stop offset="0%" stopColor="#5BE4C3" />
            <stop offset="100%" stopColor="#8FE85B" />
          </linearGradient>
          {complete && (
            <>
              {/* The flush of light that crosses the finished country —
                  a band wider than the map, slid across and clipped to
                  the coast so it can only ever light up the land. */}
              <linearGradient id="fw-catlas-flush" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#EAFBF5" stopOpacity="0" />
                <stop offset="45%" stopColor="#EAFBF5" stopOpacity="0.5" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.62" />
                <stop offset="100%" stopColor="#EAFBF5" stopOpacity="0" />
              </linearGradient>
              <clipPath id="fw-catlas-land">
                <path d={ENGLAND_COAST} />
                <path d={ENGLAND_ISLES} />
              </clipPath>
            </>
          )}
        </defs>
        {/* Still to come: the countries without a region model yet, as one
            quiet shape each — the same treatment the app gives them. */}
        {coming.length > 0 && (
          <g className="fw-catlas-coming">
            {coming.map((c) => (
              <path key={c.name} d={c.d} fillRule="evenodd">
                <title>{`${c.name} — still to come`}</title>
              </path>
            ))}
            {coming.map((c) => (
              <text
                key={`${c.name}-label`}
                className="fw-catlas-coming-label"
                x={c.lx}
                y={c.ly}
                textAnchor="middle"
                aria-hidden="true"
              >
                <tspan x={c.lx}>{c.name}</tspan>
                <tspan x={c.lx} dy="11" className="sub">
                  still to come
                </tspan>
              </text>
            ))}
          </g>
        )}
        <g className="fw-catlas-base">
          {COUNTY_SHAPES.map((s) => (
            <path key={s.name} d={s.d} fillRule="evenodd">
              <title>{s.name}</title>
            </path>
          ))}
        </g>
        {/* One solid country beneath the counties, faded in as the seams
            go. Each county was simplified on its own, so neighbours meet
            with hairline gaps — invisible under a stroke, but the moment
            the strokes dissolve those gaps let the dark page through and
            keep drawing the borders. This gives them mint to show. */}
        {complete && (
          <g className="fw-catlas-land" aria-hidden="true">
            <path d={ENGLAND_COAST} />
            <path d={ENGLAND_ISLES} />
          </g>
        )}
        <g className="fw-catlas-done">
          {done.map((s, i) => (
            <path
              key={s.name}
              d={s.d}
              fillRule="evenodd"
              style={{ "--i": i } as CSSProperties}
            >
              <title>{`${s.name} — ${
                !complete && s.name === latest ? "just added" : "mapped"
              }`}</title>
            </path>
          ))}
        </g>
        {latestShape && (
          <g className="fw-catlas-beacon" aria-hidden="true">
            <path
              className="fw-catlas-latest-outline"
              d={latestShape.d}
              fillRule="evenodd"
            />
          </g>
        )}
        {complete && (
          <g className="fw-catlas-finale" aria-hidden="true">
            {/* the flush, tilted so it reads as light raking across the
                land. The rotation lives on the wrapper because the CSS
                transform that slides the band would replace it. */}
            <g clipPath="url(#fw-catlas-land)">
              <g transform={`rotate(-14 ${COUNTY_VIEW.w / 2} ${COUNTY_VIEW.h / 2})`}>
                <rect
                  className="fw-catlas-flush"
                  x={-COUNTY_VIEW.w}
                  y={-COUNTY_VIEW.h * 0.3}
                  width={COUNTY_VIEW.w}
                  height={COUNTY_VIEW.h * 1.6}
                  fill="url(#fw-catlas-flush)"
                />
              </g>
            </g>
            {/* one ring of light leaving the coast as the loop closes */}
            <path className="fw-catlas-ripple" d={ENGLAND_COAST} />
            {/* the coastline itself, drawn on then held at a slow breath */}
            <path className="fw-catlas-coast" d={ENGLAND_COAST} pathLength={1} />
            <path className="fw-catlas-isles" d={ENGLAND_ISLES} />
          </g>
        )}
      </svg>
      {complete ? (
        // The figures, not the word "complete" — on /progress the ledger
        // beside this already says that, and two banners saying the same
        // thing next to each other reads as a mistake.
        <figcaption className="fw-catlas-done-badge">
          <span className="fw-catlas-tick" aria-hidden="true" />
          All {COUNTY_SHAPES.length} counties
          {courses != null && <b>{courses.toLocaleString("en-GB")} courses</b>}
        </figcaption>
      ) : (
        <figcaption className="fw-catlas-legend" aria-hidden="true">
          <span>
            <i data-kind="done" /> Mapped
          </span>
          {latestShape && (
            <span>
              <i data-kind="latest" /> Just added
            </span>
          )}
          <span>
            <i /> Still to come
          </span>
        </figcaption>
      )}
    </figure>
  );
}
