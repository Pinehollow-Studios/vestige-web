/**
 * Pure presentation helpers for the course directory - labels, numbers,
 * distances and sort orders. No data access, so they're safe anywhere.
 * House voice: sentence case, British English, spaced hyphens, never an
 * em dash.
 */

import type { CourseSummary } from "./types";

const numberFormat = new Intl.NumberFormat("en-GB");

/** 6557 -> "6,557". */
export function formatNumber(n: number): string {
  return numberFormat.format(n);
}

/** "6,557 yards" / "1 hole". */
export function plural(n: number, one: string, many: string): string {
  return `${formatNumber(n)} ${n === 1 ? one : many}`;
}

/**
 * The `course_type` enum in plain words. `tier = short` wins over the
 * layout ("Short course" is the thing a golfer needs to know); an unknown
 * future value reads as its own words rather than disappearing.
 */
export function courseKind(course: Pick<CourseSummary, "course_type" | "tier">): string {
  if (course.tier === "short") return "Short course";
  switch (course.course_type) {
    case "primary18":
      return "18-hole course";
    case "secondary18":
      return "Second 18-hole course";
    case "nineHole":
      return "9-hole course";
    case "shortCourse":
      return "Short course";
    default:
      return sentenceCase(course.course_type.replace(/([a-z])([A-Z0-9])/g, "$1 $2"));
  }
}

/** The style as prose: "Pitch and Putt" -> "Pitch and putt". */
export function styleLabel(style: string | null): string | null {
  if (!style) return null;
  return sentenceCase(style);
}

function sentenceCase(s: string): string {
  const lower = s.trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Alphabetical, ignoring a leading "The", the way a golfer looks a course up. */
export function byName(a: { name: string }, b: { name: string }): number {
  const key = (s: string) => s.replace(/^the\s+/i, "");
  return key(a.name).localeCompare(key(b.name), "en-GB", { sensitivity: "base" });
}

const EARTH_RADIUS_KM = 6371.0088;
const KM_PER_MILE = 1.609344;

/** Great-circle distance in km between two lat / lng points (haversine). */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** "0.4 miles", "2.1 miles", "14 miles" - as the crow flies. */
export function formatMiles(km: number): string {
  const miles = km / KM_PER_MILE;
  if (miles < 10) {
    const rounded = Math.max(0.1, Math.round(miles * 10) / 10);
    return `${rounded.toFixed(1)} miles`;
  }
  return `${formatNumber(Math.round(miles))} miles`;
}

function hasPoint<T extends { lat: number | null; lng: number | null }>(
  c: T
): c is T & { lat: number; lng: number } {
  return c.lat != null && c.lng != null && Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng));
}

/** The `count` courses nearest `from`, with their distance in km. */
export function nearestCourses<T extends CourseSummary>(
  from: { slug: string; lat: number | null; lng: number | null },
  all: readonly T[],
  count = 4
): Array<{ course: T; km: number }> {
  if (!hasPoint(from)) return [];
  const origin = { lat: Number(from.lat), lng: Number(from.lng) };
  return all
    .filter((c) => c.slug !== from.slug && hasPoint(c))
    .map((course) => ({
      course,
      km: haversineKm(origin, { lat: Number(course.lat), lng: Number(course.lng) }),
    }))
    .sort((a, b) => a.km - b.km || byName(a.course, b.course))
    .slice(0, count);
}

/**
 * The first sentence-ish run of a course's own text, cut at a word under
 * `max` characters - the meta description. Never padded with invented copy.
 */
export function excerpt(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.-]+$/, "")}…`;
}

/** "st-enodoc.co.uk" from "https://www.st-enodoc.co.uk/". */
export function websiteHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Only http(s) links go out. Anything else is dropped rather than rendered. */
export function safeHttpUrl(url: string | null): string | null {
  if (!url) return null;
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Slugs are lower-case letters, digits and single hyphens. Anything else is a 404 without a read. */
export function isSlug(s: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length <= 120;
}
