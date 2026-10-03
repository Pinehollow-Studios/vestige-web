// One-off generator for the England coastline used by the /progress map's
// "England complete" finale (src/components/progress/englandOutline.ts).
//
// Third in the family: build-britain-path.mjs makes the little 200x140
// silhouette for the marketing motifs, build-county-paths.mjs makes the 47
// fillable county shapes (plus Wales and Scotland as single shapes), and
// this makes the single outline that wraps the English counties — the map
// covers Great Britain now, but the finale that draws this coastline runs
// only when England is the whole of what's finished, or for the record of
// it. Same projection as counties.ts, read from the file.
//
// The outline HAS to sit exactly on top of the county shapes — a coastline
// half a pixel adrift from the fill it traces looks broken — so it is derived
// from the checked-in counties.ts rather than re-projected from GeoJSON.
// Re-running build-county-paths.mjs means re-running this too.
//
// Method: rasterise all 47 counties into one mask, morphologically close it
// (adjacent counties were simplified independently, so shared borders leave
// hairline slivers), trace the mask boundary as unit edges, chain those into
// loops, drop the holes and specks, then smooth and simplify. Marching the
// pixel grid rather than unioning polygons keeps this dependency-free and
// immune to the near-degenerate geometry real coastlines are full of.
//
// Run with:
//   node scripts/build-england-outline.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const IN = path.join(ROOT, "src", "components", "progress", "counties.ts");
const OUT = path.join(ROOT, "src", "components", "progress", "englandOutline.ts");

/** Raster samples per user unit. 4 puts the trace within a quarter-unit. */
const SS = 4;
/** Closing radius in samples — shuts sliver gaps up to 2*CLOSE/SS units wide. */
const CLOSE = 3;
/** Loops smaller than this (user units²) are rasterisation specks. */
const MIN_LOOP_AREA = 2.5;
/** Douglas–Peucker tolerance, user units. Matches the county tolerance. */
const TOLERANCE = 0.4;
/** Chaikin passes — rounds the staircase the raster trace leaves behind. */
const SMOOTH_PASSES = 3;

// ── Read the generated county module ────────────────────────────────────────

const src = fs.readFileSync(IN, "utf8");

const view = src.match(/COUNTY_VIEW = \{ w: (\d+), h: (\d+) \}/);
if (!view) throw new Error("could not find COUNTY_VIEW in counties.ts");
const VIEW_W = +view[1];
const VIEW_H = +view[2];

const dAttrs = [...src.matchAll(/^\s*d: "([^"]+)"/gm)].map((m) => m[1]);
if (dAttrs.length !== 47) {
  throw new Error(`expected 47 county paths in counties.ts, found ${dAttrs.length}`);
}

/**
 * The generated paths are strictly "M x y L x y ... Z" subpaths, so a
 * tokenising parser is overkill — pull the numbers per subpath.
 */
function parseRings(d) {
  return d
    .split("Z")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((sub) => {
      const nums = sub.match(/-?\d+(?:\.\d+)?/g) || [];
      const ring = [];
      for (let i = 0; i + 1 < nums.length; i += 2) ring.push([+nums[i], +nums[i + 1]]);
      return ring;
    })
    .filter((r) => r.length >= 3);
}

const rings = dAttrs.flatMap(parseRings);
process.stderr.write(`${dAttrs.length} counties, ${rings.length} rings\n`);

// ── Rasterise the union ─────────────────────────────────────────────────────
// Every ring is filled solid. A county's holes (West Midlands inside
// Warwickshire's span) are filled by the county that sits in them, so the
// union of solid rings is exactly England's footprint.

const GW = VIEW_W * SS;
const GH = VIEW_H * SS;
let mask = new Uint8Array(GW * GH);

/** Even-odd scanline fill of one simple ring, sampled at pixel centres. */
function fillRing(ring, target) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of ring) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const y0 = Math.max(0, Math.floor(minY * SS));
  const y1 = Math.min(GH - 1, Math.ceil(maxY * SS));
  const xs = [];
  for (let gy = y0; gy <= y1; gy++) {
    const sy = (gy + 0.5) / SS;
    xs.length = 0;
    for (let i = 0; i < ring.length; i++) {
      const [ax, ay] = ring[i];
      const [bx, by] = ring[(i + 1) % ring.length];
      // Half-open in y so shared vertices count exactly once.
      if (ay <= sy ? by > sy : by <= sy) {
        xs.push(ax + ((sy - ay) / (by - ay)) * (bx - ax));
      }
    }
    if (xs.length < 2) continue;
    xs.sort((a, b) => a - b);
    const row = gy * GW;
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const gx0 = Math.max(0, Math.ceil(xs[k] * SS - 0.5));
      const gx1 = Math.min(GW - 1, Math.floor(xs[k + 1] * SS - 0.5));
      for (let gx = gx0; gx <= gx1; gx++) target[row + gx] = 1;
    }
  }
}

for (const ring of rings) fillRing(ring, mask);
process.stderr.write(`raster ${GW}x${GH}, ${mask.reduce((a, b) => a + b, 0)} cells set\n`);

// ── Morphological close ─────────────────────────────────────────────────────
// Adjacent counties were Douglas–Peucker'd independently, so their shared
// borders disagree by up to a tolerance either side. Dilating then eroding
// welds those hairlines shut without moving the coastline.

function morph(input, grow) {
  const out = new Uint8Array(input.length);
  for (let y = 0; y < GH; y++) {
    const row = y * GW;
    for (let x = 0; x < GW; x++) {
      const i = row + x;
      const self = input[i];
      // Dilate: set if any 4-neighbour is set. Erode: clear if any is clear.
      // Out-of-bounds counts as background either way, which keeps the
      // erode from eating the (unused) grid edge.
      const n =
        (y > 0 ? input[i - GW] : 0) &
        (y < GH - 1 ? input[i + GW] : 0) &
        (x > 0 ? input[i - 1] : 0) &
        (x < GW - 1 ? input[i + 1] : 0);
      const anyN =
        (y > 0 ? input[i - GW] : 0) |
        (y < GH - 1 ? input[i + GW] : 0) |
        (x > 0 ? input[i - 1] : 0) |
        (x < GW - 1 ? input[i + 1] : 0);
      out[i] = grow ? self | anyN : self & n;
    }
  }
  return out;
}

for (let i = 0; i < CLOSE; i++) mask = morph(mask, true);
for (let i = 0; i < CLOSE; i++) mask = morph(mask, false);

// ── Trace the boundary ──────────────────────────────────────────────────────
// Each filled cell contributes the edges it shares with empty space, wound
// clockwise around the cell. Head-to-tail those directed edges chain into
// closed loops: clockwise for outlines, anticlockwise for holes.

const edges = new Map(); // start vertex key -> array of end vertex keys
const vkey = (x, y) => y * (GW + 1) + x;

function addEdge(ax, ay, bx, by) {
  const k = vkey(ax, ay);
  const list = edges.get(k);
  if (list) list.push(vkey(bx, by));
  else edges.set(k, [vkey(bx, by)]);
}

for (let y = 0; y < GH; y++) {
  const row = y * GW;
  for (let x = 0; x < GW; x++) {
    if (!mask[row + x]) continue;
    if (y === 0 || !mask[row - GW + x]) addEdge(x, y, x + 1, y);
    if (x === GW - 1 || !mask[row + x + 1]) addEdge(x + 1, y, x + 1, y + 1);
    if (y === GH - 1 || !mask[row + GW + x]) addEdge(x + 1, y + 1, x, y + 1);
    if (x === 0 || !mask[row + x - 1]) addEdge(x, y + 1, x, y);
  }
}

const loops = [];
for (const [start] of edges) {
  let list = edges.get(start);
  while (list && list.length) {
    const loop = [start];
    let cur = start;
    for (;;) {
      const outs = edges.get(cur);
      if (!outs || !outs.length) break;
      // At a diagonal pinch a vertex has two ways out; either closes a
      // valid loop, so take whichever is left.
      const next = outs.pop();
      if (!outs.length) edges.delete(cur);
      if (next === start) break;
      loop.push(next);
      cur = next;
    }
    if (loop.length >= 4) loops.push(loop);
    list = edges.get(start);
  }
}

/** Signed area (user units²) — sign tells outline from hole. */
function signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

let polys = loops.map((loop) =>
  loop.map((k) => [(k % (GW + 1)) / SS, Math.floor(k / (GW + 1)) / SS])
);

// Keep only loops wound the same way as the biggest one: that drops holes,
// including any sliver the close didn't reach.
polys = polys.map((p) => ({ pts: p, area: signedArea(p) }));
polys.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
if (!polys.length) throw new Error("traced no loops — the mask is empty");
const outerSign = Math.sign(polys[0].area);
polys = polys.filter(
  (p) => Math.sign(p.area) === outerSign && Math.abs(p.area) >= MIN_LOOP_AREA
);
process.stderr.write(
  `${loops.length} loops traced, ${polys.length} kept (largest ${Math.abs(
    polys[0].area
  ).toFixed(0)} units²)\n`
);

// ── Smooth, simplify ────────────────────────────────────────────────────────

/** Chaikin corner-cutting on a closed ring. */
function chaikin(pts) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    out.push([ax + (bx - ax) * 0.25, ay + (by - ay) * 0.25]);
    out.push([ax + (bx - ax) * 0.75, ay + (by - ay) * 0.75]);
  }
  return out;
}

function segDist(p, a, b) {
  let [x, y] = a;
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) [x, y] = b;
    else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  return Math.hypot(p[0] - x, p[1] - y);
}

function dpMark(pts, first, last, tol, keep) {
  const stack = [[first, last]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let maxD = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = segDist(pts[i], pts[a], pts[b]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
}

/** Douglas–Peucker over a closed ring, anchored on its two extremes. */
function simplify(pts, tol) {
  const n = pts.length;
  if (n <= 8) return pts;
  let far = 1;
  let maxD = -1;
  for (let i = 1; i < n; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
    if (d > maxD) {
      maxD = d;
      far = i;
    }
  }
  const keep = new Uint8Array(n);
  keep[0] = keep[far] = keep[n - 1] = 1;
  dpMark(pts, 0, far, tol, keep);
  dpMark(pts, far, n - 1, tol, keep);
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(pts[i]);
  return out;
}

function toPath(pts) {
  const rounded = [];
  let prev = "";
  for (const [x, y] of pts) {
    const s = `${x.toFixed(1)} ${y.toFixed(1)}`;
    if (s !== prev) {
      rounded.push(s);
      prev = s;
    }
  }
  return `M ${rounded[0]} L ${rounded.slice(1).join(" L ")} Z`;
}

const finished = polys.map((p) => {
  let pts = p.pts;
  for (let i = 0; i < SMOOTH_PASSES; i++) pts = chaikin(pts);
  return simplify(pts, TOLERANCE);
});

const mainland = finished[0];
const isles = finished.slice(1);
const totalPts = finished.reduce((a, p) => a + p.length, 0);
process.stderr.write(
  `mainland ${mainland.length} pts, ${isles.length} isles, ${totalPts} pts total\n`
);

// ── Emit ────────────────────────────────────────────────────────────────────

const ts = `/**
 * England's coastline as a single stroked outline, in the same 400x490
 * projection as counties.ts so it lands exactly on top of the county fills.
 *
 * GENERATED by scripts/build-england-outline.mjs — do not hand-edit. It reads
 * counties.ts and traces the union of all 47 shapes, so regenerate it whenever
 * build-county-paths.mjs runs.
 *
 * Mainland and isles are separate strings on purpose: stroke dashing restarts
 * at every subpath, so the draw-on that races round the coast needs the
 * mainland alone in its own <path>.
 */

/** The mainland coast — one closed ring, drawn clockwise from the north. */
export const ENGLAND_COAST = ${JSON.stringify(toPath(mainland))};

/** Everything offshore that survives at this scale (the Isle of Wight, etc.). */
export const ENGLAND_ISLES = ${JSON.stringify(isles.map(toPath).join(" "))};
`;

fs.writeFileSync(OUT, ts);
process.stderr.write(
  `wrote ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)\n`
);
