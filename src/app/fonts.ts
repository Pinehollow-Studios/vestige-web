import { Inter, Manrope } from "next/font/google";

/**
 * The two faces every route group loads, declared once so the marketing
 * layout, the course directory's layout and the global 404 all share the
 * same font files rather than each generating their own.
 */

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Modern geometric sans — the display face. Replaces Fraunces. Used
// upright only, so only the normal style is loaded to keep the font
// payload small on mobile.
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display-face",
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
});
