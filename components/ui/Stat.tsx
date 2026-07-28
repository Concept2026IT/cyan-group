"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * BRIEF §9.2 — digits roll to value on scroll into view, once, 800ms,
 * --ease-out. Job: makes scale land.
 *
 * Structure: NumberFlow is handed a bare number and nothing else. Prefix and
 * suffix are separate spans, so no glyph is ever passed through the animator
 * and the light DOM stays readable. The whole stat is a single labelled unit
 * via role="img" + aria-label, which is what lets one complete phrase —
 * "25 plus years" — replace the fragments a screen reader would otherwise
 * stitch together. role="img" makes the element a leaf, so the decorative
 * digits inside are not announced separately.
 *
 * A non-numeric value ("Top 15%") is rendered static: there is nothing
 * meaningful to roll, and animating a string means animating nothing.
 *
 * "Once" is enforced by disconnecting the observer on first intersection, so
 * scrolling back up doesn't replay it. Under reduced motion the final value is
 * rendered immediately with no roll (§9.4).
 */
export type StatProps = {
  /** A number animates. A string renders static. */
  value: number | string;
  prefix?: string;
  suffix?: string;
  label: string;
  /**
   * Complete spoken phrase, e.g. "25 plus years". Composed from the parts when
   * omitted, expanding "+" to "plus" and "%" to "percent".
   */
  ariaLabel?: string;
  className?: string;
  tone?: "light" | "dark";
};

function speak(text: string) {
  return text
    .replace(/\+/g, " plus")
    .replace(/%/g, " percent")
    .replace(/\s+/g, " ")
    .trim();
}

export function Stat({
  value,
  prefix,
  suffix,
  label,
  ariaLabel,
  className,
  tone = "light",
}: StatProps) {
  const isNumeric = typeof value === "number";
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isNumeric) return;
    const node = ref.current;
    if (!node) return;

    /* If the roll can't or shouldn't run, show the real figure rather than a
       zero. A stat stuck at 0 is worse than one that never animated. */
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
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
  }, [value, isNumeric]);

  const written = isNumeric ? value.toLocaleString("en-GB") : value;
  const spoken =
    ariaLabel ?? speak(`${prefix ?? ""}${written}${suffix ?? ""} ${label}`);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={spoken}
      className={cn("flex flex-col gap-2", className)}
    >
      <p className="text-52 font-extrabold lg:text-72">
        {prefix ? <span>{prefix}</span> : null}
        {isNumeric ? (
          <NumberFlow
            value={displayValue}
            transformTiming={{
              duration: 800,
              easing: "cubic-bezier(0.23,1,0.32,1)",
            }}
            willChange
          />
        ) : (
          <span>{value}</span>
        )}
        {suffix ? <span>{suffix}</span> : null}
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
