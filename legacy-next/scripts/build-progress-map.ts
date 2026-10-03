/**
 * Builds the coverage-map snapshot used in the progress-update email
 * (src/emails/update.tsx) into public/progress/atlas-current.png.
 *
 * It renders the SAME geometry and the SAME completed-counties list the
 * website's /progress map uses (src/components/progress/counties.ts +
 * countries.ts + src/lib/progressConfig.ts), so the email map can never
 * disagree with the site. Email clients don't render inline SVG reliably,
 * hence a PNG.
 *
 * Workflow each send: edit progressConfig (coursesMapped / completedCounties /
 * latestCounty), run `npm run build:map`, commit the regenerated PNG, deploy,
 * then send the broadcast.
 *
 *   npm run build:map
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { COUNTY_SHAPES, COUNTY_VIEW } from "../src/components/progress/counties.ts";
import { COUNTRY_SHAPES } from "../src/components/progress/countries.ts";
import {
  ENGLAND_COAST,
  ENGLAND_ISLES,
} from "../src/components/progress/englandOutline.ts";
import { progressConfig, isComplete, milestone } from "../src/lib/progressConfig.ts";
import { siteConfig } from "../src/lib/siteConfig.ts";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../public/progress/atlas-current.png");
// Retina width — displayed at 440px in the email, so ~2x keeps it crisp.
const RENDER_WIDTH = 880;

// Fail loudly on a typo, mirroring CountyAtlas's build-time guard.
const known = new Set(COUNTY_SHAPES.map((s) => s.name));
const unknown = progressConfig.completedCounties.filter((n) => !known.has(n));
if (unknown.length) {
  throw new Error(
    `progressConfig.completedCounties: unknown county ${unknown
      .map((n) => `"${n}"`)
      .join(", ")} — names must match counties.ts exactly.`
  );
}

const doneSet = new Set<string>(progressConfig.completedCounties);
const latest = progressConfig.latestCounty;

// Colours/strokes mirror globals.css (.fw-catlas-coming / .fw-catlas-base /
// .fw-catlas-done). The countries without regions yet sit underneath as one
// quiet shape each; no label, the email copy says what they are. Drawn a
// shade firmer than on the site — a 10% hairline does not survive an email
// client's recompression, and there is no hover title to fall back on.
const comingPaths = isComplete
  ? ""
  : COUNTRY_SHAPES.map(
      (s) =>
        `<path d="${s.d}" fill="rgba(246,244,238,0.05)" stroke="rgba(255,255,255,0.22)" stroke-width="0.8" stroke-linejoin="round" fill-rule="evenodd"/>`
    ).join("");
// A complete map has every county filled, so the base layer is pure overdraw —
// and its faint stroke would redraw the very borders the finished state drops.
const basePaths = isComplete
  ? ""
  : COUNTY_SHAPES.map(
      (s) =>
        `<path d="${s.d}" fill="rgba(246,244,238,0.04)" stroke="rgba(255,255,255,0.10)" stroke-width="0.6" stroke-linejoin="round" fill-rule="evenodd"/>`
    ).join("");

// Once every county is in, the seams come off — the same "47 pieces became one
// country" beat the website animates, held as a still.
const seam = isComplete
  ? ""
  : ` stroke="rgba(6,9,14,0.5)" stroke-width="0.7" stroke-linejoin="round"`;
const donePaths = COUNTY_SHAPES.filter((s) => doneSet.has(s.name))
  .map((s) => `<path d="${s.d}" fill="url(#mint)"${seam} fill-rule="evenodd"/>`)
  .join("");

const { w, h } = COUNTY_VIEW;

const spot = siteConfig.progress.spotlight;

// The most-recent county gets a soft light outline (the email's static stand-in
// for the website's pulsing "just added" beacon). Skipped when it's also the
// pinned county — the pin already marks it, and both together read as clutter,
// skipped while a finished country is the milestone (the website drops the
// beacon then too: the whole country is the news, not its last county), and
// skipped entirely once the map is complete: the coastline below is the
// beacon then, and singling out one county undercuts it.
const drawBeacon = !isComplete && !milestone && !(spot.enabled && spot.county === latest);
const latestShape = COUNTY_SHAPES.find((s) => s.name === latest && doneSet.has(s.name));
const latestOutline =
  latestShape && drawBeacon
    ? `<path d="${latestShape.d}" fill="none" stroke="#EAFBF5" stroke-width="1.3" stroke-linejoin="round" fill-rule="evenodd"/>`
    : "";

/**
 * The finished coastline, as the settled end-state of the website's draw-on.
 * The glow is three stacked strokes rather than an SVG filter — resvg's filter
 * support is patchy and email PNGs are not the place to find out which parts.
 */
const glowStack = (d: string, core: number) =>
  `<path d="${d}" fill="none" stroke="#5BE4C3" stroke-opacity="0.22" stroke-width="${
    core * 3.4
  }" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="#5BE4C3" stroke-opacity="0.42" stroke-width="${
    core * 1.8
  }" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="#EAFBF5" stroke-width="${core}" stroke-linejoin="round"/>`;

const coastline = isComplete
  ? glowStack(ENGLAND_COAST, 1.5) + glowStack(ENGLAND_ISLES, 1.1)
  : "";

// Optional standout-course pin — a played-course marker (§11 — a marker, not a
// county fill) that just marks where the course sits; the email names it in a
// highlight. A bright cream halo + mint core over a soft glow keeps it legible
// whether or not its county is filled mint.
let spotlight = "";
if (spot.enabled) {
  const spotShape = COUNTY_SHAPES.find((s) => s.name === spot.county);
  if (!spotShape) {
    throw new Error(
      `progress.spotlight.county "${spot.county}" is not a county in counties.ts — names must match exactly.`
    );
  }
  const px = spotShape.cx;
  const py = spotShape.cy;
  spotlight =
    `<circle cx="${px}" cy="${py}" r="16" fill="url(#pinGlow)"/>` +
    `<circle cx="${px}" cy="${py}" r="4.6" fill="#EAFBF5"/>` +
    `<circle cx="${px}" cy="${py}" r="2.8" fill="#5BE4C3"/>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="mint" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="${h}">
      <stop offset="0%" stop-color="#5BE4C3"/>
      <stop offset="100%" stop-color="#8FE85B"/>
    </linearGradient>
    <radialGradient id="halo" cx="64%" cy="66%" r="50%">
      <stop offset="0%" stop-color="#5BE4C3" stop-opacity="${isComplete ? 0.2 : 0.12}"/>
      <stop offset="70%" stop-color="#5BE4C3" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#EAFBF5" stop-opacity="0.5"/>
      <stop offset="45%" stop-color="#5BE4C3" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#5BE4C3" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#halo)"/>
  <g>${comingPaths}</g>
  <g>${basePaths}</g>
  <g>${donePaths}</g>
  ${coastline}
  ${latestOutline}
  ${spotlight}
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: RENDER_WIDTH },
  background: "rgba(0,0,0,0)", // transparent — sits on the email's dark card
});
const png = resvg.render().asPng();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, png);

const done = progressConfig.completedCounties.length;
const pinNote = spot.enabled ? `, pin: ${spot.name} (${spot.county})` : "";
const stateNote = isComplete
  ? ", complete (seams off, coastline drawn)"
  : latest
    ? ` (latest: ${latest})`
    : "";
console.log(
  `Wrote ${OUT}\n  ${done} counties filled${stateNote}${pinNote}, ${png.length} bytes`
);
