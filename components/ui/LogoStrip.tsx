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
 * The list is rendered twice: once for real, once aria-hidden, so the
 * translateX(-50%) loop is seamless without announcing every logo to a screen
 * reader twice. Under reduced motion the animation collapses and the strip
 * becomes a static row.
 */
export type LogoStripProps = {
  children: ReactNode;
  /** Accessible description of what the strip is showing. */
  label: string;
  className?: string;
};

export function LogoStrip({ children, label, className }: LogoStripProps) {
  return (
    <div
      className={cn("marquee-pause group overflow-hidden", className)}
      role="region"
      aria-label={label}
    >
      <div className="marquee flex w-max items-center gap-16">
        <div className="flex shrink-0 items-center gap-16">{children}</div>
        <div className="flex shrink-0 items-center gap-16" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
