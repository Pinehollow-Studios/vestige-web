import type { Metadata, Viewport } from "next";
import { inter, manrope } from "../fonts";
import { Analytics } from "@vercel/analytics/next";
import "./marketing.css";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: {
    default: `${siteConfig.brandName} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.brandName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: `https://${siteConfig.domain}`,
    siteName: siteConfig.brandName,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.brandName} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  // The name under the icon when the site is added to an iOS Home Screen.
  // Without it iOS uses the <title>, which is the full title-plus-tagline.
  // Deliberately not `capable` — that launches the bookmark chrome-less,
  // under the notch, and this is a marketing site with no safe-area insets
  // and an App Store link as its whole point. It should open in the browser.
  appleWebApp: { title: siteConfig.brandName },
  applicationName: siteConfig.brandName,
  // Who makes it — rendered as author/creator/publisher meta and a
  // rel="author" link back to the studio site.
  authors: [{ name: siteConfig.footer.studio.shortName, url: siteConfig.footer.studio.website }],
  creator: siteConfig.footer.studio.shortName,
  publisher: siteConfig.footer.studio.shortName,
};

/**
 * The app icon's ground colour, so the browser chrome around the page —
 * Safari's address bar, Android's status bar, the PWA splash — carries
 * the same near-black the site and the icon are built on.
 */
export const viewport: Viewport = {
  themeColor: "#06090E",
};

/**
 * Structured data for search engines. The WebSite entry is what Google
 * reads the site name from — without it results were headed
 * "vestige.golf" rather than "Vestige" — and the Organization entry
 * gives it the app icon as the logo. Rendered as a script tag in the
 * body, per the Next JSON-LD guide; `<` is escaped so nothing in the
 * copy can close the tag early.
 */
const siteUrl = `https://${siteConfig.domain}`;
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteConfig.brandName,
      legalName: siteConfig.footer.studio.name,
      url: siteUrl,
      logo: `${siteUrl}/brand/icon-512.png`,
      email: siteConfig.contactEmail,
      contactPoint: [
        { "@type": "ContactPoint", contactType: "customer support", email: siteConfig.supportEmail, availableLanguage: "en" },
      ],
      sameAs: [siteConfig.footer.studio.website],
      // The studio, by the same @id it publishes on pinehollow.studio, so
      // the two graphs join: Vestige is the product, Pinehollow the maker.
      parentOrganization: {
        "@type": "Organization",
        "@id": siteConfig.footer.studio.organizationId,
        name: siteConfig.footer.studio.shortName,
        legalName: siteConfig.footer.studio.name,
        url: siteConfig.footer.studio.website,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteConfig.brandName,
      url: siteUrl,
      description: siteConfig.description,
      inLanguage: "en-GB",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};
const structuredDataJson = JSON.stringify(structuredData).replace(/</g, "\\u003c");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${manrope.variable}`}
      // Tells Next the smooth scrolling in marketing.css is intentional, so
      // it can suspend it during route transitions — without this, moving
      // between the pages would smooth-scroll to the top of each one.
      data-scroll-behavior="smooth"
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredDataJson }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
