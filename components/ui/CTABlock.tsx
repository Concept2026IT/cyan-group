import { Button } from "./Button";
import { cn } from "@/lib/cn";

/**
 * BRIEF §6.1 (CTA block: book a discovery call + "not ready? get the
 * capability pack") and CLAUDE.md hard rules 1 and 2.
 *
 * The primary label is not a prop. Hard rule 1 says the primary CTA is always
 * "Book a discovery call" — never "Get started", never "Learn more", never
 * "To products" — and audit item 2 identifies the current "TO PRODUCTS" hero
 * button as the positioning problem expressed in one button. Making the label
 * unpassable is the cheapest way to stop that regressing.
 *
 * The secondary action is capture, not conversion: someone who isn't ready to
 * talk leaves an email for the capability pack instead of leaving entirely.
 */
export type CTABlockProps = {
  heading: string;
  body?: string;
  /** Capture fallback for visitors not ready to book. */
  secondary?: { label: string; href: string };
  tone?: "black" | "cyan" | "stock";
  className?: string;
};

export function CTABlock({
  heading,
  body,
  secondary,
  tone = "black",
  className,
}: CTABlockProps) {
  const isDark = tone === "black";
  const isCyan = tone === "cyan";

  return (
    <div
      className={cn(
        "rounded-2xl p-8 lg:p-14",
        isDark && "bg-black text-paper",
        isCyan && "bg-cyan text-black",
        tone === "stock" && "bg-stock text-ink",
        className,
      )}
    >
      <h2 className="max-w-(--container-measure) text-38 font-extrabold uppercase lg:text-52">
        {heading}
      </h2>

      {body ? (
        <p
          className={cn(
            "mt-6 max-w-(--container-measure) text-18",
            isDark && "text-paper/80",
            isCyan && "text-black/80",
            tone === "stock" && "text-ink/80",
          )}
        >
          {body}
        </p>
      ) : null}

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button
          href="/book-a-call/"
          size="lg"
          variant={isCyan ? "secondary" : "primary"}
          surface={isCyan ? "light" : "dark"}
        >
          Book a discovery call
        </Button>

        {secondary ? (
          <Button
            href={secondary.href}
            size="lg"
            variant="ghost"
            surface={isDark ? "dark" : "light"}
          >
            {secondary.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
