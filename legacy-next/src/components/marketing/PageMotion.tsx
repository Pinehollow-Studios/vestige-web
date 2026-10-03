"use client";

import { useGlobalProgress } from "./hooks";
import { ScrollProgress } from "./ScrollProgress";

/**
 * The page-level motion chrome the subpages (/app, /progress) share
 * with the homepage: one client component that writes the global --gp
 * variable (which the fixed ambient glows and the top progress bar
 * consume from CSS) so the rest of the page can stay server-rendered.
 */
export function PageMotion() {
  useGlobalProgress();
  return <ScrollProgress />;
}
