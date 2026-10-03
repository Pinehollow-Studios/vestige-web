import { site } from "../../config/site";

/** An absolute vestige.golf URL for a site path. */
export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}
