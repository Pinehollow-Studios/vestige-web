// One-off generator for the SVG geometry behind the /progress map:
//
//   src/components/progress/counties.ts   the 47 ceremonial counties of
//                                         England, each individually fillable
//   src/components/progress/countries.ts  Wales and Scotland as single
//                                         country shapes, drawn "still to come"
//
// Both files share one projection, computed here over the whole of Great
// Britain, so the two layers land exactly on top of each other. The little
// 200x140 silhouette for the marketing motifs is a separate script
// (build-britain-path.mjs) with its own projection.
//
// Sources:
//   Counties — evansd/uk-ceremonial-counties: ONS Parliamentary Ward
//   boundaries (Open Government Licence) dissolved into ceremonial counties.
//   City of London is folded into Greater London at the ward level, which is
//   exactly the 47-county model the whole site uses.
//   Countries — scripts/data/countries-source.json, a copy of the iOS app's
//   bundled coming-soon-countries.json (vestige-ios/Vestige/Resources). Jack's
//   pipeline dissolves the same evansd dataset into one MultiPolygon per
//   country, so its borders sit flush against the English counties. When the
//   app's copy is regenerated, copy it over and re-run this.
//
// Scotland's regions are deliberately NOT drawn — the region model for
// Scotland and Wales is decided when their courses are mapped (Jack's call,
// later). Until then each is one shape. Shetland is left off the map: it
// sits so far north it would add a third to the map's height for a few
// specks, and the course count carries it regardless.
//
// Run with:
//   node scripts/build-county-paths.mjs
//   node scripts/build-england-outline.mjs   # always re-run after this one
//
// First run fetches the 10MB county source, filters it to the 47 English
// counties, simplifies the geometry, and caches the result as
// scripts/data/counties.json (checked in, ~hundreds of KB). Later runs read
// the cache, so re-projection tweaks work offline. Delete the cache to
// re-simplify after changing the projection.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CACHE = path.join(ROOT, "scripts", "data", "counties.json");
const COUNTRIES_SRC = path.join(ROOT, "scripts", "data", "countries-source.json");
const OUT = path.join(ROOT, "src", "components", "progress", "counties.ts");
const OUT_COUNTRIES = path.join(ROOT, "src", "components", "progress", "countries.ts");

const SOURCE_URL =
  "https://raw.githubusercontent.com/evansd/uk-ceremonial-counties/master/uk-ceremonial-counties.geojson";

// Portrait viewBox — the width is fixed and the height follows the
// Mercator-corrected shape of Britain, so the map is framed tight with
// PADDING user units of margin all round. (England alone was 400x490; with
// Wales and Scotland the same width runs to ~620 tall.)
const VIEW_W = 400;
const PADDING = 10;

// Douglas–Peucker tolerance in projected px, and the floor below which
// offshore ring fragments are dropped entirely.
const TOLERANCE_PX = 0.4;
const MIN_RING_AREA_PX = 2.5;

// Pieces of Scotland whose southern edge is north of this are Shetland.
const SHETLAND_MIN_LAT = 59.45;

// The 47 ceremonial counties of England as the dataset names them
// (it says "Durham"; everything else matches the names used in
// src/lib/progressConfig.ts verbatim).
const ENGLISH_COUNTIES = [
  "Bedfordshire", "Berkshire", "Bristol", "Buckinghamshire",
  "Cambridgeshire", "Cheshire", "Cornwall", "Cumbria", "Derbyshire",
  "Devon", "Dorset", "Durham", "East Riding of Yorkshire", "East Sussex",
  "Essex", "Gloucestershire", "Greater London", "Greater Manchester",
  "Hampshire", "Herefordshire", "Hertfordshire", "Isle of Wight", "Kent",
  "Lancashire", "Leicestershire", "Lincolnshire", "Merseyside", "Norfolk",
  "North Yorkshire", "Northamptonshire", "Northumberland",
  "Nottinghamshire", "Oxfordshire", "Rutland", "Shropshire", "Somerset",
  "South Yorkshire", "Staffordshire", "Suffolk", "Surrey",
  "Tyne and Wear", "Warwickshire", "West Midlands", "West Sussex",
  "West Yorkshire", "Wiltshire", "Worcestershire",
];

// Display names where the dataset's label isn't the common one.
const RENAME = { Durham: "County Durham" };

// The countries still to come, in the order they're listed on the site.
// Label anchors are hand-picked like the iOS app's (the centroid of a
// many-piece MultiPolygon lands in the sea): the central Highlands, and for
// Wales a touch west of the app's central-Powys point so the two-line label
// clears the English border at this map's size.
const COUNTRIES = [
  { name: "Wales", label: [-4.02, 52.24] },
  { name: "Scotland", label: [-4.18, 56.82] },
];

async function loadCounties() {
  if (fs.existsSync(CACHE)) {
    process.stderr.write(`using cached ${path.relative(ROOT, CACHE)}\n`);
    return JSON.parse(fs.readFileSync(CACHE, "utf8"));
  }

  process.stderr.write(`fetching ${SOURCE_URL}\n`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching source`);
  const data = await res.json();

  const wanted = new Set(ENGLISH_COUNTIES);
  const features = (data.features || []).filter((f) =>
    wanted.has(f.properties?.county)
  );
  if (features.length !== ENGLISH_COUNTIES.length) {
    const got = new Set(features.map((f) => f.properties.county));
    const missing = ENGLISH_COUNTIES.filter((n) => !got.has(n));
    throw new Error(`expected 47 counties, got ${features.length}; missing: ${missing}`);
  }

  // Simplification happens against the projection, so it lives in
  // main(); here we only filter + rename. The cache is written after
  // simplification so the checked-in file stays small.
  return {
    type: "FeatureCollection",
    features: features.map((f) => ({
      type: "Feature",
      properties: { name: RENAME[f.properties.county] || f.properties.county },
      geometry: f.geometry,
    })),
    __raw: true, // marks an unsimplified, freshly fetched collection
  };
}

/** Wales and Scotland from the app's bundle, Shetland dropped. */
function loadCountries() {
  const data = JSON.parse(fs.readFileSync(COUNTRIES_SRC, "utf8"));
  return COUNTRIES.map(({ name, label }) => {
    const f = (data.features || []).find((x) => x.properties?.name === name);
    if (!f) throw new Error(`${name} not found in ${path.relative(ROOT, COUNTRIES_SRC)}`);
    const polys =
      f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    const kept = polys.filter(
      (poly) => Math.min(...poly[0].map(([, lat]) => lat)) < SHETLAND_MIN_LAT
    );
    process.stderr.write(`${name}: ${polys.length} pieces, ${kept.length} kept\n`);
    return {
      type: "Feature",
      properties: { name, label },
      geometry: { type: "MultiPolygon", coordinates: kept },
    };
  });
}

/** Shoelace area of a projected ring (px²). */
function ringArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}

/** Perpendicular distance from p to segment a–b. */
function segDist(p, a, b) {
  let [x, y] = a;
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return Math.hypot(dx, dy);
}

/**
 * Douglas–Peucker over an open run of points (iterative — ward-dissolved
 * coastline rings run to tens of thousands of points). Marks kept
 * indices in `keep`.
 */
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

/** Simplify a closed ring (no duplicate end point); returns kept indices. */
function simplifyRing(pts, tol) {
  const n = pts.length;
  if (n <= 6) return pts.map((_, i) => i);
  // Anchor on point 0 and the point farthest from it, then simplify the
  // two halves — keeps the ring from collapsing across its widest span.
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
  for (let i = 0; i < n; i++) if (keep[i]) out.push(i);
  return out;
}

/** Every [lng, lat] in a feature's outer rings, for the bounding box. */
function* outerPoints(f) {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) yield* poly[0];
}

/**
 * Project, simplify (when `raw`) and stringify one feature. Returns the
 * SVG path, the centroid of the largest ring's points, the summed area
 * of the kept outer rings, and the kept lng/lat rings for the cache.
 */
function buildShape(f, project, raw) {
  const name = f.properties.name;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const subpaths = [];
  const keptPolys = [];
  let best = null;
  let area = 0;
  let points = 0;

  for (const poly of polys) {
    const keptRings = [];
    for (let r = 0; r < poly.length; r++) {
      // drop the GeoJSON closing duplicate before simplifying
      let ring = poly[r];
      if (
        ring.length > 1 &&
        ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1]
      ) {
        ring = ring.slice(0, -1);
      }
      const px = ring.map(project);
      const kept = raw ? simplifyRing(px, TOLERANCE_PX) : px.map((_, i) => i);
      const simple = kept.map((i) => px[i]);
      const a = ringArea(simple);
      if (a < MIN_RING_AREA_PX) {
        if (r === 0) break; // outer ring too small — skip the polygon
        continue; // hole too small — skip just the hole
      }
      if (r === 0) {
        area += a;
        if (!best || a > best.area) best = { area: a, px: simple };
      }
      keptRings.push({ px: simple, lngLat: kept.map((i) => ring[i]) });
    }
    if (!keptRings.length) continue;
    keptPolys.push(keptRings.map((k) => [...k.lngLat, k.lngLat[0]]));
    for (const { px } of keptRings) {
      // dedupe consecutive points that collapse at 1dp rounding
      const rounded = [];
      let prev = "";
      for (const [x, y] of px) {
        const pt = `${x.toFixed(1)} ${y.toFixed(1)}`;
        if (pt !== prev) {
          rounded.push(pt);
          prev = pt;
        }
      }
      if (rounded.length < 3) continue;
      subpaths.push(`M ${rounded[0]} L ${rounded.slice(1).join(" L ")} Z`);
      points += rounded.length;
    }
  }

  if (!subpaths.length) throw new Error(`no usable rings for ${name}`);
  let cx = 0, cy = 0;
  for (const [x, y] of best.px) {
    cx += x;
    cy += y;
  }
  return {
    name,
    d: subpaths.join(" "),
    cx: +(cx / best.px.length).toFixed(1),
    cy: +(cy / best.px.length).toFixed(1),
    area,
    points,
    keptPolys,
  };
}

async function main() {
  const collection = await loadCounties();
  const countries = loadCountries();

  // ── Projection (Mercator-corrected, like the marketing silhouette in
  //    build-britain-path.mjs) over the combined bbox of every feature ──
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const f of [...collection.features, ...countries]) {
    for (const [lng, lat] of outerPoints(f)) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  const meanLat = (minLat + maxLat) / 2;
  const lngScale = Math.cos((meanLat * Math.PI) / 180);
  const effLngRange = (maxLng - minLng) * lngScale;
  const effLatRange = maxLat - minLat;
  const scale = (VIEW_W - PADDING * 2) / effLngRange;
  const VIEW_H = Math.ceil(effLatRange * scale + PADDING * 2);
  const offsetX = PADDING;
  const offsetY = (VIEW_H - effLatRange * scale) / 2;
  const project = ([lng, lat]) => [
    offsetX + (lng - minLng) * lngScale * scale,
    offsetY + (maxLat - lat) * scale,
  ];
  process.stderr.write(
    `bbox lng [${minLng.toFixed(2)}, ${maxLng.toFixed(2)}] lat [${minLat.toFixed(2)}, ${maxLat.toFixed(2)}] → viewBox ${VIEW_W}x${VIEW_H}\n`
  );

  // ── Counties ──────────────────────────────────────────────────────
  const shapes = [];
  const cachedFeatures = [];
  let totalPts = 0;
  // Area-weighted centroid of England, for the CSS halo behind the map.
  let ex = 0, ey = 0, ea = 0;
  for (const f of collection.features) {
    const s = buildShape(f, project, collection.__raw);
    shapes.push(s);
    totalPts += s.points;
    ex += s.cx * s.area;
    ey += s.cy * s.area;
    ea += s.area;
    cachedFeatures.push({
      type: "Feature",
      properties: { name: s.name },
      geometry:
        s.keptPolys.length === 1
          ? { type: "Polygon", coordinates: s.keptPolys[0] }
          : { type: "MultiPolygon", coordinates: s.keptPolys },
    });
  }
  shapes.sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
  process.stderr.write(`${shapes.length} counties, ${totalPts} points total\n`);
  process.stderr.write(
    `England centroid ≈ ${((ex / ea / VIEW_W) * 100).toFixed(0)}% across, ${((ey / ea / VIEW_H) * 100).toFixed(0)}% down (for the .fw-catlas halo in globals.css)\n`
  );

  // ── Countries ─────────────────────────────────────────────────────
  const countryShapes = countries.map((f) => {
    const s = buildShape(f, project, true);
    const [lx, ly] = project(f.properties.label);
    process.stderr.write(`${s.name}: ${s.points} points\n`);
    return { name: s.name, d: s.d, lx: +lx.toFixed(1), ly: +ly.toFixed(1) };
  });

  // ── Write the simplified cache (first run only) ────────────────────
  if (collection.__raw) {
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    const cache = {
      type: "FeatureCollection",
      features: cachedFeatures.map((f) => ({
        ...f,
        geometry: {
          ...f.geometry,
          coordinates:
            f.geometry.type === "Polygon"
              ? f.geometry.coordinates.map((ring) => ring.map(([a, b]) => [+a.toFixed(5), +b.toFixed(5)]))
              : f.geometry.coordinates.map((poly) => poly.map((ring) => ring.map(([a, b]) => [+a.toFixed(5), +b.toFixed(5)]))),
        },
      })),
    };
    fs.writeFileSync(CACHE, JSON.stringify(cache));
    process.stderr.write(
      `wrote ${path.relative(ROOT, CACHE)} (${(fs.statSync(CACHE).size / 1024).toFixed(0)} KB)\n`
    );
  }

  // ── Emit the TypeScript modules ────────────────────────────────────
  const lines = shapes.map(
    (s) =>
      `  { name: ${JSON.stringify(s.name)}, cx: ${s.cx}, cy: ${s.cy},\n    d: ${JSON.stringify(s.d)} },`
  );
  const ts = `/**
 * The 47 ceremonial counties of England as individually fillable SVG
 * paths, for the /progress page map. City of London is part of the
 * Greater London shape (the 47-county model).
 *
 * GENERATED by scripts/build-county-paths.mjs — do not hand-edit.
 * Geometry: ONS ward boundaries (OGL) dissolved into ceremonial
 * counties (evansd/uk-ceremonial-counties), simplified and projected
 * Mercator-corrected into a viewBox framed on the whole of Great
 * Britain, so it shares a coordinate space with countries.ts (Wales and
 * Scotland) and englandOutline.ts. Render with fillRule="evenodd" (some
 * counties carry holes — e.g. West Midlands inside Warwickshire's span).
 */

export type CountyShape = {
  name: string;
  /** Projected centroid of the largest part — handy for ordering/labels. */
  cx: number;
  cy: number;
  d: string;
};

export const COUNTY_VIEW = { w: ${VIEW_W}, h: ${VIEW_H} } as const;

export const COUNTY_SHAPES: ReadonlyArray<CountyShape> = [
${lines.join("\n")}
];
`;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, ts);
  process.stderr.write(
    `wrote ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)\n`
  );

  const countryLines = countryShapes.map(
    (s) =>
      `  { name: ${JSON.stringify(s.name)}, lx: ${s.lx}, ly: ${s.ly},\n    d: ${JSON.stringify(s.d)} },`
  );
  const tsCountries = `/**
 * Wales and Scotland as single country shapes, for the /progress map's
 * "still to come" layer. Same projection and viewBox as counties.ts, so
 * they sit flush against the English counties.
 *
 * GENERATED by scripts/build-county-paths.mjs — do not hand-edit.
 * Geometry: the iOS app's bundled coming-soon-countries.json (Jack's
 * dissolve of the same evansd/uk-ceremonial-counties source), copied to
 * scripts/data/countries-source.json. Shetland is left off. Render with
 * fillRule="evenodd".
 *
 * These are placeholders: neither country has regions here yet. When
 * Scotland or Wales is mapped, its regions join counties.ts (in whatever
 * model Jack settles on) and the country comes out of this file.
 */

export type CountryShape = {
  name: string;
  /** Where the "still to come" label sits — hand-picked, on land. */
  lx: number;
  ly: number;
  d: string;
};

export const COUNTRY_SHAPES: ReadonlyArray<CountryShape> = [
${countryLines.join("\n")}
];
`;
  fs.writeFileSync(OUT_COUNTRIES, tsCountries);
  process.stderr.write(
    `wrote ${path.relative(ROOT, OUT_COUNTRIES)} (${(fs.statSync(OUT_COUNTRIES).size / 1024).toFixed(0)} KB)\n`
  );
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err.message || err}\n`);
  process.exit(1);
});
