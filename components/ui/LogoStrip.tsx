"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * BRIEF §9.2 — continuous marquee, pauses on hover, linear. Job: ambient proof.
 *
 * This carries the client roster (DHL, Emirates, Hilton, UEFA Champions
 * League, Marriott, Lord's, Piccolino), which audit item 12 identifies as the
 * single most valuable asset on the site and which currently sits buried on a
 * sub-page. It belongs above the fold on the homepage.
 *
 * ACCESSIBILITY — one addition the brief does not specify. WCAG 2.2.2 (Pause,
 * Stop, Hide) is Level A: content that moves automatically, runs for more than
 * five seconds and sits alongside other content must have a pause mechanism.
 * "Pauses on hover" does not satisfy it, because it is unreachable by keyboard
 * and by touch. Since the brief makes WCAG 2.1 AA a floor, and AA subsumes A,
 * an explicit control is required rather than optional. It is styled quietly
 * so it stays out of the way of the proof it sits under.
 *
 * The list is rendered twice — once for real, once aria-hidden — so the
 * translateX(-50%) loop is seamless without announcing every logo twice.
 */
export type LogoStripProps = {
  children: ReactNode;
  /** Accessible description of what the strip is showing. */
  label: string;
  className?: string;
};

export function LogoStrip({ children, label, className }: LogoStripProps) {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);

    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* Under reduced motion the strip is simply a static row, so a pause control
     would be controlling nothing. */
  const isAnimated = !reducedMotion;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        className="marquee-pause overflow-hidden"
        role="region"
        aria-label={label}
      >
        {/* Play state is set inline rather than via a utility class: the
            .marquee rule uses the `animation` shorthand, which resets
            animation-play-state to running and wins on source order, so a
            class-based pause silently did nothing. */}
        <div
          className={cn("flex w-max items-center gap-16", isAnimated && "marquee")}
          style={
            isAnimated
              ? { animationPlayState: paused ? "paused" : "running" }
              : undefined
          }
        >
          <div className="flex shrink-0 items-center gap-16">{children}</div>
          <div className="flex shrink-0 items-center gap-16" aria-hidden="true">
            {children}
          </div>
        </div>
      </div>

      {isAnimated ? (
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className={cn(
            "self-start px-2 py-1 font-mono text-12 tracking-widest uppercase",
            "text-ink/60 underline-offset-4 hover:text-cyan-deep hover:underline",
            "transition-colors duration-200 ease-[var(--ease-out)]",
          )}
        >
          {paused ? "Resume" : "Pause"}
          <span className="sr-only"> scrolling client list</span>
        </button>
      ) : null}
    </div>
  );
}
