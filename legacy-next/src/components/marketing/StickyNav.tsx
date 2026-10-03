"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";
import { accentFor, type Palette } from "./palette";
import { useMagnetic } from "./hooks";
import { FwMark } from "./atoms";

/**
 * Floating glass pill nav — the site's tab chooser now that the story
 * is split across pages (home / the app / progress). The active page
 * is marked off the pathname, and the magnetic "Join" CTA always
 * leads back to the homepage signup.
 *
 * Surfacing: the homepage holds it back until the visitor scrolls
 * past the hero — the hero's own topbar owns the first viewport —
 * and from there it stays put; it only leaves if you scroll back up
 * into the hero. Subpages spring it in on arrival and keep it for
 * the whole visit. (An earlier hide-on-scroll-down pass read as the
 * nav glitching away mid-read on phones, so: always present.)
 */
export function StickyNav({ palette = "mint" }: { palette?: Palette }) {
  const acc = accentFor(palette);
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [shown, setShown] = useState(false);
  // A short lean only: the nav links sit right up against this pill.
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.16, ".fw-sticky", 6);

  useEffect(() => {
    const apply = () =>
      setShown(!onHome || window.scrollY > window.innerHeight * 0.72);
    // A frame after mount, so the hidden state paints first and the
    // data-shown spring plays on pages that show it immediately.
    const raf = requestAnimationFrame(apply);
    window.addEventListener("scroll", apply, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", apply);
    };
  }, [onHome]);

  return (
    <nav className="fw-sticky" data-shown={shown ? "1" : "0"} aria-label="Site">
      <Link
        className="fw-sticky-brand"
        href="/"
        onClick={(e) => {
          if (!onHome) return;
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <FwMark size={20} />
        {siteConfig.brandName.toUpperCase()}
      </Link>
      <span className="fw-sticky-rule" aria-hidden />
      {siteConfig.nav.map((l) => (
        <Link
          key={l.href}
          className="fw-sticky-link"
          data-active={pathname === l.href ? "1" : "0"}
          aria-current={pathname === l.href ? "page" : undefined}
          href={l.href}
        >
          {l.label}
        </Link>
      ))}
      <a
        ref={ctaRef}
        className="fw-sticky-cta"
        href={onHome ? "#join" : "/#join"}
        style={{
          background: `linear-gradient(135deg, ${acc.a}, ${acc.b})`,
          color: acc.on,
        }}
      >
        Join the list
      </a>
    </nav>
  );
}
