"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * BRIEF §9.2 — digits roll to value on scroll into view, once, 800ms,
 * --ease-out. Job: makes scale land.
 *
 * "Once" is enforced by disconnecting the observer after the first
 * intersection, so scrolling back up doesn't replay it. Under reduced motion
 * the final value is rendered immediately with no roll (§9.4).
 */
export type StatProps = {
  value: number;
  /** e.g. "25", rendered as "25+" */
  suffix?: string;
  prefix?: string;
  label: string;
  className?: string;
  tone?: "light" | "dark";
};

export function Stat({
  value,
  suffix,
  prefix,
  label,
  className,
  tone = "light",
}: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDisplayValue(value);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className={cn("flex flex-col gap-2", className)}>
      <p className="text-52 font-extrabold lg:text-72">
        {prefix ? <span aria-hidden="true">{prefix}</span> : null}
        <NumberFlow
          value={displayValue}
          transformTiming={{ duration: 800, easing: "cubic-bezier(0.23,1,0.32,1)" }}
          willChange
        />
        {suffix ? <span aria-hidden="true">{suffix}</span> : null}
      </p>
      <p
        className={cn(
          "font-mono text-12 tracking-widest uppercase",
          tone === "dark" ? "text-cyan" : "text-cyan-deep",
        )}
      >
        {label}
      </p>
    </div>
  );
}
