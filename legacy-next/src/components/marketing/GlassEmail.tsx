"use client";

import { useActionState, useEffect, useRef, useSyncExternalStore } from "react";
import { joinWaitlist, type JoinWaitlistState } from "@/app/actions";
import { accentFor, type Palette } from "./palette";
import { useMagnetic } from "./hooks";

const initial: JoinWaitlistState = { status: "idle" };

// The `?from=` tag never changes within a page's lifetime, so the "store"
// never notifies; the snapshot is read once per render and the string
// compares stably. (try/catch: URLSearchParams on a hostile search string.)
const subscribeNever = () => () => {};
const readSourceTagServer = () => "";
const readSourceTag = () => {
  try {
    const from = new URLSearchParams(window.location.search).get("from");
    return from ? from.trim().toLowerCase().slice(0, 40) : "";
  } catch {
    return "";
  }
};

type GlassEmailProps = {
  palette?: Palette;
  size?: "lg" | "md";
  placeholder?: string;
  cta?: string;
};

/**
 * Email pill — wired to the joinWaitlist Server Action via useActionState.
 * Visual port of marketing-motion.jsx :: GlassEmail; sent-state derived
 * from the action's return value rather than local useState.
 */
export function GlassEmail({
  palette = "mint",
  size = "lg",
  placeholder = "you@example.co.uk",
  cta = "Join the list",
}: GlassEmailProps) {
  const acc = accentFor(palette);
  const [state, action, pending] = useActionState(joinWaitlist, initial);

  // Where did this visitor come from? Read the `?from=` tag off the URL and
  // ride it along with the signup via a hidden field. The tag is client-only
  // (server snapshot is ""; React re-renders with the real value right after
  // hydration — no mismatch). It must flow through React as the input's value,
  // not be written straight to the DOM: React 19 re-asserts <form action>
  // input values after hydration, wiping anything written behind its back.
  // Empty/unknown is normalised to "organic" server-side. See src/lib/sources.ts.
  const source = useSyncExternalStore(
    subscribeNever,
    readSourceTag,
    readSourceTagServer
  );
  const sent = state.status === "ok";
  const error = state.status === "error" ? state.message : null;
  const tall = size === "lg" ? 64 : 54;
  // CTA leans toward the cursor while the pointer roams the pill — a
  // few px only, so it never crowds the email field beside it.
  const magRef = useMagnetic<HTMLButtonElement>(0.14, ".fw-email", 7);

  // On a successful submit the on-screen keyboard has pushed the page down,
  // and on mobile closing it can leave the page scrolled — which fades the
  // hero behind its scroll-exit effect. Dismiss the keyboard and re-center
  // the form so the success message sits where the field was.
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!sent) return;
    (document.activeElement as HTMLElement | null)?.blur?.();
    const t = setTimeout(() => {
      formRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 250);
    return () => clearTimeout(t);
  }, [sent]);

  return (
    <form
      ref={formRef}
      action={action}
      className={`fw-email fw-email-${size}`}
      data-sent={sent ? "1" : "0"}
    >
      <input type="hidden" name="source" value={source} readOnly />
      <div
        className="fw-email-glow"
        style={{
          background: `linear-gradient(120deg, ${acc.a} 0%, ${acc.b} 50%, ${acc.a} 100%)`,
        }}
      />
      <div className="fw-email-shell" style={{ height: tall }}>
        {sent ? (
          <span className="fw-email-sent-msg">You’re on the list.</span>
        ) : (
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={placeholder}
            disabled={pending}
          />
        )}
        <button
          ref={magRef}
          type="submit"
          disabled={sent || pending}
          style={{
            background: sent
              ? "transparent"
              : `linear-gradient(135deg, ${acc.a}, ${acc.b})`,
            color: sent ? acc.a : acc.on,
            border: sent ? `1px solid ${acc.a}55` : 0,
            boxShadow: sent
              ? "none"
              : `0 10px 30px -8px ${acc.a}80, inset 0 1px 0 rgba(255,255,255,0.4)`,
          }}
        >
          <span className="fw-email-cta-text">
            {sent ? "✓ Joined" : pending ? "Joining…" : cta}
          </span>
          {!sent && !pending && <span className="fw-email-shimmer" />}
        </button>
      </div>
      {error && (
        <p
          role="alert"
          style={{
            marginTop: 10,
            fontFamily: "var(--font-ui)",
            fontSize: 12,
            color: "#E2664E",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}
      {sent && (
        <p
          role="status"
          style={{
            marginTop: 12,
            fontFamily: "var(--font-ui)",
            fontSize: 12.5,
            lineHeight: 1.5,
            color: "rgba(246,244,238,0.6)",
            textAlign: "center",
          }}
        >
          Check your junk or spam folder for our welcome email, and mark it
          “not spam” so we land in your inbox.
        </p>
      )}
    </form>
  );
}
