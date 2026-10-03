/**
 * Structured data for the directory (plan §2.5): schema.org JSON-LD, built
 * from the views' own fields and nothing else. It helps search engines
 * understand the entities; expect little visible rich-result payoff.
 *
 * NEVER `aggregateRating`: the Vestige Index is an editorial score, not
 * user reviews, and marking it up as one would misrepresent it.
 */

import { absoluteUrl } from "./config";
import type { CourseSummary, DirectoryCourse } from "./types";

type Json = Record<string, unknown>;

export type Crumb = { name: string; path: string };

/** `<` escaped so nothing in the copy can close the script tag early (as the marketing layout does). */
export function jsonLdString(data: Json): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function breadcrumbList(crumbs: Crumb[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** A `GolfCourse`: name, url, geo, county, founded, the club's website. */
export function golfCourse(course: DirectoryCourse, website: string | null): Json {
  const url = absoluteUrl(`/courses/${course.slug}`);
  const node: Json = {
    "@type": "GolfCourse",
    "@id": `${url}#course`,
    name: course.name,
    url,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: course.county_name,
      url: absoluteUrl(`/courses/county/${course.county_slug}`),
    },
  };
  const description = course.description?.trim();
  if (description) node.description = description;
  if (course.lat != null && course.lng != null) {
    node.geo = {
      "@type": "GeoCoordinates",
      latitude: Number(course.lat),
      longitude: Number(course.lng),
    };
  }
  if (course.established != null) node.foundingDate = String(course.established);
  if (website) node.sameAs = website;
  return node;
}

/** An `ItemList` of courses, in the order the page shows them. */
export function courseItemList(
  name: string,
  path: string,
  courses: Array<Pick<CourseSummary, "slug" | "name">>,
  ordered: boolean
): Json {
  return {
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: courses.length,
    ...(ordered ? { itemListOrder: "https://schema.org/ItemListOrderAscending" } : {}),
    itemListElement: courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: absoluteUrl(`/courses/${c.slug}`),
    })),
  };
}

/** One document for a page: a `@graph` of its nodes. */
export function graph(nodes: Json[]): Json {
  return { "@context": "https://schema.org", "@graph": nodes };
}
