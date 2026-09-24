import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { FeatureCard } from "@/components/marketing/Features";
import { Reveal } from "@/components/marketing/Reveal";
import { RevealHeadline } from "@/components/marketing/atoms";
import { PageMotion } from "@/components/marketing/PageMotion";
import { StickyNav } from "@/components/marketing/StickyNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";

/**
 * /app — the three small ideas, on their own page. The homepage makes
 * the pitch; this is where the curious come to see what the app
 * actually does: the atlas, the one-tap round, the polite competition.
 * Copy is hand-edited in siteConfig.appPage (+ siteConfig.features).
 *
 * Deliberately absent: the roadmap and FAQ (they live on the
 * homepage), a second signup form mid-page. One idea per page.
 */

export const metadata: Metadata = {
  title: "The app",
  description: `What's inside ${siteConfig.brandName}: every course in Great Britain on one map, rounds kept with a tap, and a polite competition with your friends.`,
};

export default function AppPage() {
  const { headline, lede, cta } = siteConfig.appPage;
  const [pre, ital, post] = headline;

  return (
    <div className="fw-root">
      <PageMotion />
      <div className="fw-ambient" aria-hidden="true" />
      <StickyNav />

      <main className="fw-app-main">
        {/* ─── Hero: the page's one idea, stated ───────────── */}
        <section className="fw-app-hero" aria-label="Inside the app">
          <RevealHeadline
            pre={pre}
            ital={ital}
            post={post}
            fontSize="clamp(38px, 9.5vw, 72px)"
            lineHeight="1.02"
            letterSpacing="clamp(-2.4px, -0.3vw, -1.2px)"
          />
          <p
            className="fw-lede fw-page-enter"
            style={{ "--enter-d": "420ms" } as React.CSSProperties}
          >
            {lede}
          </p>
        </section>

        {/* ─── The three ideas ─────────────────────────────── */}
        <div className="fw-features fw-app-cards">
          {siteConfig.features.map((f, i) => (
            <Reveal key={i} delay={i * 120}>
              <FeatureCard
                kind={f.kind}
                palette="mint"
                eyebrow={f.eyebrow}
                title={f.title}
                body={f.body}
              />
            </Reveal>
          ))}
        </div>

        {/* ─── One way in ──────────────────────────────────── */}
        <Reveal>
          <section className="fw-page-cta">
            <h2>
              {cta.headlinePre}
              <span className="fw-page-cta-ital">{cta.headlineItalic}</span>
              {cta.headlinePost}
            </h2>
            <p>{cta.body}</p>
            <Link href="/#join" className="fw-page-cta-btn">
              {cta.ctaLabel}
            </Link>
            <p className="fw-page-cta-meta">{cta.meta}</p>
          </section>
        </Reveal>
      </main>

      {/* ─── Footer ──────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
