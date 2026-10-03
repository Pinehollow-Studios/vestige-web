import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Web app manifest — what Android sees when someone adds the site to
 * their Home Screen, and where Chrome reads the install/theme colours.
 *
 * The icons come out of `scripts/build-brand-icons.sh`, which renders
 * them from the iOS app's Icon Composer document, so the tile on an
 * Android home screen is the same artwork as the one on an iPhone.
 * `any` keeps the icon's own rounded corners; `maskable` is the squared
 * version, because the platform crops that one to its own shape and a
 * pre-rounded PNG would come back double-rounded.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.brandName} — ${siteConfig.tagline}`,
    short_name: siteConfig.brandShortName,
    description: siteConfig.description,
    start_url: "/",
    // Not "standalone": see the note in layout.tsx — the site is not built
    // to render outside browser chrome.
    display: "browser",
    // The brand near-black the whole site sits on, so the browser chrome
    // matches the page rather than flashing white.
    background_color: "#06090E",
    theme_color: "#06090E",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/brand/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
