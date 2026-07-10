---
name: new-sponsor-page
description: Add a new sponsor/partner to the website — creates the sponsor-<name>.html page AND all the side-updates that get forgotten (index card, hero logo strip, sitemap). Use this whenever the user mentions adding a sponsor, partner, or brand to the site, giving a company a page, or says something like "we have a new sponsor called X" — even if they only ask for one part (e.g. "add the logo"), because a sponsor is only fully added when every surface is updated.
---

# Add a new sponsor page

A sponsor exists in **four places**, and history shows the side-updates get missed: four sponsor pages were live for weeks with no sitemap entry because they were added by hand. Treat all four as one atomic change.

## 1. Gather what you need

From the user (ask if missing):
- Sponsor name and what they provide (e.g. "Glove sponsor", "Legal Partner")
- Logo file (or their website to fetch it from — get permission before downloading)
- Their website URL
- A 1–2 sentence description for the card

## 2. Prepare the logo

Run the `optimize-image` skill conventions: WebP preferred, ≤300 KB, lowercase-hyphenated name into `images/`. If the logo only looks right on a dark tile (white/knockout logos), note it — the index card `.sponsor-logo` div takes `background: black` (see the Rock Cameras card) and that's fine.

## 3. Create `sponsor-<name>.html`

Copy the structure of the most recently added sponsor page (currently `sponsor-rockcameras.html`) — do not invent a new layout. Then:
- Update title, `<meta name="description">`, description, links, logo
- **`<h1>{Sponsor Name}</h1>` goes inside the `.sponsor-hero` div**, before or alongside the logo image. Every sponsor page already has `.sponsor-hero h1` CSS predefined (font-size, uppercase, letter-spacing) — for a long time all 13 pages had this CSS with no actual `<h1>` element using it, just a bare logo image (fixed 2026-07-10). Don't recreate that gap: the heading is not optional decoration, it's required for `site-check.py` and for the page to make sense to a screen reader.
- Footer: empty `<footer></footer>` + `<script src="footer.js">` + `renderFooter({ withSocial: false, copyrightName: '<Sponsor Name>', copyrightSuffix: 'Official Partner of Harrison Dessoy.' })` — **never hardcode the footer**. Keep the GA snippet (`G-Z0P3DBDMDZ`) and the favicon `<link>` block too.
- External links `target="_blank" rel="noopener"`; internal links same-tab

## 4. The three side-updates (the part that gets forgotten)

1. **Index "Our Partners" card** — add a `.sponsor-card` in the `<section id="sponsors">` grid in `index.html`, following the existing card markup exactly (logo div, `<h3>` role title, description, "Learn More →" button linking to the new page). This `<img>` sits in a div with a fixed `height: 100px` and `width: 100%; height: 100%` on the image itself, so no `width`/`height` attributes are needed here — it's already shift-safe.
2. **Hero logo strip** — add the logo to `.hero-sponsors` in `index.html` (`hero-sponsor-logo` class), linking to the sponsor's external site or their internal page, matching how similar sponsors are linked. This one only has `height: 80px` fixed in CSS (`width: auto`), so add `width`/`height` HTML attributes using the logo's real pixel dimensions (`sips -g pixelWidth -g pixelHeight <file>`) — otherwise the strip reflows as the image loads. Same applies to the hero logo on the new sponsor page itself (the `max-width: 400px` pattern only constrains one axis).
3. **`sitemap.xml`** — add the page with `priority 0.5`, `changefreq monthly`, today's date as lastmod.

## 5. Verify and finish

- Run `python3 scripts/site-check.py` — the new page must pass every check.
- Run the `verify-site` skill: confirm the card, hero logo, and page all render, links work, mobile width looks right.
- Update the sponsor-page count in `_internal/CLAUDE_CODE_GUIDE.md` (section "Adding a New Sponsor Page").
