"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { useGlobalProgress, useMouseParallax, useViewScrub } from "./hooks";
import { accentFor, fwF } from "./palette";
import { HeroBackdrop, type HeroMode } from "./backdrops";
import {
  FwLockup,
  LiveEyebrow,
  RevealHeadline,
} from "./atoms";
import { GlassEmail } from "./GlassEmail";
import { CourseMarquee } from "./CourseMarquee";
import { StatsStrip } from "./StatsStrip";
import { WhatItIs } from "./WhatItIs";
import { Faq } from "./Faq";
import { ClosingCTA } from "./ClosingCTA";
import { ScrollProgress } from "./ScrollProgress";
import { ScrollCue } from "./ScrollCue";
import { Roadmap } from "./Roadmap";
import { Preloader } from "./Preloader";
import { StickyNav } from "./StickyNav";
import { MegaWordmark } from "./MegaWordmark";
import { AtlasMini } from "./AtlasMini";
import { SiteFooter } from "./SiteFooter";

/** Staggered entrance delay for hero children, gated on the intro. */
const stage = (s: number): CSSProperties =>
  ({ "--stage-d": `${s}ms` } as CSSProperties);

/**
 * Hardcoded palette + backdrop mode — the TweaksPanel exploration
 * surface has been stripped per the handoff README's production
 * checklist. Both can be lifted into siteConfig later if multiple
 * brand variants are wanted.
 */
const PALETTE = "mint" as const;
const HERO_MODE: HeroMode = "aurora";

type LiveCount = { total: number; weekly: number };

export function MarketingApp({
  liveCount,
  progressPeek,
}: {
  liveCount: LiveCount | null;
  /**
   * The server-rendered /progress snapshot (ProgressPeek), passed in
   * as a node so its ~6,000 points of county geometry never enter
   * this client bundle.
   */
  progressPeek?: React.ReactNode;
}) {
  const acc = accentFor(PALETTE);
  const [pre, ital, post] = siteConfig.hero.headline;
  useMouseParallax();
  // One lerped 0..1 progress var (--gp on <html>) that every
  // cross-page companion — progress bar, ambient colour journey,
  // atlas pins — evolves against.
  useGlobalProgress();

  // Intro choreography: the preloader covers the page, then flips this
  // on as its curtain wipes up — hero children enter in stages via the
  // [data-intro] attribute + per-element --stage-d delays.
  const [introDone, setIntroDone] = useState(false);

  // Hero scroll-exit: writes --hp (0..1) on the section as the visitor
  // scrolls the first ~0.85 viewport; CSS recedes/fades the content.
  const heroRef = useViewScrub<HTMLElement>({ mode: "exit", varName: "--hp" });

  // Past the hero, mark it offstage so CSS can stop painting/animating
  // the aurora — its giant blurred blend layers are the most expensive
  // pixels on the page and they're invisible from viewport two onward.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let off: boolean | null = null;
    const fn = () => {
      // Mirror useViewScrub's focus freeze: with the keyboard open, the
      // mobile browser's auto-scroll (and shrunken innerHeight) can read
      // as "past the hero" and blank the aurora mid-typing.
      const ae = document.activeElement;
      if (ae && el.contains(ae) && ae.matches("input, textarea, select")) {
        return;
      }
      const next = window.scrollY > window.innerHeight * 1.15;
      if (next !== off) {
        off = next;
        el.setAttribute("data-offstage", next ? "1" : "0");
      }
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fw-root"
      data-mode={HERO_MODE}
      data-palette={PALETTE}
      data-intro={introDone ? "done" : "wait"}
    >
      <Preloader onReveal={() => setIntroDone(true)} />
      {/* fixed ambient glows — dawn mint drifting to golden hour as --gp climbs */}
      <div className="fw-ambient" aria-hidden="true" />
      <ScrollProgress />
      <StickyNav palette={PALETTE} />
      <AtlasMini />

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="fw-hero">
        <HeroBackdrop mode={HERO_MODE} palette={PALETTE} />

        {/* Top bar */}
        <div className="fw-topbar fw-intro-stage" style={stage(80)}>
          <FwLockup label={siteConfig.brandName.toUpperCase()} />
          {/* the other pages, then the one in-page action */}
          <nav className="fw-topbar-nav">
            {siteConfig.nav
              .filter((l) => l.href !== "/")
              .map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            <a href="#join">Get notified</a>
          </nav>
        </div>

        {/* Centred hero content */}
        <div className="fw-hero-content">
          {/* The headline's "2,000 courses" carries the context, so the
              eyebrow slot only appears once the live count earns it. */}
          {liveCount && (
            <div className="fw-intro-stage" style={{ marginBottom: 30, ...stage(150) }}>
              <LiveEyebrow palette={PALETTE} target={liveCount.weekly}>
                {siteConfig.hero.liveEyebrowLabel}
              </LiveEyebrow>
            </div>
          )}

          <RevealHeadline
            pre={pre}
            ital={ital}
            post={post}
            palette={PALETTE}
            fontSize="clamp(48px, 8.5vw, 132px)"
            lineHeight="0.94"
            letterSpacing="clamp(-5.6px, -0.45vw, -2.4px)"
            play={introDone}
          />

          {/* the one line that travels everywhere — bio, OG title, hero */}
          <p className="fw-lede fw-intro-stage" style={stage(520)}>
            {siteConfig.tagline}
          </p>

          <div className="fw-intro-stage" style={stage(680)}>
            <GlassEmail palette={PALETTE} cta="Save my spot" />
            {/* the carrot — why hand over an email when launch is a year out */}
            <p
              style={{
                margin: "14px auto 0",
                fontFamily: fwF.ui,
                fontSize: 13,
                color: "rgba(246,244,238,0.62)",
                textAlign: "center",
              }}
            >
              {siteConfig.hero.waitlistNote}
            </p>
          </div>

          {/* Sizing and wrapping live in CSS (.fw-hero-meta), not here, so
              the phone breakpoints can tighten them — see marketing.css. */}
          <div className="fw-intro-stage fw-hero-meta" style={stage(840)}>
            {siteConfig.hero.metaStrip.map((m, i) => (
              <span key={i} className="fw-hero-meta-item">
                {i === 0 ? (
                  <span className="fw-hero-meta-first">
                    <span
                      className="fw-hero-meta-dot"
                      style={{ background: acc.a, boxShadow: `0 0 8px ${acc.a}` }}
                    />
                    {m}
                  </span>
                ) : (
                  <>
                    <span className="fw-hero-meta-sep" aria-hidden />
                    <span>{m}</span>
                  </>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue — a tappable, escalating "there's more below" prompt.
            Fades against the hero's --hp on first scroll. See ScrollCue. */}
        <ScrollCue palette={PALETTE} delayMs={1100} />
      </section>

      {/* ═══ MARQUEE ═══════════════════════════════════════ */}
      <CourseMarquee />

      {/* ═══ STATS STRIP ═══════════════════════════════════ */}
      <StatsStrip />

      {/* ═══ WHY / WHAT IT IS ══════════════════════════════ */}
      {/* The three feature cards live on /app now — WhatItIs closes
          with the way through to them. */}
      <WhatItIs palette={PALETTE} />

      {/* ═══ PROGRESS SNAPSHOT ═════════════════════════════ */}
      {progressPeek}

      {/* ═══ ROADMAP ═══════════════════════════════════════ */}
      <Roadmap />

      {/* ═══ FAQ ═══════════════════════════════════════════ */}
      <Faq palette={PALETTE} />

      {/* ═══ CLOSING CTA ═══════════════════════════════════ */}
      <ClosingCTA
        palette={PALETTE}
        joinedTotal={liveCount ? liveCount.total : null}
      />

      {/* ═══ MEGA WORDMARK ═════════════════════════════════ */}
      <MegaWordmark />

      {/* ═══ FOOTER ════════════════════════════════════════ */}
      <SiteFooter />
    </div>
  );
}
