import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * BRIEF §8.2 (rounded-corner cards kept), §9.2 (split cards lift 4px on
 * hover, 220ms, --ease-out — state indication, not decoration).
 *
 * The lift is gated behind hover-fine so a tap on a touch device doesn't
 * leave the card stuck in a hover state (§9.4).
 */
const card = cva("relative rounded-2xl", {
  variants: {
    tone: {
      paper: "bg-paper text-ink",
      wash: "bg-cyan-wash text-ink",
      black: "bg-black text-paper",
      outline: "border border-ink/12 bg-transparent",
    },
    padding: {
      none: "",
      md: "p-6",
      lg: "p-8 lg:p-10",
    },
    interactive: {
      true: "lift-motion hover-fine:-translate-y-1",
      false: "",
    },
  },
  defaultVariants: { tone: "paper", padding: "lg", interactive: false },
});

type CardVariants = VariantProps<typeof card>;

export type CardProps = CardVariants & {
  children: ReactNode;
  className?: string;
  /**
   * When set the whole card becomes one click target via a stretched overlay
   * link.
   */
  href?: string;
  /**
   * ID of the card's heading. The stretched link takes its accessible name
   * from that heading via aria-labelledby.
   *
   * Prefer this over `linkLabel`. Passing the title as a string duplicates it:
   * the heading announces it once, then the link announces it again, so the
   * card reads its own title twice. Referencing the heading names the link
   * correctly and keeps exactly one copy in the accessible tree.
   */
  labelledBy?: string;
  /**
   * Fallback accessible name when the card has no heading to point at — a
   * purely visual card, say. Ignored when `labelledBy` is set.
   */
  linkLabel?: string;
};

export function Card({
  tone,
  padding,
  interactive,
  className,
  children,
  href,
  labelledBy,
  linkLabel,
}: CardProps) {
  const isLinked = href !== undefined;

  return (
    <div
      className={cn(
        card({ tone, padding, interactive: interactive ?? isLinked }),
        isLinked && "focus-within:outline focus-within:outline-offset-2",
        className,
      )}
    >
      {children}
      {isLinked ? (
        <Link
          href={href}
          className="absolute inset-0 rounded-2xl"
          aria-labelledby={labelledBy}
        >
          {labelledBy ? null : (
            <span className="sr-only">{linkLabel ?? "Read more"}</span>
          )}
        </Link>
      ) : null}
    </div>
  );
}
