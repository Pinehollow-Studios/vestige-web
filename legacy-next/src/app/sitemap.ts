import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The public pages, for search engines. The three story pages first,
 * then the legal set. `/unsubscribe` is an action handler (see robots.ts)
 * and the /course, /list, /society and /u routes are deep-link fallbacks
 * for the app, so none of those belong here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${siteConfig.domain}`;
  const pages: ReadonlyArray<{
    path: string;
    changeFrequency: "weekly" | "monthly" | "yearly";
    priority: number;
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/app", changeFrequency: "monthly", priority: 0.8 },
    { path: "/progress", changeFrequency: "weekly", priority: 0.8 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/guidelines", changeFrequency: "yearly", priority: 0.3 },
    { path: "/beta-terms", changeFrequency: "yearly", priority: 0.3 },
  ];
  return pages.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? base : `${base}${path}`,
    changeFrequency,
    priority,
  }));
}
