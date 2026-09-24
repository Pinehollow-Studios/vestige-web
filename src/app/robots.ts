import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { DIRECTORY_INDEXABLE } from "@/lib/directory/config";

/**
 * Live: allow search engines to crawl and index the site.
 *
 * `/unsubscribe` is a GET action handler, not a page — keep crawlers out of
 * it so a bot can't trip the endpoint or list it in results.
 *
 * The course directory's sitemap (/courses/sitemap.xml) is listed only once
 * DIRECTORY_INDEXABLE is on. /courses itself is never disallowed here, or
 * crawlers would never see its noindex.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/unsubscribe" }],
    sitemap: DIRECTORY_INDEXABLE
      ? [`https://${siteConfig.domain}/sitemap.xml`, `https://${siteConfig.domain}/courses/sitemap.xml`]
      : `https://${siteConfig.domain}/sitemap.xml`,
  };
}
