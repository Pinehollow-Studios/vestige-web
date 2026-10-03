#!/usr/bin/env bash
# Regenerate every web icon from the iOS app's Icon Composer document.
#
# The app icon is authored once, in vestige-ios, as
# `Vestige/Resources/AppIcon.icon` — a layered document (navy gradient
# ground + a transparent 1024 globe) that iOS composites at display time.
# See vestige-ios/docs/app-icon.md. The website must never fork that
# artwork; it re-renders from it.
#
# Two derivations come out of the document:
#
#   the tile  — `ictool` renders the Default appearance exactly as a Home
#               Screen shows it, specular rim and contact shadow included.
#               Its corners are rounded and transparent, so for the Apple
#               touch icon and the maskable Android icon it is flattened
#               back onto the same navy gradient to square it off (iOS and
#               Android apply their own mask; a pre-rounded PNG double-rounds).
#
#   the glyph — the bare globe, cropped to its alpha bounding box, no ground.
#               This is the mark that sits beside the wordmark. Same crop the
#               app uses for BrandGlyph.
#
# Requires Xcode (for ictool) and ImageMagick. Run from the repo root:
#   ./scripts/build-brand-icons.sh
set -euo pipefail

IOS="${VESTIGE_IOS:-$(cd "$(dirname "$0")/../.." && pwd)/vestige-ios}"
ICON="$IOS/Vestige/Resources/AppIcon.icon"
ICTOOL="/Applications/Xcode.app/Contents/Applications/Icon Composer.app/Contents/Executables/ictool"

[ -d "$ICON" ] || { echo "No icon document at $ICON (set VESTIGE_IOS)"; exit 1; }
[ -x "$ICTOOL" ] || { echo "ictool not found — Xcode required"; exit 1; }
command -v magick >/dev/null || { echo "ImageMagick required (brew install imagemagick)"; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_PUBLIC="$ROOT/public/brand"
OUT_APP="$ROOT/src/app"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT_PUBLIC"

# ─── Render the tile as iOS shows it, and rebuild its ground ─────────
"$ICTOOL" "$ICON" --export-image --output-file "$TMP/tile.png" \
  --platform iOS --rendition Default --width 1024 --height 1024 --scale 1

# The fill from icon.json: a vertical linear gradient, #111F2D → #070A10.
magick -size 1024x1024 gradient:"#111F2D-#070A10" "$TMP/ground.png"
magick "$TMP/ground.png" "$TMP/tile.png" -composite -depth 8 "$TMP/square.png"
magick "$TMP/tile.png" -depth 8 "$TMP/rounded.png"

# ─── The glyph: the globe layer, cropped to its own edges ────────────
magick "$ICON/Assets/globe.png" -trim +repage -depth 8 "$TMP/glyph.png"

png() { magick "$1" -filter Lanczos -resize "$2x$2" -strip \
          -define png:compression-level=9 "$3"; }

# The mark beside the wordmark, and the same globe for email headers,
# which cannot use next/image and so needs a modest fixed size.
png "$TMP/glyph.png" 512 "$OUT_PUBLIC/vestige-globe.png"
png "$TMP/glyph.png" 128 "$OUT_PUBLIC/vestige-globe-128.png"

# The tile itself, for anywhere a full app icon is wanted.
png "$TMP/square.png" 1024 "$OUT_PUBLIC/vestige-app-icon.png"

# Web app manifest icons. `any` keeps the rounded corners; `maskable` is
# squared, because the platform crops it to its own shape.
png "$TMP/rounded.png" 192 "$OUT_PUBLIC/icon-192.png"
png "$TMP/rounded.png" 512 "$OUT_PUBLIC/icon-512.png"
png "$TMP/square.png"  512 "$OUT_PUBLIC/icon-maskable-512.png"

# Next's file conventions: app/icon.png, app/apple-icon.png, app/favicon.ico.
png "$TMP/rounded.png" 512 "$OUT_APP/icon.png"
png "$TMP/square.png"  180 "$OUT_APP/apple-icon.png"

# Multi-resolution .ico. 48 and 32 carry retina and Windows tiles; 16 is
# the non-retina tab. All three are the tile, so the identity never shifts.
for s in 16 32 48; do png "$TMP/rounded.png" $s "$TMP/ico-$s.png"; done
# No -colors: palette quantisation flattens the rounded corners' alpha to
# an opaque grey. A 32-bit BGRA .ico is understood everywhere that matters.
magick "$TMP/ico-16.png" "$TMP/ico-32.png" "$TMP/ico-48.png" "$OUT_APP/favicon.ico"

echo "Wrote:"
ls -l "$OUT_PUBLIC" "$OUT_APP/icon.png" "$OUT_APP/apple-icon.png" "$OUT_APP/favicon.ico"
