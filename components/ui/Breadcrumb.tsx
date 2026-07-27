import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * BRIEF §7.4 — BreadcrumbList schema sitewide. §5 — every service page links
 * up to its pillar, so the breadcrumb is doing structural SEO work, not just
 * wayfinding.
 *
 * Emits the JSON-LD alongside the markup so the two can never drift apart.
 */
export type Crumb = {
  name: string;
  href: string;
};

export type BreadcrumbProps = {
  items: Crumb[];
  tone?: "light" | "dark";
  className?: string;
};

const SITE = "https://cyan-group.com";

export function Breadcrumb({
  items,
  tone = "light",
  className,
}: BreadcrumbProps) {
  const isDark = tone === "dark";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE}${item.href}`,
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-12 tracking-widest uppercase">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-2">
                {isLast ? (
                  <span
                    aria-current="page"
                    className={isDark ? "text-paper/60" : "text-ink/60"}
                  >
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className={cn(
                        "underline-offset-4 transition-colors duration-200 ease-[var(--ease-out)] hover:underline",
                        isDark ? "text-cyan" : "text-cyan-deep",
                      )}
                    >
                      {item.name}
                    </Link>
                    <span
                      aria-hidden="true"
                      className={isDark ? "text-paper/40" : "text-ink/40"}
                    >
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
