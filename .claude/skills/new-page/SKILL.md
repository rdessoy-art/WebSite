---
name: new-page
description: Create any new page on the website (news post, announcement, event report, info page) with all required wiring — GA, shared nav, footer credit, sitemap, meta tags, inbound link. Use this whenever the user asks to add a page, create an announcement, publish a news update, or "put something new on the site", even for a quick one-off page — pages created without this checklist have shipped missing analytics and sitemap entries.
---

# Add a new page

Every page on this site is standalone HTML — there's no template engine, so the "template" is a checklist. Pages created without it have shipped missing GA (behind-the-scenes.html) and missing sitemap entries. For sponsor pages use `new-sponsor-page` instead; for merch products use `add-product`.

## 1. Start from the right base

Copy the structurally closest existing page:
- News/announcement → `training-update.html`
- Standard content page with full nav → `events.html`
- Minimal page (checkout-flow style) → `success.html`

## 2. Required in every page

- `<html lang="en">`, viewport meta, exactly one `<h1>`, `<meta name="description">` (~150 chars)
- GA snippet in `<head>` (ID `G-Z0P3DBDMDZ` — copy verbatim from the base page)
- Shared nav: empty `<nav id="nav"><ul></ul></nav>`, `<script src="nav.js">`, then `renderNav('<pageId or null>', false)` — **never a hardcoded menu**
- Footer with contact block, copyright, "Racing at the Highest Level", and the DessoyArt credit line (copy the whole `<footer>` from the base page)
- Inline `<style>` using the shared tokens (`--primary: #e63946`, `--secondary: #1d3557`, etc.)
- External links `target="_blank" rel="noopener"`

Optional per purpose: newsletter popup (copy the modal block + `newsletter-popup.css`/`.js` includes from `events.html`).

## 3. Wire it into the site

1. **`sitemap.xml`** entry — news/updates `priority 0.6`, info pages `0.5`, `changefreq monthly`
2. **Link it from at least one page** — a page nothing links to doesn't exist. News posts typically get linked from the home page news section.
3. If the page should NOT be indexed (checkout artifacts, private previews): `<meta name="robots" content="noindex">` and leave it out of the sitemap instead.

## 4. Verify

- `python3 scripts/site-check.py` — new page must pass all checks
- `verify-site` skill: page renders, nav + footer correct, mobile width (≤768px hamburger) works, console clean
- Update `_internal/CLAUDE_CODE_GUIDE.md` site-structure listing if the page is a lasting addition.
