import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { FwLockup } from "./atoms";
import { PinehollowMark } from "./PinehollowMark";

/**
 * The shared footer — brand lockup, the site's pages, and the studio
 * attribution. One component so every page (home / the app / progress)
 * carries the same way around the site.
 *
 * Three zones (brand / nav / studio) laid out on a grid, so each one
 * moves as a block at the breakpoints rather than the links wrapping
 * wherever they happen to run out of room. Wide: all three on one row.
 * Medium: brand and pages on top, the studio line beneath. Narrow: the
 * three stacked. See the grid-template-areas in marketing.css.
 *
 * The studio cluster is the site's standing link to Pinehollow: the
 * studio's own mark, the registered name (the UK trading-disclosure line
 * lives on the legal pages, this is the visible one), the studio website
 * and the shared inbox. All of it comes from siteConfig.footer.studio.
 */
export function SiteFooter() {
  const { studio } = siteConfig.footer;
  return (
    <footer className="fw-footer">
      <div className="fw-footer-brand">
        <FwLockup label={siteConfig.brandName.toUpperCase()} />
      </div>

      <nav className="fw-footer-nav" aria-label="Pages">
        {siteConfig.nav.map((l) => (
          <Link key={l.href} className="fw-footer-link" href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link className="fw-footer-link" href="/privacy">
          Privacy
        </Link>
        <a className="fw-footer-link" href={`mailto:${siteConfig.supportEmail}`}>
          Support
        </a>
      </nav>

      <div className="fw-footer-studio" aria-label="Made by">
        <a
          className="fw-footer-mark fw-footer-studio-name"
          href={studio.website}
          target="_blank"
          rel="noopener noreferrer"
          title={`${studio.shortName} · ${studio.websiteLabel}`}
        >
          <PinehollowMark size={13} />
          <span>
            <span className="fw-footer-studio-by">Made by</span> {studio.name}
          </span>
        </a>
        <span className="fw-footer-studio-contact">
          <a
            className="fw-footer-link"
            href={studio.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {studio.websiteLabel}
          </a>
          <a className="fw-footer-link" href={`mailto:${studio.email}`}>
            {studio.email}
          </a>
        </span>
      </div>
    </footer>
  );
}
