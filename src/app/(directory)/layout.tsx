import type { Metadata, Viewport } from "next";
import { inter, manrope } from "../fonts";
import { Analytics } from "@vercel/analytics/next";
import "./directory.css";
import { siteConfig } from "@/lib/siteConfig";
import { DirectoryFooter, DirectoryHeader } from "./_components/Frame";

/**
 * Root layout for the public course directory (`/courses/...`, plan §2.1).
 * Its own root layout, not the marketing one: the marketing stylesheet paints
 * `html, body` near-black and global CSS is never unloaded on client
 * navigation, so the two groups never share a document. Moving between them
 * is a full page load, which is fine.
 *
 * The directory follows the reader's light / dark (the marketing pages stay
 * dark-only). It is `noindex, nofollow` as a whole until the go-live bar in
 * plan §6 is met; robots.ts deliberately does NOT disallow /courses, or
 * Google would never see this noindex. Pages set their own title,
 * description and canonical, and never `robots` - a child's `robots`
 * replaces this one rather than merging.
 */

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: {
    default: `Golf courses · ${siteConfig.brandName}`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.brandName,
  robots: { index: false, follow: false },
  authors: [{ name: siteConfig.footer.studio.shortName, url: siteConfig.footer.studio.website }],
  creator: siteConfig.footer.studio.shortName,
  publisher: siteConfig.footer.studio.shortName,
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F5FA" },
    { media: "(prefers-color-scheme: dark)", color: "#070A10" },
  ],
};

export default function DirectoryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <div className="dx-shell">
          <DirectoryHeader />
          <main className="dx-main">
            <div className="dx-wrap">{children}</div>
          </main>
          <DirectoryFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
