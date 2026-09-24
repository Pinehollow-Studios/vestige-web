import type { Metadata, ResolvingMetadata } from "next";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The course directory's switches and the few things every directory page
 * derives from them: the robots rule, the app CTA's target and the Smart
 * App Banner. Plain constants, no data access, safe anywhere (robots.ts
 * reads the first one).
 */

/**
 * THE indexing switch. While `false` the whole directory is
 * `noindex, nofollow`, robots.ts does not list its sitemap, and old
 * `/course/<uuid>` share links keep rendering today's landing page instead
 * of redirecting.
 *
 * Flipping it to `true` is Tom's go-live act, and only once the plan's §6
 * "Index go-live bar" is met (every page at the §3 minimum, Jack's rewrites
 * in, the Index threshold set, the views and the slug RPC on PROD, the
 * facts question answered). Then submit /courses/sitemap.xml in Search
 * Console.
 */
export const DIRECTORY_INDEXABLE: boolean = false;

/** The country the directory's courses are in today. Scotland and Wales join before 1.0. */
export const DIRECTORY_COVERAGE = "England";

/**
 * The App Store's numeric app id (the digits after `id` in the listing URL).
 * It drives the Smart App Banner (`apple-itunes-app`), which renders only
 * while this is set. Null until the 1.0 listing exists - never guess it.
 */
export const APP_STORE_APP_ID: string | null = null;

/**
 * The App Store Connect provider token for campaign links (App Analytics →
 * Campaigns → the `pt=` value). Null until Tom copies it from App Store
 * Connect; the CTA then carries `pt=` beside `ct=`.
 */
export const APP_STORE_PROVIDER_TOKEN: string | null = null;

/** The page types a campaign link is counted under - one `ct=` each, never per course. */
export type DirectoryPageType = "front" | "course" | "county" | "list" | "style";

/**
 * Where the one CTA goes. Until `siteConfig.appStoreUrl` is set it is the
 * site's own `/app` page; after, the App Store listing with campaign
 * parameters `ct=dir-<pagetype>` (Apple caps `ct` at 40 characters; ours
 * stay under 30) and `pt=` once the provider token is in.
 */
export function appCta(pageType: DirectoryPageType): { href: string; external: boolean } {
  const store = siteConfig.appStoreUrl;
  if (!store) return { href: "/app", external: false };
  try {
    const url = new URL(store);
    if (APP_STORE_PROVIDER_TOKEN) url.searchParams.set("pt", APP_STORE_PROVIDER_TOKEN);
    url.searchParams.set("ct", `dir-${pageType}`.slice(0, 30));
    return { href: url.toString(), external: true };
  } catch {
    return { href: "/app", external: false };
  }
}

/** The directory's robots rule, driven by the one switch. Set once, in the directory layout. */
export const directoryRobots: Metadata["robots"] = DIRECTORY_INDEXABLE
  ? { index: true, follow: true }
  : { index: false, follow: false };

/** An absolute URL on the site for a directory path ("/courses/x"). */
export function absoluteUrl(path: string): string {
  return `https://${siteConfig.domain}${path}`;
}

/**
 * A directory page's title, description, canonical, share cards and Smart
 * App Banner in one place. `openGraph` and `twitter` replace the parent's
 * rather than merging (Next's shallow metadata merge), which would also drop
 * the share image a parent segment's `opengraph-image` file attached - so a
 * page without its own image file passes `parent` and its images carry
 * through. A page WITH its own file (the front door, a course) needs no
 * `parent`: a file in the page's own segment outranks anything set here.
 */
export async function directoryMetadata({
  title,
  description,
  path,
  parent,
}: {
  title: string;
  description: string;
  path: string;
  parent?: ResolvingMetadata;
}): Promise<Metadata> {
  const url = absoluteUrl(path);
  const inherited = parent ? await parent : null;
  const ogImages = inherited?.openGraph?.images;
  const twitterImages = inherited?.twitter?.images;
  const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.brandName,
      locale: "en_GB",
      type: "website",
      ...(ogImages?.length ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(twitterImages?.length ? { images: twitterImages } : {}),
    },
  };
  if (APP_STORE_APP_ID) {
    metadata.itunes = { appId: APP_STORE_APP_ID, appArgument: url };
  }
  return metadata;
}
