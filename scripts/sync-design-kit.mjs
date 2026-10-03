// Copies the parts of the Vestige design kit the website uses into this repo:
// the colour tokens (CSS custom properties, light + dark) and the brand marks.
//
// The kit is generated from the iOS app's asset catalogue, so the website and
// the app read the same values. Never hand-edit the copied files; re-run this
// after the kit is regenerated:
//
//   npm run sync:kit
//
// The kit lives outside the repo. Point VESTIGE_DESIGN_KIT at it if it isn't
// in the default place (a sibling folder of this repo, "Vestige Design System").

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kit = resolve(process.env.VESTIGE_DESIGN_KIT ?? join(root, "..", "Vestige Design System"));

if (!existsSync(join(kit, "DESIGN-SYSTEM.md"))) {
  console.error(`No design kit at ${kit}. Set VESTIGE_DESIGN_KIT to its folder.`);
  process.exit(1);
}

const copies = [
  ["assets/colors/vestige-colors.css", "src/styles/vestige-colors.css"],
  ["assets/brand/glyphs/vestige-globe-256.png", "public/brand/vestige-globe-256.png"],
  ["assets/brand/glyphs/vestige-globe-512.png", "public/brand/vestige-globe-512.png"],
  ["assets/brand/glyphs/vestige-globe-mono-ink-1024.png", "public/brand/vestige-globe-mono-ink-1024.png"],
  ["assets/brand/glyphs/vestige-globe-mono-cream-1024.png", "public/brand/vestige-globe-mono-cream-1024.png"],
  ["assets/brand/app-icon/vestige-appicon-default-1024.png", "public/brand/vestige-appicon-1024.png"],
  ["assets/brand/app-icon/vestige-appicon-default-256.png", "public/brand/vestige-appicon-256.png"],
  ["assets/brand/app-icon/vestige-appicon-default-128.png", "public/brand/vestige-appicon-128.png"],
];

for (const [from, to] of copies) {
  const dest = join(root, to);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(kit, from), dest);
  console.log(`${from} -> ${to}`);
}
