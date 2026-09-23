import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";
import {
  progressConfig,
  COUNTIES_TOTAL,
  COUNTRIES_MAPPED,
  COUNTRIES_TOTAL,
  COURSES_EXACT_TEXT,
  isComplete,
  milestone,
} from "@/lib/progressConfig";
import { CountyAtlas } from "@/components/progress/CountyAtlas";
import { ProgressStats } from "@/components/progress/ProgressStats";
import { PageMotion } from "@/components/marketing/PageMotion";
import { StickyNav } from "@/components/marketing/StickyNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Reveal } from "@/components/marketing/Reveal";
import { RevealHeadline } from "@/components/marketing/atoms";
import { BRITAIN_PATH } from "@/components/marketing/britain";

/**
 * /progress — the build, in the open. A reward for the waiting list
 * and a recruiting tool for the curious: the map of Great Britain
 * filling in country by country, the two honest figures, what's
 * happening right now, and one way in. The homepage carries only the
 * map as a peek; everything else about the build lives here. Numbers
 * are hand-edited in src/lib/progressConfig.ts, and every "complete"
 * here derives from that file rather than being written into the copy.
 *
 * Deliberately absent: the roadmap and FAQ (they live on the
 * homepage), a second signup form, a changelog. One idea per page.
 */

export const metadata: Metadata = {
  title: "Progress",
  description: isComplete
    ? `How far ${siteConfig.brandName} has come: every course in Great Britain mapped, ${COURSES_EXACT_TEXT} of them, and what we're working on right now.`
    : milestone
      ? `How far ${siteConfig.brandName} has come: England's ${COUNTIES_TOTAL} counties mapped and ${COURSES_EXACT_TEXT} courses collected, Scotland and Wales next, and what we're working on right now.`
      : `How far ${siteConfig.brandName} has come: counties mapped, courses collected, and what we're working on right now.`,
};

export default function ProgressPage() {
  const {
    coursesMapped,
    coursesTotal,
    completedCounties,
    latestCounty,
    lastUpdated,
    rightNow,
    screenshot,
  } = progressConfig;
  const completedOn = progressConfig.countries[progressConfig.countries.length - 1]?.completedOn;

  return (
    <div className="fw-root">
      <PageMotion />
      <div className="fw-ambient" aria-hidden="true" />
      <StickyNav />

      <main className="fw-page-main">
        {/* ─── Hero: intro + ledger beside the map on desktop ─ */}
        <section className="fw-prog-hero" aria-label="Progress so far">
          <div className="fw-prog-intro">
            {/* capped so the headline holds a single line in both the
                phone column and the desktop hero cell — at 43px+ a
                375px phone orphans the last word. */}
            <RevealHeadline
              pre="Britain, "
              ital={isComplete ? "complete" : "filling in"}
              post="."
              fontSize="clamp(40px, 10.5vw, 68px)"
              lineHeight="0.97"
              letterSpacing="clamp(-2.6px, -0.3vw, -1.4px)"
            />
            <p className="fw-lede fw-page-enter" style={{ "--enter-d": "420ms" } as React.CSSProperties}>
              {isComplete ? (
                <>
                  Vestige is an iPhone app that puts every golf course in
                  Great Britain on one map, and keeps the ones you&rsquo;ve
                  played. The map is finished: {COURSES_EXACT_TEXT} courses,
                  every one of them in. This is how it got there.
                </>
              ) : milestone ? (
                <>
                  Vestige is an iPhone app that puts every golf course in
                  Great Britain on one map, and keeps the ones you&rsquo;ve
                  played. England is finished: all {COUNTIES_TOTAL} counties,{" "}
                  {COURSES_EXACT_TEXT} courses, every one of them in. Scotland
                  and Wales are next. This is how far the map has come.
                </>
              ) : (
                <>
                  Vestige is an iPhone app that puts every golf course in
                  Great Britain on one map, and keeps the ones you&rsquo;ve
                  played. We&rsquo;re partway through building it. This is how
                  far the map has come.
                </>
              )}
            </p>
          </div>
          <CountyAtlas
            completed={completedCounties}
            latest={milestone ? undefined : latestCounty}
            courses={coursesMapped}
            complete={isComplete}
          />
          <ProgressStats
            countries={{
              label: "Countries mapped",
              value: COUNTRIES_MAPPED,
              total: COUNTRIES_TOTAL,
            }}
            courses={{
              label: "Courses mapped",
              value: coursesMapped,
              total: coursesTotal,
              approx: true,
              note: "every one in Britain",
            }}
            latest={latestCounty}
            lastUpdated={lastUpdated}
            complete={isComplete}
            completedOn={completedOn}
            milestone={milestone}
          />
        </section>

        {/* ─── Right now ───────────────────────────────────── */}
        <Reveal>
          <section className="fw-prog-now">
            <p className="fw-page-eyebrow">Right now</p>
            <p className="fw-prog-now-line">{rightNow}</p>
          </section>
        </Reveal>

        {/* ─── The screenshot ──────────────────────────────── */}
        <section className="fw-prog-duo">
          <Reveal>
            <div className="fw-prog-shot-copy">
              <p className="fw-page-eyebrow">From the build</p>
              <h2 className="fw-prog-shot-title">What it looks like today.</h2>
              <p className="fw-prog-shot-sub">
                A real screen from the current build: the app as it stands,
                still taking shape.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="fw-prog-shot">
              {screenshot ? (
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  fill
                  sizes="(max-width: 879px) 72vw, 320px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="fw-prog-shot-placeholder">
                  <svg viewBox="0 0 200 140" width="58%" aria-hidden="true">
                    <path
                      d={BRITAIN_PATH}
                      fill="rgba(91,228,195,0.06)"
                      stroke="rgba(91,228,195,0.45)"
                      strokeWidth="0.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Screenshot to follow</span>
                </div>
              )}
            </div>
          </Reveal>
        </section>

        {/* ─── One way in ──────────────────────────────────── */}
        <Reveal>
          <section className="fw-page-cta">
            <h2>
              Want <span className="fw-page-cta-ital">in</span>?
            </h2>
            <p>
              Join the waiting list. The public beta link goes out to it once, on
              2 October, plus the occasional update like this one. Nothing else.
            </p>
            <Link href="/#join" className="fw-page-cta-btn">
              Join the waiting list
            </Link>
            <p className="fw-page-cta-meta">iPhone, iOS 18+ · Free at launch</p>
          </section>
        </Reveal>
      </main>

      {/* ─── Footer ──────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
