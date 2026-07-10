# dessoyracing.com — Claude Code guide

Static HTML site for Harrison Dessoy (HD55), World Sportbike rider. **No build system, no framework, no package manager** — every page is a standalone `.html` file deployed via GitHub Pages (merge to `main` = live on dessoyracing.com).

Full details in `_internal/CLAUDE_CODE_GUIDE.md` — read it before structural changes. This file is the short list of invariants.

## Invariants — never violate these

- **Navigation lives in `nav.js`, the footer lives in `footer.js`.** Pages have an empty `<nav id="nav"><ul></ul></nav>` + `<footer></footer>` and call `renderNav('<pageId>', isHome)` / `renderFooter({withSocial, copyrightName, copyrightSuffix})`. Never hardcode either into a page — hardcoded copies are exactly what drifted before (a missing nav item, inconsistent contact email, stale copyright years, orphaned policy-page links — all fixed 2026-07-10 by centralizing).
- **Anything rendered from `data/*.json` is untrusted.** Those files are auto-committed by the external Publisher service from social/Mailchimp APIs. Always pass text through `escapeHtml()` and URLs through `safeUrl()` (both in `index.html`) before inserting into the DOM. See `_internal/FEED_SECURITY_CHANGES.md`.
- **Do not delete "orphaned-looking" folders** (`2023/`, `2024/`, UUID dirs, `img_*/`, `about-me/`, `alan-roberts/`) — they are redirects for old external links. `partnership-menu.html` is intentionally hidden from nav; keep it.
- **Purchases are direct `buy.stripe.com` payment links** — there is no on-site cart or Stripe.js checkout session, and no `basket.js` (removed 2026-07-10 — it was fully vestigial; don't reintroduce cart/basket machinery). Never handle card data or keys in this repo.
- **The mobile hamburger is a `<button>`, not a `<div>`** (`aria-label="Menu" aria-expanded="false" aria-controls="nav"`), with `nav.js` keeping `aria-expanded` in sync. Don't revert to a div-with-onclick.

## Every new page needs

1. Google Analytics snippet in `<head>` (ID `G-Z0P3DBDMDZ` — copy from any page)
2. Favicon `<link>` block (copy from any page — 4 lines, `favicon.ico` + 2 PNG sizes + apple-touch-icon)
3. Shared nav + footer (`nav.js`/`footer.js`, see above) **including the DessoyArt credit line**
4. Exactly one `<h1>`, a `<meta name="description">`, `lang="en"`, viewport meta
5. An entry in `sitemap.xml` (see `_internal/SITEMAP_MAINTENANCE.md` for priorities)
6. A link from at least one existing page

Use the `new-page` or `new-sponsor-page` skill — they encode this checklist.

## Images

- New images: **WebP, ≤300 KB, lowercase-hyphenated filename** (`phr-logo.webp`, not `PHR Logo (2).PNG`). Use the `optimize-image` skill before committing anything from a camera or design export — raw merch PNGs have shipped at 8 MB before.
- Existing filenames contain spaces/mixed case; match them exactly (deploy host is case-sensitive).

## Conventions

- CSS is inline per page (`<style>` in head) using the shared tokens: `--primary: #e63946`, `--secondary: #1d3557`, `--accent: #f1faee`, `--dark`, `--light`. Match the page you're editing.
- External links: `target="_blank" rel="noopener"`. Internal links: same tab.
- Before committing page changes, run `python3 scripts/site-check.py` and don't introduce new failures (pre-existing ones are tracked in `_internal/AUDIT.md`).
- Verify changes in a real browser via the `verify-site` skill (local server on port 8899).
- When you change behaviour, update the doc that describes it (`_internal/CLAUDE_CODE_GUIDE.md`, `_internal/STRIPE_SETUP.md`, `_internal/SITEMAP_MAINTENANCE.md`, …) in the same change.
