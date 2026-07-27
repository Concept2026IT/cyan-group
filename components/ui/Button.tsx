import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

/**
 * BRIEF §8.3, §9.2, §10.4.
 *
 * There is deliberately no white-on-cyan variant. White on #00AEEF is 2.53:1,
 * which fails both the 4.5:1 body threshold and the 3:1 large-text one. The
 * primary action is black on cyan at 8.3:1. If white text on a cyan field is
 * ever wanted, the field has to be --cyan-deep — that is the `onDark`
 * secondary, not a new primary.
 *
 * `surface` describes the background the button sits on, not the button
 * itself. Black sections and light sections need different quiet variants;
 * primary is identical on both, which is the point of one learnable action
 * colour sitewide.
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
        /* Every primary CTA is a cyan fill (§8.3). Hover is a background
           shift only — no movement, per §9.2. */
        primary: "bg-cyan text-black hover-fine:bg-cyan-deep hover-fine:text-paper",
        secondary: "border-2 bg-transparent",
        ghost: "bg-transparent underline-offset-4 hover-fine:underline",
      },
      surface: {
        light: "",
        dark: "",
      },
      size: {
        sm: "h-10 px-4 text-14",
        md: "h-12 px-6 text-16",
        lg: "h-14 px-8 text-18",
      },
    },
    compoundVariants: [
      /* Quiet variants take their colour from the surface so contrast holds
         both ways. On light, small text uses --cyan-deep (5.05:1); cyan
         itself would be 2.53:1 and is not permitted for text here. */
      {
        variant: "secondary",
        surface: "light",
        class:
          "border-cyan-deep text-cyan-deep hover-fine:bg-cyan-deep hover-fine:text-paper",
      },
      {
        variant: "secondary",
        surface: "dark",
        class: "border-cyan text-cyan hover-fine:bg-cyan hover-fine:text-black",
      },
      {
        variant: "ghost",
        surface: "light",
        class: "text-cyan-deep",
      },
      {
        variant: "ghost",
        surface: "dark",
        class: "text-cyan",
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
