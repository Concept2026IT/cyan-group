# Build decisions

Where the build departs from the literal text of `BRIEF.md`, and why — with the
measurement behind each one.

**Why this file exists.** `BRIEF.md` is a verbatim mirror of the client's
document and gets replaced wholesale when a new version arrives. Notes written
into it, or into `CLAUDE.md`, are lost on the next refresh — that has already
happened once. Decisions live here instead, so a refresh is a straight copy with
nothing to merge.

**Status key:** ✅ adopted into the brief · ⚠️ still deviating · ℹ️ erratum

---

## ✅ Text on a cyan field is black, not white

The brief originally said white on `--cyan` was "fine at 18px+ or bold". It
isn't. `#00AEEF` has a relative luminance of 0.365, so white on it measures
**2.53:1** — below the 4.5:1 body threshold _and_ below the 3:1 large-text one.
Black on cyan is **8.30:1**.

Adopted into the July 2026 revision, which now states the rule and the 2.53:1
figure directly. Encoded in the `Button` cva variants so a white-on-cyan variant
is unreachable rather than merely discouraged.

## ✅ Cyan fill is rationed, not the default for every CTA

Superseded by the same revision: cyan fill is now one per page, reserved for the
discovery call, with `secondary` as black fill and `ghost` as a cyan outline.

## ⚠️ `--alert` is `#D4007E`, not `#EC008C`

The brief's `#EC008C` measures **4.25:1** on `--paper` and **3.92:1** on
`--stock`. It is specified for form error text, which is body size by
definition, so it fails SC 1.4.3 in the one place it is used.

`#D4007E` measures **5.12:1** on paper and **4.72:1** on stock, and works as
text, border and field from a single token — so this stays one colour, not two,
and the §8.3 lockdown is unaffected.

The July 2026 revision still carries `#EC008C`. Treating that as an oversight
rather than a reversal, since the same revision adopted the white-on-cyan
finding. **Revert if that is wrong** — it is a one-line change in
`app/globals.css` and `CLAUDE.md`.

## ⚠️ Focus ring is `--cyan-deep` on light surfaces

The brief specifies a 2px `--cyan` focus ring sitewide. Cyan on white is
**2.53:1**, under the 3:1 that SC 1.4.11 requires for non-text contrast — the
ring would be barely visible on exactly the surfaces where it matters.

`--cyan-deep` on white is **5.05:1**. Black sections keep the `--cyan` ring at
8.3:1, as specified.

## ⚠️ Hero outline draw runs once per page load, not once per session

§8.4 says "once per session". Hard rule 4 bans `localStorage` and
`sessionStorage`, and session persistence is not implementable without one.
The hard rule wins.

## ⚠️ `secondary` inverts on dark surfaces

The hierarchy table gives `secondary` as black fill with white text. On a black
section that is invisible, so on `surface="dark"` it inverts to a white fill
with black text — 21:1 either way. This is the dark-section equivalent of the
specified style, not a fourth variant.

A `surface="cyan"` is also provided for buttons on a full-bleed cyan field,
where cyan borders and labels vanish (`--cyan-deep` on `--cyan` is **2.0:1**).
Quiet variants go black there, at 8.3:1.

## ⚠️ WCAG 2.2.2 pause control on the logo marquee

§9.2 specifies "marquee, pauses on hover". Hover is unreachable by keyboard and
by touch, and SC 2.2.2 (**Level A**, so inside the AA floor hard rule 7 sets)
requires a pause mechanism for content that moves automatically for more than
five seconds. `LogoStrip` ships an explicit toggle, hidden under
`prefers-reduced-motion` where the strip is static anyway.

## ⚠️ `.outline-type` fallback

`color: transparent` with an unsupported `-webkit-text-stroke` renders the word
invisible rather than unstyled — it would silently delete half of every hero
headline. The rule is guarded behind `@supports`, falling back to solid cyan.

## ⚠️ Tailwind defaults cleared

`--color-*: initial` and `--text-*: initial` in `app/globals.css` remove
Tailwind's stock palette and type scale, so `text-red-500` and `text-sm` do not
exist in the build. Enforces the §8.3 lockdown and the closed type scale at
build time rather than at review time.

## ⚠️ Next.js pinned to 15

The brief specifies Next.js 15; the build is on 15.5.22. Next 16.2.12 is
available. Deliberate not-yet — raise as a decision, don't upgrade in passing.

---

## ℹ️ Errata in `BRIEF.md`

Not corrected in the file, so it stays a clean mirror of the client's copy.

| Location                | Issue                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| §14, build order step 1 | Cites "§8.2" for the token system; tokens are in **§8.3**                                                                                                    |
| §10.4                   | Uses `--cyan-dark`, which is defined nowhere. Treat as `--cyan-deep`                                                                                         |
| §8.3                    | Calls Poppins "available as a variable font". On Google Fonts it ships as static cuts, so four weights means four files — it counts against the §10.3 budget |
