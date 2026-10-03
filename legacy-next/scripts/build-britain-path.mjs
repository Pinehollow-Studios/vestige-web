// One-off generator for the Great Britain SVG silhouette used by the
// marketing motifs (src/components/marketing/britain.ts): the "atlas"
// feature card and the fixed AtlasMini scroll companion. Successor to the
// England-only build-england-path.mjs.
//
// Source: Natural Earth 1:50m admin_0_countries. The United Kingdom feature
// is a MultiPolygon; its largest polygon is the mainland of Great Britain,
// which is all the little 200x140 box can hold — the islands (Anglesey,
// Skye, the Hebrides, Orkney, Shetland) are dropped, as the Isle of Wight
// was from the England silhouette before it.
//
// The course pins are real courses, given here as lat/lng and projected
// through the same transform as the coastline, so they always sit where the
// course is however the frame changes.
//
// Run with:
//   node scripts/build-britain-path.mjs
//   NE_SOURCE=/path/to/ne_50m_admin_0_countries.geojson node scripts/build-britain-path.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "src", "components", "marketing", "britain.ts");

const VIEW_W = 200;
const VIEW_H = 140;
const PADDING = 8;
// Douglas–Peucker tolerance in viewBox units. 0.55 lands the mainland at
// ~150 points — enough for the Wash, the Solway and the firths to read at
// 138px wide, few enough that the dash draw-on stays cheap.
const TOLERANCE = 0.55;

const SOURCES = [
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson",
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_countries.json",
];

// Pins: the marquee's courses and a spread that covers the country. `bright`
// picks the ones that glow — alternate so the glow is scattered. Order is
// the order the AtlasMini pins light up in as the page scrolls, roughly
// south to north.
const PINS = [
  { name: "St Enodoc (Cornwall)", lat: 50.552, lng: -4.921, bright: true },
  { name: "Saunton (Devon)", lat: 51.113, lng: -4.212, bright: false },
  { name: "Royal St George's (Kent)", lat: 51.279, lng: 1.371, bright: true },
  { name: "Walton Heath (Surrey)", lat: 51.271, lng: -0.244, bright: false },
  { name: "Burnham & Berrow (Somerset)", lat: 51.262, lng: -3.005, bright: false },
  { name: "Sunningdale (Berkshire)", lat: 51.392, lng: -0.630, bright: true },
  { name: "Royal Porthcawl (Wales)", lat: 51.481, lng: -3.719, bright: true },
  { name: "Royal St David's (Wales)", lat: 52.858, lng: -4.113, bright: false },
  { name: "Royal Norwich (Norfolk)", lat: 52.682, lng: 1.238, bright: false },
  { name: "Notts, Hollinwell (Notts)", lat: 53.083, lng: -1.217, bright: true },
  { name: "Woodhall Spa (Lincolnshire)", lat: 53.151, lng: -0.214, bright: false },
  { name: "Royal Liverpool (Merseyside)", lat: 53.384, lng: -3.190, bright: false },
  { name: "Royal Birkdale (Merseyside)", lat: 53.622, lng: -3.031, bright: true },
  { name: "Alwoodley (West Yorkshire)", lat: 53.871, lng: -1.550, bright: false },
  { name: "Ganton (North Yorkshire)", lat: 54.189, lng: -0.492, bright: true },
  { name: "Turnberry (Scotland)", lat: 55.314, lng: -4.836, bright: false },
  { name: "Royal Troon (Scotland)", lat: 55.528, lng: -4.664, bright: true },
  { name: "Muirfield (Scotland)", lat: 56.043, lng: -2.833, bright: false },
  { name: "St Andrews (Scotland)", lat: 56.343, lng: -2.804, bright: true },
  { name: "Carnoustie (Scotland)", lat: 56.497, lng: -2.716, bright: false },
  { name: "Royal Aberdeen (Scotland)", lat: 57.187, lng: -2.090, bright: false },
  { name: "Royal Dornoch (Scotland)", lat: 57.881, lng: -4.031, bright: true },
];

async function loadMainland() {
  let data = null;
  if (process.env.NE_SOURCE) {
    process.stderr.write(`reading ${process.env.NE_SOURCE}\n`);
    data = JSON.parse(fs.readFileSync(process.env.NE_SOURCE, "utf8"));
  } else {
    for (const url of SOURCES) {
      process.stderr.write(`fetching ${url}\n`);
      const res = await fetch(url);
      if (!res.ok) continue;
      data = await res.json();
      break;
    }
  }
  if (!data) throw new Error("no source could be fetched");
  const uk = data.features.find(
    (f) => f.properties?.ADMIN === "United Kingdom" || f.properties?.NAME === "United Kingdom"
  );
  if (!uk) throw new Error("United Kingdom not found in source");
  const polys =
    uk.geometry.type === "Polygon" ? [uk.geometry.coordinates] : uk.geometry.coordinates;
  let best = null;
  let bestArea = -1;
  for (const poly of polys) {
    const a = Math.abs(shoelace(poly[0]));
    if (a > bestArea) {
      bestArea = a;
      best = poly[0];
    }
  }
  process.stderr.write(`${polys.length} polygons; mainland ring ${best.length} points\n`);
  return best;
}

function shoelace(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

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

/** Douglas–Peucker on a closed ring, anchored across its widest span. */
function simplifyRing(pts, tol) {
  const n = pts.length;
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

async function main() {
  let ring = await loadMainland();
  if (
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
  ) {
    ring = ring.slice(0, -1);
  }

  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  process.stderr.write(
    `bbox lng [${minLng.toFixed(2)}, ${maxLng.toFixed(2)}] lat [${minLat.toFixed(2)}, ${maxLat.toFixed(2)}]\n`
  );

  // Mercator latitude correction so the silhouette isn't horizontally squashed.
  const meanLat = (minLat + maxLat) / 2;
  const lngScale = Math.cos((meanLat * Math.PI) / 180);
  const effLngRange = (maxLng - minLng) * lngScale;
  const effLatRange = maxLat - minLat;
  const scale = Math.min(
    (VIEW_W - PADDING * 2) / effLngRange,
    (VIEW_H - PADDING * 2) / effLatRange
  );
  const offsetX = (VIEW_W - effLngRange * scale) / 2;
  const offsetY = (VIEW_H - effLatRange * scale) / 2;
  const project = (lng, lat) => [
    offsetX + (lng - minLng) * lngScale * scale,
    offsetY + (maxLat - lat) * scale,
  ];

  const px = ring.map(([lng, lat]) => project(lng, lat));
  const simple = simplifyRing(px, TOLERANCE);
  process.stderr.write(`simplified ${px.length} → ${simple.length} points\n`);

  const d =
    simple.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") +
    " Z";

  const pins = PINS.map((p) => {
    const [x, y] = project(p.lng, p.lat);
    return `  { x: ${x.toFixed(1)}, y: ${y.toFixed(1)}, bright: ${p.bright} }, // ${p.name}`;
  });

  const ts = `/**
 * Great Britain silhouette — the mainland only — derived from Natural Earth
 * 1:50m admin_0_countries (nvkelso/natural-earth-vector), Mercator-corrected
 * into the 200×140 viewBox and Douglas–Peucker simplified to ${simple.length}
 * points.
 *
 * GENERATED by scripts/build-britain-path.mjs — do not hand-edit.
 *
 * Shared by the "atlas" feature-card motif and the fixed AtlasMini HUD.
 */
export const BRITAIN_PATH =
  ${JSON.stringify(d)};

/**
 * Course pins in the silhouette's coordinate space: real courses, projected
 * from their lat/lng by the same transform as the coastline. \`bright\` pins
 * glow; the order is the order they light up as the page scrolls.
 */
export const COURSE_PINS = [
${pins.join("\n")}
] as const;
`;
  fs.writeFileSync(OUT, ts);
  process.stderr.write(`wrote ${path.relative(ROOT, OUT)}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err.message || err}\n`);
  process.exit(1);
});
