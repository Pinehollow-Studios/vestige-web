/**
 * The course directory's data contract - the three public, read-only views
 * the iOS repo's migration `20260923110000_web_directory.sql` creates. Column
 * names are the views' own (snake_case), so a row decodes without mapping.
 *
 * What the views never carry (plan §4.1): ids, polygons, `survey_ref`, the
 * Index sub-scores, audit columns. Nothing here should ever grow to hold them.
 */

/** One curated list a course sits on, as `web_directory_courses.lists` carries it. */
export type CourseListMembership = {
  slug: string;
  name: string;
  /** The course's place on the list. Meaningful only when the list `is_ordered`. */
  position: number;
};

/** A full row of `web_directory_courses` - everything the course page shows. */
export type DirectoryCourse = {
  /** Frozen, unique, permanent. The URL is `/courses/<slug>`. */
  slug: string;
  name: string;
  county_name: string;
  county_slug: string;
  /** `primary18` | `secondary18` | `nineHole` | `shortCourse` (the `course_type` enum). */
  course_type: string;
  hole_count: number | null;
  par: number | null;
  yards: number | null;
  /** Parkland, Heathland, Links, Downland, Pitch and Putt. */
  style: string | null;
  established: number | null;
  /** `standard` | `short` (the only two in use). */
  tier: string;
  description: string | null;
  /** Tracking parameters already stripped by the view. May be null. */
  website: string | null;
  /** Rounded to 3 decimal places (about 100 m) by the view. */
  lat: number | null;
  lng: number | null;
  /** NULL below the public threshold - show nothing then, never a zero. */
  vestige_index: number | null;
  lists: CourseListMembership[];
  updated_at: string;
};

/** The slim columns every listing, and the nearby-courses sum, needs. */
export const COURSE_SUMMARY_COLUMNS = [
  "slug",
  "name",
  "county_name",
  "county_slug",
  "course_type",
  "hole_count",
  "style",
  "tier",
  "lat",
  "lng",
  "vestige_index",
  "lists",
] as const;

export type CourseSummary = Pick<DirectoryCourse, (typeof COURSE_SUMMARY_COLUMNS)[number]>;

/** A row of `web_directory_counties`. */
export type DirectoryCounty = {
  slug: string;
  name: string;
  course_count: number;
  updated_at: string;
};

/** A row of `web_directory_lists` (live lists only). */
export type DirectoryList = {
  slug: string;
  name: string;
  description: string | null;
  bio: string | null;
  is_ordered: boolean;
  course_count: number;
  updated_at: string;
};
