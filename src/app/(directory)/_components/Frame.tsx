import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/siteConfig";

/**
 * The directory's chrome: a quiet header, the breadcrumb, the one CTA and
 * the footer. Links into the marketing group cross root layouts, so `Link`
 * turns them into a full page load by itself.
 */

export function DirectoryHeader() {
  return (
    <header className="dx-wrap dx-top">
      <Link className="dx-brand" href="/">
        <Image src="/brand/icon-192.png" alt="" aria-hidden="true" width={26} height={26} loading="eager" />
        {siteConfig.brandName}
      </Link>
    </header>
  );
}

export function DirectoryFooter() {
  const { studio } = siteConfig.footer;
  return (
    <footer className="dx-foot">
      <div className="dx-wrap">
        <div>
          {siteConfig.brandName} is made by{" "}
          <a href={studio.website} rel="noopener">
            {studio.shortName}
          </a>
          . No ads, ever.
        </div>
        <nav aria-label="Site">
          <Link href="/">Home</Link>
          <Link href="/app">The app</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

export type Crumb = { label: string; href?: string };

/**
 * `Courses › <County> › <Course>`. The last crumb is the page itself. A crumb
 * without an href renders as text - "Courses" stays unlinked until the front
 * door (`/courses`) exists in phase 2.
 */
export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="dx-crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`}>
              {last ? (
                <span aria-current="page">{item.label}</span>
              ) : item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * The one call to action. It goes to the app page for now; phase 2 swaps in
 * the App Store campaign link per page type (plan §2.6).
 */
export function CallToAction({
  label = "Played it? Put it on your map",
}: {
  label?: string;
}) {
  return (
    <aside className="dx-cta" aria-label={`${siteConfig.brandName}, the app`}>
      <p>{siteConfig.tagline}</p>
      <Link className="dx-cta-button" href="/app">
        {label}
      </Link>
    </aside>
  );
}

export function Section({
  title,
  note,
  children,
  id,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  const headingId = id ?? `s-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section className="dx-section" aria-labelledby={headingId}>
      <h2 className="dx-section-title" id={headingId}>
        {title}
      </h2>
      {note ? <p className="dx-section-note">{note}</p> : null}
      {children}
    </section>
  );
}
