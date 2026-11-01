# DESIGN.md — dessoyracing.com design system

Read this before touching any HTML or CSS. All tokens live in **`css/tokens.css`** (the only `:root` block). Every page links it before its own inline `<style>`. If a value you need isn't a token, add one there — don't hard-code it in a page.

The brand look: bold, high-contrast racing feel — deep navy and near-black surfaces, one strong red accent, generous white cards on a pale mint background.

## 1. Colour tokens

| Token | Value | Use |
|---|---|---|
| `--primary` | `#e63946` | Brand red: buttons, links on hover, accents, prices |
| `--secondary` | `#1d3557` | Navy: headings, header gradient, dark sections |
| `--accent` | `#f1faee` | Pale mint: section/card backgrounds |
| `--dark` | `#0a0a0a` | Near-black: header start, footer |
| `--light` | `#ffffff` | White: cards, text on dark |
| `--ink` `#333` / `--ink-strong` `#444` / `--ink-soft` `#555` / `--ink-muted` `#666` / `--ink-faint` `#999` | | Body → secondary → placeholder text |
| `--line` `#ddd` / `--line-soft` `#eee` / `--line-strong` `#ccc` / `--surface` `#f5f5f5` | | Borders and neutral surfaces |
| `--success` / `--warning` | | Status colours (success/cancel pages) |
| `--alert-success-*` / `--alert-danger-*` | | Message boxes (`-bg`, `-text`, `-border`) |
| `--gold` / `--silver` / `--bronze` | | Fan-club tier colours |

Brand colours (`--primary`, `--secondary`, `--accent`, `--dark`, `--light`) are fixed. Extend with new tokens; never replace them.

## 2. Typography

- Font: `var(--font-sans)` — the system UI font (SF Pro on Mac/iPhone, Segoe UI on Windows, Roboto on Android). To adopt a self-hosted web font later, change that one token and add its `@font-face`.
- Scale: `--text-sm` 0.875rem · `--text-base` 1rem · `--text-lg` 1.125rem · `--text-xl` 1.5rem · `--text-2xl` 2rem · `--text-hero` `clamp(2.5rem, 7vw, 4rem)` (hero headline/subtitle only).
- Body line-height 1.6. Headings use `--secondary`; text on dark uses `--light`.

## 3. Spacing, radius, shadow

- Spacing scale (use for new CSS): `--space-1` 0.25rem · `-2` 0.5 · `-3` 0.75 · `-4` 1 · `-5` 1.5 · `-6` 2 · `-7` 3 · `-8` 4rem.
- Radius: `--radius-sm` 5px (inputs, small buttons) · `--radius` 10px (cards, images) · `--radius-lg` 15px (large panels, popup) · `--radius-pill` 50px (buttons).
- Shadow: `--shadow-card` (resting card) · `--shadow-header` · `--shadow-lift` (hover/raised).

## 4. Component patterns

**Header / nav** — `<header>` with the `.header-content` row (logo left, `nav` right). Markup comes from `nav.js` (`renderNav`); never hardcode it. On `index.html` the header is fixed and translucent with `backdrop-filter: blur(12px)`, falling back to a solid navy gradient via `@supports`. The hamburger is a `<button>` (see CLAUDE.md).

**Hero** — `.hero` → `.hero-background` (responsive WebP background with `var(--hero-overlay)` on top for text contrast) + `.hero-content` (`h1`, subtitle, `.cta-button`, `.hero-contact`). Text stays white; keep the overlay so contrast stays ≥ 4.5:1. The three hero backgrounds are preloaded with `fetchpriority="high"` in `<head>`.

**Button (`.cta-button`)** — pill (`--radius-pill`), `--primary` fill, white bold text, 2px primary border. Hover: transparent fill, lifts 3px with a soft red shadow.

**Card (`.blog-card`, `.sponsor-card`, `.benefit-card`)** — white (`--light`), `--radius`, `--shadow-card`, `overflow: hidden`. Cards fade up on scroll (`.reveal`, see §6).

**Sponsor grid** — `.sponsors-grid` (auto-fill columns, min 300px) of `.sponsor-card`s. Each card's logo sits in `.sponsor-logo`: fixed 120px high, white tile with a 1px `--line` border, logo `object-fit: contain`. On devices with hover the logo is greyscale and turns to colour on hover/focus; touch devices show colour. A logo that needs a dark tile uses `.sponsor-logo--dark`. **Do not** inline per-logo sizes or backgrounds.

**Partnership / info panel (`.partnership-section`)** — `--accent` background, `--radius`, 5px `--primary` left border.

## 5. Images — the `<picture>` pattern

Originals live in `images-src/` and are never edited. `python3 tools/optimise_images.py` writes web copies to `images/optimised/`; **every new image goes through it** (see `.claude/skills/optimize-image` and CLAUDE.md).

Photo:

```html
<picture>
  <source type="image/avif" srcset="images/optimised/NAME-480.avif 480w, images/optimised/NAME-960.avif 960w, images/optimised/NAME-1600.avif 1600w" sizes="(min-width: 1000px) 33vw, 100vw">
  <source type="image/webp" srcset="images/optimised/NAME-480.webp 480w, …-960.webp 960w, …-1600.webp 1600w" sizes="(min-width: 1000px) 33vw, 100vw">
  <img src="images/optimised/NAME-960.jpg" srcset="…-480.jpg 480w, …-960.jpg 960w, …-1600.jpg 1600w" sizes="(min-width: 1000px) 33vw, 100vw"
       width="960" height="640" alt="Describe the photo" loading="lazy" decoding="async">
</picture>
```

- Every `<img>` has `alt`, `width` and `height` (the real pixel size of the file in `src`, to stop layout shift). If CSS caps the width, add `height: auto` to the style.
- Below the fold: `loading="lazy" decoding="async"`. Above the fold (header logo, hero strip, first image on a page): no `loading="lazy"`.
- CSS backgrounds: a plain `url()` fallback line, then `background-image: image-set(url(x.avif) type('image/avif'), url(x.webp) type('image/webp'), url(x.jpg) type('image/jpeg'))`.
- Logos: one `images/optimised/NAME.webp` (≤ 60 KB, ≤ 800 px). SVGs stay as they are.
- No generated or committed image over 200 KB (`tools/check_site.py` enforces this; a few known exceptions are listed in its baseline).

## 6. Motion

- Scroll fade-in: add nothing by hand — `index.html` adds `.reveal` to cards and an IntersectionObserver reveals them. It is off under `prefers-reduced-motion` and content is visible without JavaScript.
- Transitions are short (0.3 s) and limited to colour, transform and opacity. Honour `@media (prefers-reduced-motion: reduce)`.

## 7. Do and don't

**Do**
- Use tokens (`var(--primary)`, `var(--radius)`, `var(--shadow-card)`, `var(--font-sans)`).
- Match the page you're editing; CSS stays inline per page, tokens come from `css/tokens.css`.
- Run `python3 tools/check_site.py` and `python3 scripts/site-check.py` before committing.
- Check changes at 390, 820 and 1440 px.
- Escape anything from `data/*.json` (`escapeHtml()` / `safeUrl()`).

**Don't**
- Don't hard-code hex colours, new radii or shadows in a page.
- Don't commit a raw photo over 200 KB or put an image in `images/` without running the optimiser.
- Don't add third-party scripts (analytics, Stripe and Mailchimp excepted and untouched) without asking.
- Don't hardcode the nav or footer; they come from `nav.js` / `footer.js`.
- Don't use `<div onclick>` for buttons, or an `<img>` without `alt`/`width`/`height`.

## 8. Scope notes

- `card/index.html` and `policies/*.html` have their own deliberate designs and are not covered by the checker or tokens.
- Only `index.html` has the Phase 2 polish (fixed blurred header, hero overlay, scroll fade-in). Other pages share the tokens and font but keep their simpler static header.
- To-do: create white-background versions of the sponsor logos (Apple creator tools) to enable a white-on-dark sponsor-tile option.
