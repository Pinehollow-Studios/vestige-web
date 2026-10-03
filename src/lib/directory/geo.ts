/**
 * Placing courses on our own county map (src/data/counties.ts). The map was
 * projected by scripts/build-county-paths.mjs (git history, PR #77): a
 * Mercator-corrected equirectangular fit of Great Britain into a 400-wide
 * viewBox with 10 units of padding. These constants reproduce that fit, so a
 * course's coordinates land on the same drawing as the county outlines.
 *
 * Only points go on the map. Course outlines never do: anything drawn on a
 * static page can be copied, and the outlines are not ours to give away.
 */
import { COUNTY_SHAPES, COUNTY_VIEW, type CountyShape } from "../../data/counties";

const MIN_LNG = -8.65;
const MIN_LAT = 49.95953;
const MAX_LAT = 59.393;
const MAX_LNG = 1.75811;
const LNG_SCALE = Math.cos((((MIN_LAT + MAX_LAT) / 2) * Math.PI) / 180);
const SCALE = (COUNTY_VIEW.w - 20) / ((MAX_LNG - MIN_LNG) * LNG_SCALE);
const OFFSET_Y = (COUNTY_VIEW.h - (MAX_LAT - MIN_LAT) * SCALE) / 2;

export function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: 10 + (lng - MIN_LNG) * LNG_SCALE * SCALE,
    y: OFFSET_Y + (MAX_LAT - lat) * SCALE,
  };
}

/** The directory's county names, where they differ from the map's. */
const ALIASES: Record<string, string> = { Durham: "County Durham" };

export function countyShape(name: string): CountyShape | undefined {
  const wanted = ALIASES[name] ?? name;
  return COUNTY_SHAPES.find((s) => s.name === wanted);
}

export type Box = { x: number; y: number; w: number; h: number };

const boxes = new Map<string, Box>();

/** The bounding box of a county's outline, in map units. */
export function shapeBox(shape: CountyShape): Box {
  const hit = boxes.get(shape.name);
  if (hit) return hit;
  const nums = shape.d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    minX = Math.min(minX, nums[i]);
    maxX = Math.max(maxX, nums[i]);
    minY = Math.min(minY, nums[i + 1]);
    maxY = Math.max(maxY, nums[i + 1]);
  }
  const box = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  boxes.set(shape.name, box);
  return box;
}

/**
 * A view around a box at a fixed aspect ratio (w / h), with room to breathe,
 * never smaller than `min` units across.
 */
export function frame(box: Box, aspect: number, pad = 0.28, min = 34): Box {
  let w = Math.max(box.w * (1 + pad * 2), min);
  let h = Math.max(box.h * (1 + pad * 2), min / aspect);
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
