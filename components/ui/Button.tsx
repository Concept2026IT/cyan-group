import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

/**
 * BRIEF §8.3, §9.2, §10.4 and the CLAUDE.md "Button hierarchy" table.
 *
 *   primary   — cyan fill, black text (8.3:1). The discovery call. ONCE per page.
 *   secondary — black fill, white text (21:1). Every other real action.
 *   ghost     — transparent, cyan border and label. Tertiary.
 *
 * Cyan fill is scarce and therefore loud. If it appears twice on a screen it
 * stops meaning "this is the thing to do" and starts meaning "this site is
 * blue". Cyan gets its presence from outline headings and selective-cyan
 * photography, not from button fills — so `primary` is rationed, not default.
 *
 * There is deliberately no white-on-cyan variant: 2.53:1 fails AA outright.
 *
 * `surface` describes the background the button sits on, not the button
 * itself. Two variants need it:
 *   - secondary's black fill would vanish on a black section, so on dark
 *     surfaces it inverts to a white fill with black text (21:1 either way).
 *     The spec's "black fill, white text" is written for light sections; this
 *     is the dark-section equivalent, not a third style.
 *   - ghost's cyan label is 2.53:1 on light and fails as text, so on light
 *     surfaces the border and label use --cyan-deep (5.05:1).
 * primary is identical on both, which is what makes it learnable.
 */
const button = cva(
  [
    "btn-motion inline-flex items-center justify-center gap-2 text-center font-medium uppercase",
    "tracking-wide whitespace-nowrap select-none",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-40",
    "aria-disabled:pointer-events-none aria-disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        /* Hover is a background shift only — no movement, per §9.2. */
        primary:
          "bg-cyan text-black hover-fine:bg-cyan-deep hover-fine:text-paper",
        secondary: "",
        ghost: "border-2 bg-transparent",
      },
      surface: {
        light: "",
        dark: "",
        /* Sitting on a full-bleed --cyan field. Cyan borders and labels
           vanish here (cyan-deep on cyan is 2.0:1 and fails 1.4.11), so the
           quiet variants go black — 8.3:1 against the field. */
        cyan: "",
      },
      size: {
        sm: "h-10 px-4 text-14",
        md: "h-12 px-6 text-16",
        lg: "h-14 px-8 text-18",
      },
    },
    compoundVariants: [
      {
        variant: "secondary",
        surface: "light",
        class: "bg-black text-paper hover-fine:bg-cyan-deep",
      },
      {
        variant: "secondary",
        surface: "dark",
        class: "bg-paper text-black hover-fine:bg-cyan-wash",
      },
      {
        variant: "ghost",
        surface: "light",
        class:
          "border-cyan-deep text-cyan-deep hover-fine:bg-cyan-deep hover-fine:text-paper",
      },
      {
        variant: "ghost",
        surface: "dark",
        class: "border-cyan text-cyan hover-fine:bg-cyan hover-fine:text-black",
      },
      {
        variant: "secondary",
        surface: "cyan",
        class: "bg-black text-paper hover-fine:bg-ink",
      },
      {
        variant: "ghost",
        surface: "cyan",
        class:
          "border-black text-black hover-fine:bg-black hover-fine:text-paper",
      },
    ],
    defaultVariants: {
      variant: "primary",
      surface: "light",
      size: "md",
    },
  },
);

type ButtonVariants = VariantProps<typeof button>;

type ButtonAsButton = ButtonVariants &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

type ButtonAsLink = ButtonVariants &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant,
  surface,
  size,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(button({ variant, surface, size }), className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props;
    return <Link href={href} className={classes} {...rest} />;
  }

  const { type = "button", ...rest } = props as ButtonAsButton;
  return <button type={type} className={classes} {...rest} />;
}

export { button as buttonVariants };
