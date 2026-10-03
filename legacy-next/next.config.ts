import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The app has two root layouts - app/(marketing) and app/(directory) -
    // so an unmatched URL has no single layout to render a 404 inside.
    // app/global-not-found.tsx is that 404. See the Next docs:
    // node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md
    globalNotFound: true,
  },
};

export default nextConfig;
