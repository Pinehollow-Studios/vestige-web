import * as React from "react";
import { Heading, Img, Section, Text } from "@react-email/components";
import {
  EmailShell,
  Eyebrow,
  brand,
  h1Style,
  pStyle,
} from "../lib/emailShell";
import { siteConfig } from "../lib/siteConfig";
import {
  progressConfig,
  COUNTRIES_MAPPED,
  COUNTRIES_TOTAL,
  isComplete,
} from "../lib/progressConfig";

/** Where the build-progress-map script writes the snapshot, relative to the
 *  site root. Referenced absolutely below so it resolves in the inbox. */
const MAP_IMAGE_PATH = "/progress/atlas-current.png";

/**
 * Progress update — a periodic "here's where we are" email sent as a Resend
 * Broadcast to the "Vestige launch waitlist" segment. All content is driven by
 * `siteConfig.progress`, so a new send is a config edit, not a template rewrite.
 * Publish/refresh it the same way as launch.tsx:
 *   resend broadcasts create --segment-id <id> --from "Vestige <hello@vestige.golf>" \
 *     --subject "<siteConfig.progress.subject>" --react-email src/emails/update.tsx \
 *     --reply-to hello@pinehollow.studio
 *
 * The unsubscribe link uses Resend's broadcast variable {{{RESEND_UNSUBSCRIBE_URL}}},
 * which only resolves when sent as a broadcast (it shows literally in preview).
 */
export default function UpdateEmail() {
  const { progress, roadmap } = siteConfig;

  // Figures derive from the same source the website uses, so the email can
  // never disagree with /progress. Update them in src/lib/progressConfig.ts.
  // Once the counting is finished there's no denominator left, so the course
  // figure stops being a fraction and starts being the answer.
  const mapped = progressConfig.coursesMapped.toLocaleString("en-GB");
  const figures: ReadonlyArray<{ value: string; label: string }> = [
    {
      value: progressConfig.coursesTotal
        ? `${mapped} of ~${progressConfig.coursesTotal.toLocaleString("en-GB")}`
        : mapped,
      label: progressConfig.coursesTotal
        ? "Courses mapped"
        : "Courses mapped, every one in Britain",
    },
    {
      value: `${COUNTRIES_MAPPED} of ${COUNTRIES_TOTAL}`,
      label: "Countries mapped",
    },
  ];

  const mapSrc = `https://${siteConfig.domain}${MAP_IMAGE_PATH}`;

  return (
    <EmailShell
      preview={progress.subject}
      footer={
        <>
          You&rsquo;re getting this because you signed up for{" "}
          {siteConfig.brandName} at {siteConfig.domain}.{" "}
          <a
            href="{{{RESEND_UNSUBSCRIBE_URL}}}"
            style={{ color: brand.ink2, textDecoration: "underline" }}
          >
            Unsubscribe
          </a>
          .
        </>
      }
    >
      <Eyebrow>{progress.eyebrow}</Eyebrow>
      <Heading style={h1Style}>{progress.headline}</Heading>

      {progress.intro.map((para, i) => (
        <Text key={i} style={pStyle}>
          {para}
        </Text>
      ))}

      {/* Coverage-map snapshot — a static PNG built from the same data as the
          website's /progress map (see scripts/build-progress-map.ts). */}
      {progress.map.enabled && (
        <Section style={{ margin: "24px 0 4px", textAlign: "center" }}>
          <Img
            src={mapSrc}
            alt={progress.map.alt}
            width={440}
            style={{ width: "100%", maxWidth: 440, height: "auto", margin: "0 auto" }}
          />
        </Section>
      )}

      {/* Headline figures — a compact stat list. */}
      {figures.length > 0 && (
        <Section
          className="vs-sunken"
          style={{
            margin: "22px 0 4px",
            padding: "4px 16px",
            backgroundColor: brand.bg,
            border: `1px solid ${brand.border}`,
            borderRadius: 10,
          }}
        >
          {figures.map((f, i) => (
            <Text
              key={i}
              style={{
                margin: 0,
                padding: "12px 0",
                fontSize: 14,
                lineHeight: "20px",
                color: brand.ink2,
                borderBottom:
                  i < figures.length - 1
                    ? `1px solid ${brand.border}`
                    : undefined,
              }}
            >
              <span
                style={{
                  color: brand.accent,
                  fontWeight: 600,
                  fontSize: 18,
                  fontFamily: brand.display,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.3px",
                }}
              >
                {f.value}
              </span>
              {"  ·  "}
              <span style={{ color: brand.ink }}>{f.label}</span>
            </Text>
          ))}
        </Section>
      )}

      {/* What's new this update. */}
      {progress.highlights.length > 0 && (
        <Section style={{ margin: "8px 0 2px" }}>
          {progress.highlights.map((h, i) => (
            <Text
              key={i}
              style={{ margin: "16px 0 0", fontSize: 15, lineHeight: "23px", color: brand.ink2 }}
            >
              <span style={{ color: brand.ink, fontWeight: 700 }}>{h.title}.</span>{" "}
              {h.body}
            </Text>
          ))}
        </Section>
      )}

      {/* "Just added" — the new counties as mint chips + a few standout courses. */}
      {progress.justAdded.enabled && (
        <Section style={{ margin: "26px 0 2px" }}>
          <Eyebrow>{progress.justAdded.eyebrow}</Eyebrow>
          <Text style={{ ...pStyle, marginTop: 10, marginBottom: 12 }}>
            {progress.justAdded.lead}
          </Text>
          {/* County chips */}
          <Section style={{ margin: 0 }}>
            {progress.justAdded.counties.map((c, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  margin: "0 6px 8px 0",
                  padding: "6px 12px",
                  borderRadius: 999,
                  backgroundColor: "rgba(91,228,195,0.12)",
                  border: `1px solid rgba(91,228,195,0.22)`,
                  color: brand.accent,
                  fontSize: 12.5,
                  fontWeight: 600,
                  lineHeight: "16px",
                }}
              >
                {c}
              </span>
            ))}
          </Section>
          {progress.justAdded.courses.length > 0 && (
            <>
              <Text style={{ ...pStyle, marginTop: 16, marginBottom: 4 }}>
                {progress.justAdded.topCount > 0 ? (
                  <>
                    <span
                      style={{
                        color: brand.accent,
                        fontWeight: 700,
                        fontFamily: brand.display,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {progress.justAdded.topCount}
                    </span>{" "}
                    {isComplete ? (
                      <>
                        of {progress.justAdded.topList} are on the map. These
                        among the last in:
                      </>
                    ) : (
                      <>
                        of {progress.justAdded.topList} are on the map now,
                        including these newcomers:
                      </>
                    )}
                  </>
                ) : (
                  <>A few of the standouts that came with them:</>
                )}
              </Text>
              {progress.justAdded.courses.map((c, i) => (
                <Text
                  key={i}
                  style={{
                    margin: "10px 0 0",
                    fontSize: 15,
                    lineHeight: "22px",
                    color: brand.ink2,
                  }}
                >
                  {c.rank ? (
                    <span
                      style={{
                        display: "inline-block",
                        minWidth: 34,
                        color: brand.accent,
                        fontWeight: 700,
                        fontSize: 17,
                        fontFamily: brand.display,
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      {c.rank}
                    </span>
                  ) : null}
                  <span style={{ color: brand.ink, fontWeight: 700 }}>{c.name}</span>
                  {"  ·  "}
                  {c.county}
                  {c.note ? (
                    <span style={{ color: brand.ink3 }}>{"  ·  "}{c.note}</span>
                  ) : null}
                </Text>
              ))}
            </>
          )}
        </Section>
      )}

      {/* An honest "what we're up to right now" note, from the makers. */}
      {progress.showRightNow && (
        <Section style={{ margin: "26px 0 2px" }}>
          <Eyebrow>Right now</Eyebrow>
          <Text style={{ ...pStyle, marginTop: 10 }}>{progressConfig.rightNow}</Text>
        </Section>
      )}

      {/* Roadmap reminder — reused from the single source of truth. */}
      {progress.showRoadmap && (
        <Section
          className="vs-card"
          style={{
            margin: "24px 0 4px",
            padding: "16px",
            borderLeft: `3px solid ${brand.accent}`,
            backgroundColor: brand.card,
            borderRadius: 6,
          }}
        >
          <Eyebrow>{roadmap.eyebrow}</Eyebrow>
          {roadmap.milestones.map((m, i) => (
            <Text key={i} style={{ margin: "8px 0 0", fontSize: 14, lineHeight: "20px", color: brand.ink2 }}>
              <span style={{ color: brand.accent, fontWeight: 700 }}>
                {m.month} {m.year}
              </span>
              {"  ·  "}
              <span style={{ color: brand.ink }}>{m.label}.</span> {m.body}
            </Text>
          ))}
        </Section>
      )}

      <Text style={pStyle}>{siteConfig.closingCta.forwardNudge}</Text>

      <Text style={{ ...pStyle, color: brand.ink, marginTop: 22 }}>
        {progress.signoff}
        <br />
        Jack &amp; Tom
      </Text>
    </EmailShell>
  );
}
