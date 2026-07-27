import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * BRIEF §8.3. Section boundaries are colour changes, not devices — black to
 * stock to black. The transition *is* the boundary. Minor boundaries get a
 * 1px cyan rule with a mono label in the margin. Those are the only two
 * boundary devices on the site; there is no divider graphic and no CMYK bar.
 */
const section = cva("relative", {
  variants: {
    tone: {
      /* Roughly 50% of the site's surface area. */
      black: "bg-black text-paper",
      stock: "bg-stock text-ink",
      paper: "bg-paper text-ink",
    },
  },
  defaultVariants: { tone: "paper" },
});

export type SectionProps = VariantProps<typeof section> & {
  children: ReactNode;
  /** Mono label sitting in the left margin, above the rule. */
  label?: string;
  /** 1px cyan rule marking a minor boundary. */
  rule?: boolean;
  /**
   * §8.3 — dark sections get a soft cyan edge-light so black doesn't read
   * flat. Only meaningful on `tone="black"`.
   */
  edgeLight?: boolean;
  className?: string;
  id?: string;
};

export function Section({
  tone = "paper",
  label,
  rule = false,
  edgeLight = false,
  className,
  id,
  children,
}: SectionProps) {
  const isDark = tone === "black";

  return (
    <section id={id} className={cn(section({ tone }), className)}>
      {edgeLight && isDark ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan to-transparent opacity-60"
        />
      ) : null}

      <div className="well rhythm">
        {label ? (
          <p
            className={cn(
              "font-mono text-12 tracking-widest uppercase",
              isDark ? "text-cyan" : "text-cyan-deep",
            )}
          >
            {label}
          </p>
        ) : null}

        {rule ? (
          <hr className="mt-4 h-px border-0 bg-cyan" aria-hidden="true" />
        ) : null}

        <div className={label || rule ? "mt-12" : undefined}>{children}</div>
      </div>
    </section>
  );
}
