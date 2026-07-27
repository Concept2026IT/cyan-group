"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { cn } from "@/lib/cn";

/**
 * BRIEF §9.2 — height + opacity on click, 200ms, --ease-out. Job: prevents
 * jarring change. §6.2/§6.3 put an FAQ block on every pillar and service page,
 * and those blocks carry FAQPage schema, so the content must be in the DOM and
 * not conditionally mounted.
 *
 * base-ui handles focus management and the aria wiring; the trigger renders a
 * real <button> inside a heading so the FAQ is keyboard-navigable by default.
 */
export type AccordionItemData = {
  question: string;
  answer: string;
};

export type AccordionProps = {
  items: AccordionItemData[];
  tone?: "light" | "dark";
  className?: string;
};

export function Accordion({ items, tone = "light", className }: AccordionProps) {
  const isDark = tone === "dark";

  return (
    <BaseAccordion.Root className={cn("flex flex-col", className)}>
      {items.map((item) => (
        <BaseAccordion.Item
          key={item.question}
          className={cn(
            "border-b",
            isDark ? "border-paper/15" : "border-ink/12",
          )}
        >
          <BaseAccordion.Header className="m-0">
            <BaseAccordion.Trigger
              className={cn(
                "group flex w-full items-center justify-between gap-6 py-6 text-left",
                "text-21 font-medium",
                "transition-colors duration-200 ease-[var(--ease-out)]",
                isDark
                  ? "text-paper hover-fine:text-cyan"
                  : "text-ink hover-fine:text-cyan-deep",
              )}
            >
              {item.question}
              <span
                aria-hidden="true"
                className={cn(
                  "relative size-4 shrink-0",
                  isDark ? "text-cyan" : "text-cyan-deep",
                )}
              >
                <span className="absolute top-1/2 left-0 h-0.5 w-4 -translate-y-1/2 bg-current" />
                <span
                  className={cn(
                    "absolute top-0 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-current",
                    "transition-transform duration-200 ease-[var(--ease-out)]",
                    "group-data-[panel-open]:scale-y-0",
                  )}
                />
              </span>
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>

          <BaseAccordion.Panel className="accordion-panel">
            <p
              className={cn(
                "max-w-(--container-measure) pb-6 text-16",
                isDark ? "text-paper/80" : "text-ink/80",
              )}
            >
              {item.answer}
            </p>
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
}
