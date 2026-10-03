/**
 * The studio's mark — "the lean", two rounded beams leaning together —
 * so the footer's studio attribution carries Pinehollow's own sigil, not
 * just its name. Geometry mirrors MARK_BEAMS in the studio site's
 * components/mark.tsx (64u grid); keep the two in step if it ever changes.
 */
export function PinehollowMark({ size = 14, colour = "currentColor" }: { size?: number; colour?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect x="14" y="5" width="15" height="52" rx="7.5" transform="rotate(22 21.5 31)" fill={colour} />
      <rect x="34" y="15" width="14.5" height="42" rx="7.25" transform="rotate(-24 41.25 36)" fill={colour} opacity={0.55} />
    </svg>
  );
}
