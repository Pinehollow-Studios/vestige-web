#!/usr/bin/env bash
# Replace a 1206x2622 iPhone screenshot's status bar with the marketing
# standard: 9:41, full signal, full battery, no location arrow. The wifi
# glyph is kept as captured. Usage: clean-status-bar.sh in.png out.png
#
# Each old glyph is covered by a patch blended column by column from the
# pixel rows just above and below it, so the background (map, photo,
# plain dark) carries straight through.
set -euo pipefail
in="$1"; out="$2"
font="/System/Library/Fonts/SFNS.ttf"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

patch() { # name x y w h
  local n="$1" x="$2" y="$3" w="$4" h="$5"
  magick "$in" \
    \( -clone 0 -crop "${w}x1+${x}+$((y - 3))" +repage \) \
    \( -clone 0 -crop "${w}x1+${x}+$((y + h + 2))" +repage \) \
    -delete 0 -append -filter Triangle -resize "${w}x${h}!" -blur 0x1.5 "$tmp/$n.png"
}
patch a 118 70 210 56
patch b 856 74 72 48
patch c 1010 72 92 52

magick "$in" \
  "$tmp/a.png" -geometry +118+70 -composite \
  "$tmp/b.png" -geometry +856+74 -composite \
  "$tmp/c.png" -geometry +1010+72 -composite \
  -fill white -stroke none \
  -draw "roundrectangle 864,97 873,115 3,3" \
  -draw "roundrectangle 880,91 889,115 3,3" \
  -draw "roundrectangle 896,84 905,115 3,3" \
  -draw "roundrectangle 912,77 921,115 3,3" \
  -draw "roundrectangle 1017,79 1086,115 11,11" \
  -fill "rgba(255,255,255,0.45)" -draw "roundrectangle 1090,91 1095,103 2,2" \
  -fill white -stroke white -strokewidth 1.6 -font "$font" -pointsize 57 -annotate +134+117 "9:41" \
  "$out"
