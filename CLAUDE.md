# Cyan Group — cyan-group.com

## What this is

A rebuild of cyan-group.com for Cyan Group: branded merchandise and print management, 25+ years, UK.

**The commercial goal drives every decision.** The site exists to convert marketing managers, brand leads and procurement specialists who spend £5,000+ a year on merchandise and print. It is not a product catalogue. When a judgement call comes up, ask: *does this help a programme buyer trust us and book a call?* If not, cut it.

The full brief is at `docs/BRIEF.md`. Read it before starting any new page or template. Section references below (§5, §9 etc.) point there.

## Stack

- Next.js 15, App Router, TypeScript (strict)
- Tailwind CSS + `cva` for component variants + `clsx`
- `base-ui` for accessible primitives (dialog, popover, accordion)
- `motion` for scroll-linked and interruptible animation only — CSS transitions for everything else
- `NumberFlow` for stat counters
- `Sonner` for toasts
- Sanity (headless CMS)
- Deployed on Vercel

## Commands

```bash
pnpm dev          # local dev
pnpm build        # production build — must pass before any commit
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
```

Run `pnpm build` and `pnpm typecheck` before saying a task is done.

Pinned to Next.js 15.5.22 per the brief. Next 16 is available and is a
deliberate not-yet — raise it as a decision rather than upgrading in passing.

## Layout

```
app/                    App Router routes
  (marketing)/          public pages
  api/                  route handlers
components/
  ui/                   primitives (Button, Card, Accordion…)
  sections/             page sections (Hero, ProofStrip, ProcessSteps…)
  layout/               Header, Footer, MobileNav
lib/                    utils, Sanity client, schema helpers
sanity/                 CMS schemas
docs/BRIEF.md           the full brief — source of truth
```

## Design tokens

Defined as CSS custom properties in `app/globals.css`, surfaced through Tailwind config. **Never hardcode a hex value in a component.**

```css
--black:      #000000;  /* nav, hero fields, dark sections */
--cyan:       #00AEEF;  /* rules, labels, active states, icon fills, outline strokes */
--cyan-deep:  #0076A8;  /* small text + links on light backgrounds (AA-safe) */
--cyan-wash:  #E2F4FC;  /* tinted panels, cards, form fields */
--ink:        #0E1113;  /* body text on light */
--stock:      #F4F6F7;  /* light section background */
--paper:      #FFFFFF;  /* cards, elevated surfaces */
--alert:      #D4007E;  /* functional only — form errors, destructive confirms */
```

Tokens live in `app/globals.css` under `@theme`. Tailwind's default palette and
type scale are cleared there (`--color-*: initial`, `--text-*: initial`), so an
off-palette utility like `text-red-500` or an off-scale `text-sm` does not exist
in the build — the lockdown is enforced at build time, not at review time.

**Colour lockdown:** black, white, cyan, two neutrals, one alert colour. That is the entire palette — it is the catalogue's palette. No purple, no red, no pink, no rainbow, no CMYK gradient bars. If a design need seems to require another colour, it doesn't — re-read §8.3.

**Contrast rule:** `--cyan` is a *field* colour. Never use it for small text on light backgrounds — use `--cyan-deep`. **Text on a cyan field is black, never white** — see the Button hierarchy below. Where white text on a cyan field is genuinely wanted, the field must be `--cyan-deep` (5.05:1 with white); §10.4 of the brief calls that `--cyan-dark`, which is defined nowhere, so treat it as a typo for `--cyan-deep` rather than adding a fourth cyan.

Deviations from the brief's literal values, and the measurements behind them, are recorded in [docs/BUILD-DECISIONS.md](docs/BUILD-DECISIONS.md). Read it before changing a token.

## Typography

- **Poppins** — display (700/800, uppercase, negative tracking, line-height 1.0) and body (400/500, line-height 1.6)
- **Geist Mono** — captions, stats, section labels, spec detail
- Both self-hosted via `next/font`, variable, Latin subset, preloaded
- Poppins at four weights maximum: 400, 500, 700, 800
- Body copy **always left-aligned** over two lines. Max measure 68 characters
- Type scale: `12 / 14 / 16 / 18 / 21 / 28 / 38 / 52 / 72 / 96`

### The solid/outline device

Cyan's signature type treatment: in a headline, the **subject** is solid and the **category** is outlined. `BRANDED` solid, *MERCH &* outlined. Outline uses `-webkit-text-stroke` in `--cyan` with a `paint-order: stroke fill` fallback. This is a brand rule, not decoration — apply it consistently.

## Button hierarchy

**Cyan fill is scarce: one per page, maximum.** It is reserved for the single highest-value action on that page — always the discovery call.

| Variant | Style | Use |
|---|---|---|
| `primary` | Cyan fill, **black text** (8.3:1) | The discovery call. Once per page |
| `secondary` | Black fill, white text | Every other real action |
| `ghost` | Transparent, cyan border and label | Tertiary — "browse the catalogue", filters, in-page nav |

There is **no white-on-cyan variant** — it measures 2.53:1 and fails AA outright.

If cyan fill appears twice on one screen, the hierarchy has collapsed. Cyan gets its presence from outline headings and selective-cyan photography, not from button fills.

## Images

- Static brand assets only in `/public` (logo SVGs, favicons, OG fallbacks). **Never commit the image library.**
- Everything else lives in Sanity's asset CDN with on-the-fly transforms
- Always `next/image`, explicit dimensions, AVIF/WebP, responsive `sizes`
- Alt text is a required field in Sanity — never ship an image without it
- Selective-cyan treatment is applied by hand to a curated set, never automated. Product photography stays full colour.

## Motion

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);     /* entering, exiting */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* mobile nav */
```

Rules:

- Every animation in §9.2 has a stated purpose. **Do not add animations that aren't in that table.**
- Never `ease-in` on UI. Never `transition: all`. Never animate from `scale(0)` — enter from `scale(0.96)` + `opacity: 0`.
- Nothing interactive animates for longer than 300ms.
- Hover effects gated behind `@media (hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion: reduce` keeps opacity and colour, removes all transforms, skips the hero sequence.
- Prefer CSS transitions. Reach for `motion` only when the animation is scroll-linked or must be interruptible.

Explicitly forbidden: parallax, autoplaying hero video, scroll-jacking, text scramble, animated gradient meshes, 3D.

## Photography

**Selective cyan is the signature treatment.** Contextual images are black-and-white with exactly one element restored to cyan — one, never two. Product and merchandise photography stays full colour.

## Every page needs

- Exactly one `<h1>`, descriptive and keyword-bearing
- Title tag ≤60 chars, meta description ≤155, written for a human to click
- Self-referencing canonical
- Appropriate schema (`Service`, `FAQPage`, `BreadcrumbList`, `Article`)
- Links up to its pillar, sideways to two siblings, down to at least one case study. **No orphan pages.**

## Every component ships with

Default, hover, active, focus-visible and disabled states. Focus ring is 2px `--cyan` at 2px offset. Not added later — with it.

## Hard rules

1. The primary CTA is always **"Book a discovery call"**. Never "Get started", never "Learn more", never "To products".
2. Never send the primary CTA off-domain to the catalogue. Browsing products is always secondary.
3. No hardcoded colours, spacing or font sizes — tokens only.
4. No `localStorage` or `sessionStorage`. This rule stands, so the §8.4 hero outline draw runs **once per page load**, not once per session — "once per session" is not implementable without storage, and the rule wins.
5. Images always via `next/image` with explicit dimensions.
6. Real `<label>` elements on every form field. Errors announced via `aria-live`.
7. WCAG 2.1 AA is a floor, not a target.
8. Performance budget: LCP < 2.0s, INP < 200ms, CLS < 0.05, JS < 180KB gzipped on landing routes, Lighthouse ≥95 mobile.
9. If the brief is silent, follow §8 (design) and §9 (motion) rather than reaching for a framework default.
10. Ask before introducing a new dependency.
