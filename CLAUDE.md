# dessoyracing.com — Claude Code guide

Static HTML site for Harrison Dessoy (HD55), World Sportbike rider. **No build system, no framework, no package manager** — every page is a standalone `.html` file deployed via GitHub Pages (merge to `main` = live on dessoyracing.com).

Full details in `Development Standards/CLAUDE_CODE_GUIDE.md` — read it before structural changes. This file is the short list of invariants.

## Invariants — never violate these

- **Navigation lives in `nav.js`.** Pages have an empty `<nav id="nav"><ul></ul></nav>` and call `renderNav('<pageId>', isHome)`. Never hardcode a menu into a page — hardcoded copies are exactly what drifted before.
- **Anything rendered from `data/*.json` is untrusted.** Those files are auto-committed by the external Publisher service from social/Mailchimp APIs. Always pass text through `escapeHtml()` and URLs through `safeUrl()` (both in `index.html`) before inserting into the DOM. See `FEED_SECURITY_CHANGES.md`.
- **Do not delete "orphaned-looking" folders** (`2023/`, `2024/`, UUID dirs, `img_*/`, `about-me/`, `alan-roberts/`) — they are redirects for old external links. `partnership-menu.html` is intentionally hidden from nav; keep it.
- **Purchases are direct `buy.stripe.com` payment links** — there is no on-site cart or Stripe.js checkout session. Never handle card data or keys in this repo.

## Every new page needs

1. Google Analytics snippet in `<head>` (ID `G-Z0P3DBDMDZ` — copy from any page)
2. Shared nav (`nav.js` + `renderNav`) and the standard footer **including the DessoyArt credit line**
3. Exactly one `<h1>`, a `<meta name="description">`, `lang="en"`, viewport meta
4. An entry in `sitemap.xml` (see `SITEMAP_MAINTENANCE.md` for priorities)
5. A link from at least one existing page

Use the `new-page` or `new-sponsor-page` skill — they encode this checklist.

## Images

- New images: **WebP, ≤300 KB, lowercase-hyphenated filename** (`phr-logo.webp`, not `PHR Logo (2).PNG`). Use the `optimize-image` skill before committing anything from a camera or design export — raw merch PNGs have shipped at 8 MB before.
- Existing filenames contain spaces/mixed case; match them exactly (deploy host is case-sensitive).

## Conventions

- CSS is inline per page (`<style>` in head) using the shared tokens: `--primary: #e63946`, `--secondary: #1d3557`, `--accent: #f1faee`, `--dark`, `--light`. Match the page you're editing.
- External links: `target="_blank" rel="noopener"`. Internal links: same tab.
- Before committing page changes, run `python3 scripts/site-check.py` and don't introduce new failures (pre-existing ones are tracked in `AUDIT.md`).
- Verify changes in a real browser via the `verify-site` skill (local server on port 8899).
- When you change behaviour, update the doc that describes it (`Development Standards/CLAUDE_CODE_GUIDE.md`, `STRIPE_SETUP.md`, `SITEMAP_MAINTENANCE.md`, …) in the same change.
