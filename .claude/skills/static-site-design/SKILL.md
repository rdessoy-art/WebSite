---
name: static-site-design
description: Guardrails for any HTML, CSS, JS or image change on dessoyracing.com — design tokens, image rules, accessibility and checks. Use whenever you edit a page, add a component, change styling, add an image, or touch nav/footer/popup files, even for a "small tweak". Reads DESIGN.md first and finishes with the 390/820/1440 px check and the site checkers.
---

# Static-site design guardrails

This site is plain static HTML on GitHub Pages: no build step, no framework. Look and feel is part of the product, so every change keeps to the design system.

## Before you change anything

1. **Read `DESIGN.md`** (colour/type/spacing/radius/shadow tokens, component patterns, the `<picture>` pattern, do's and don'ts). Tokens live in `css/tokens.css`.
2. Read the page you're editing and match its style. CSS stays inline per page; values come from tokens.

## Rules

- **CSS variables only.** No new hard-coded hex colours, radii or shadows — use or add a token in `css/tokens.css`.
- **Images:** every new image goes through `tools/optimise_images.py` (original in `images-src/`, output in `images/optimised/`). Never commit a raw image over 200 KB. See the `optimize-image` skill.
- **Every `<img>`** has `alt`, `width` and `height`, and is `loading="lazy" decoding="async"` unless it is above the fold. The hero image is never lazy.
- **No new third-party scripts** (fonts CDNs, widgets, trackers, libraries) without asking the user first. Stripe, Mailchimp and Google Analytics code is not edited.
- Keep nav and footer in `nav.js` / `footer.js`; keep the hamburger a `<button>`; escape feed data (`escapeHtml()` / `safeUrl()`). See `CLAUDE.md`.
- Respect `prefers-reduced-motion` for any new animation, and keep text contrast at WCAG AA (4.5:1 body, 3:1 large).
- If something here conflicts with `CLAUDE.md` or another skill, flag it to the user rather than guess.

## Before you finish

1. `python3 tools/check_site.py` (design-system guard: oversized images, `<img>` attributes, hard-coded colours) and `python3 scripts/site-check.py` — no new failures.
2. Check the page at **390, 820 and 1440 px** (the `verify-site` skill covers the local server) and report the page weight (image KB loaded) to the user.
3. Update the doc that describes any behaviour you changed (`DESIGN.md`, `_internal/CLAUDE_CODE_GUIDE.md`, …) in the same change.
