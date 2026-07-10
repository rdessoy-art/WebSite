# Claude Code Development Guide — dessoyracing.com

**Read this before making any changes to the website.**

Last reviewed: 2026-07-10

---

## What This Site Is

A static HTML website for Harrison Dessoy, a British motorcycle road racing competitor (HD55). There is no build system, no framework, no package manager. Every page is a standalone `.html` file. Pages are deployed directly via GitHub Pages (Jekyll) to a static host (CNAME: dessoyracing.com). Jekyll means anything under `_internal/` (this folder) or listed in `_config.yml`'s `exclude:` is never published — see that file before assuming a doc is public.

---

## Site Structure at a Glance

```
dessoyracing/
├── index.html               # Homepage — hero, profile tabs, social feeds, sponsors
├── events.html               # Racing calendar
├── fanclub.html               # Fan club tiers with direct Stripe Payment Links
├── merchandise.html           # Shop with direct Stripe Payment Links
├── nft.html                   # NFT/digital collectibles (not in main nav)
├── behind-the-scenes.html      # BTS content (not in main nav)
├── motorcycle-live-announcement.html  # News post (not in main nav)
├── training-update.html        # News post (not in main nav)
├── portimao-test-report.html   # Fullscreen PDF viewer (no header/footer by design)
├── success.html / cancel.html  # Stripe post-payment redirect pages (noindex)
├── partnership-menu.html       # Sponsorship menu — COMMENTED OUT of nav, keep for future
├── newsletter-popup.html       # Reference/dev file only, not a live page
│
├── sponsor-*.html              # 13 sponsor-specific pages
│
├── card/index.html             # Harrison's digital business card (own header/footer design)
│
├── 2023/ 2024/                 # Blog archive (year/month/date/slug/index.html)
│                                # NOT linked from main nav — archive only
├── category/british-superbikes/  # Blog category page — not in main nav
├── policies/                   # privacy-policy.html, terms-of-service.html, data-deletion.html
│                                # Linked from every footer.js footer (Privacy Policy / Terms)
│
├── about-me/index.html         # Redirect → homepage (old URL)
├── alan-roberts/index.html     # Redirect → homepage (old URL)
├── triumph-the-bike-shed-london/  # Event/venue partner page
│
├── d2e44591-.../index.html     # Redirect → homepage  ┐
├── ead5073b-d8be-.../          # Redirect → homepage  │ UUID redirect folders —
├── ead5073b-d8ce-.../          # Redirect → homepage  ┘ DO NOT DELETE (old links)
│
├── img_7218/index.html         # Redirect → behind-the-scenes.html  ┐ Media folder
├── img_7386-mp4/index.html     # Redirect → behind-the-scenes.html  │ redirects —
├── img_7586-mp4/index.html     # Redirect → behind-the-scenes.html  │ DO NOT DELETE
├── img_8781/index.html         # Redirect → behind-the-scenes.html  ┘
│
├── nav.js                      # Shared: renders the main nav menu (renderNav)
├── footer.js                   # Shared: renders the site footer (renderFooter)
├── newsletter-popup.js         # Shared: newsletter modal logic
├── newsletter-popup.css        # Shared: newsletter modal styles
│
├── favicon.ico                 # Excluded from Pages (_config.yml) but present in repo root
├── images/                     # All site images (logos, photos, merch, icons) — ~28 MB
├── data/                       # JSON feeds for dynamic content (Publisher-synced, untrusted — see below)
│   ├── campaigns.json          # Mailchimp recent newsletter list
│   ├── Instagram/instagram.json  + images
│   ├── facebook/posts.json     + images
│   └── mastodon/posts.json
│
├── sitemap.xml                 # Must be kept in sync when adding/removing pages
├── robots.txt
├── CNAME
├── _config.yml                 # Jekyll config — excludes CLAUDE.md, scripts/, .claude/ from the live site
├── ../CLAUDE.md                # Short invariants Claude Code auto-loads every session
├── ../scripts/site-check.py    # Consistency checks — run before committing
├── ../.claude/skills/          # new-page, new-sponsor-page, add-product, optimize-image, verify-site
└── _internal/                  # Working docs (Jekyll-excluded) — you are here
```

---

## Navigation Structure

Main navigation links (rendered by `nav.js` — see below, never hardcode this):
- Home → index.html
- About → index.html#about
- News → (varies by page; no dedicated news landing page)
- Events → events.html
- Sponsors → index.html#sponsors
- Merchandise → merchandise.html
- Fan Club → fanclub.html

**Partnership Menu** (`partnership-menu.html`) is intentionally commented out of the nav and reserved for future use. Do not remove the file.

---

## Shared Files — Touch With Care

| File | Used By | Purpose |
|------|---------|---------|
| `nav.js` | index, events, fanclub, merchandise, partnership-menu | `renderNav(pageId, isHome)` builds the `<nav id="nav">` menu — never hardcode nav `<li>`s. `toggleMenu()`/`closeMenu()` here too, and keep `aria-expanded` on the hamburger `<button>` in sync. |
| `footer.js` | All pages except `card/index.html` and `policies/*.html` | `renderFooter({withSocial, copyrightName, copyrightSuffix})` builds the whole `<footer>` — social links, contact, copyright (auto year), Privacy/Terms links, DessoyArt credit. Never hardcode a footer either. |
| `newsletter-popup.js` | events.html, fanclub.html, merchandise.html, partnership-menu.html | Newsletter modal (8s delay, 7-day localStorage dismissal) |
| `newsletter-popup.css` | All pages that include newsletter-popup.js | Modal CSS |
| `scripts/site-check.py` | Run manually / via `verify-site` skill | Consistency checks — GA present, footer credit present, sitemap sync, exactly one `<h1>`, `rel="noopener"` on external links, no hardcoded nav, image size budget |

`basket.js` was removed 2026-07-10 — it was fully vestigial (no `addToBasket()` existed anywhere, so the cart could never gain an item). It's not coming back; purchases are, and always were, direct `buy.stripe.com` Payment Links. See `STRIPE_SETUP.md`.

All other CSS is **inline** inside `<style>` blocks in each HTML file's `<head>`. There is no global stylesheet other than the shared JS above.

---

## Design System

**Color tokens** (used as CSS custom properties, defined inline per page):
```css
--primary:   #e63946  /* Red — buttons, accents, active states */
--secondary: #1d3557  /* Dark blue — headings, nav background */
--accent:    #f1faee  /* Light cream — subtle backgrounds */
--dark:      (dark backgrounds)
--light:     (light backgrounds)
```

**Typography:** Segoe UI, Tahoma, Geneva, Verdana, sans-serif (system stack, no web font)

**Responsive breakpoints:** 1024px, 768px, 480px

**Layout patterns:** CSS Grid for product grids, sponsor grids, blog card grids; Flexbox for nav, footer, hero

**Sponsor page hero:** every `sponsor-*.html` shares a `.sponsor-hero` div with `.sponsor-hero h1` / `.sponsor-hero p` CSS predefined — when creating a new one, actually use the `<h1>{Sponsor Name}</h1>` (this CSS existed on all 13 pages for a long time with no `<h1>` in the HTML using it — fixed 2026-07-10, don't reintroduce the gap).

---

## Accessibility

- Hamburger menu is a real `<button type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav">` on the 5 full-nav pages (was a `<div onclick>` until 2026-07-10). `nav.js` keeps `aria-expanded` in sync — don't revert to a div.
- Every real content page has exactly one `<h1>`. `site-check.py` enforces this — a new page failing this check means the title text is missing or duplicated, not that the check is wrong.
- External links use `rel="noopener"` on `target="_blank"`; internal links stay same-tab, no exceptions (the one that existed, the EGR/Martin Sheath hero-strip link, was fixed 2026-07-10).
- The 5 full-nav pages have a "Skip to content" link as the first element in `<body>` (visually hidden until keyboard-focused). On index.html it targets `#home` rather than a generic `#main-content` id — that page toggles section visibility via `section.active`/`showSection()`, and a plain new id on `<main>` would collide with the hash-routing (loading `#main-content` would hide every section with nothing to show in their place). Keep using `#home` there if you touch this.

---

## External Services

### Google Analytics 4
- Tracking ID: `G-Z0P3DBDMDZ`
- Present on all 24 real content pages (verified via `site-check.py`)
- Script tag in `<head>` of every page — include it in any new pages

### Mailchimp (Newsletter)
- Account: `dba85c89d82fef7f216d3993b`
- List ID: `6ff0d772ac`
- Form endpoint: `https://gmail.us14.list-manage.com/subscribe/post?u=...`
- Connected script: `https://chimpstatic.com/mcjs-connected/js/users/...`
- Double opt-in is enabled
- The newsletter popup (`newsletter-popup.js` + `newsletter-popup.css`) integrates with this

### Stripe (Payments)
- **STATUS: FULLY CONFIGURED AND LIVE** — all purchase buttons are direct `<a href="https://buy.stripe.com/...">` links to Stripe-hosted Payment Link pages. Full detail, including how to add a new product/variant: `STRIPE_SETUP.md`.
- Clicking "Buy Now" or "Join Now" opens Stripe's hosted checkout in a new tab — there is no on-site basket involved in the purchase flow, and no Stripe key of any kind lives in this repo
- `fanclub.html`: three membership tiers each link to their own `buy.stripe.com` URL
- `merchandise.html`: cap and beanie color variants wired via `changeCapImage()`/`buyCap()` etc. (see `STRIPE_SETUP.md` for the pattern)

---

## Data Feeds (Dynamic Content) — SECURITY-SENSITIVE

All data is pre-generated JSON loaded via `fetch()` in JavaScript by `index.html`, written by an external "Publisher" service syncing from social/Mailchimp APIs. **Treat every value in these files as untrusted** — see `FEED_SECURITY_CHANGES.md` for the full incident writeup. In short: `index.html` passes feed text through `escapeHtml()` and feed URLs through `safeUrl()` before inserting into the DOM. If you touch `loadCampaigns()` or `renderFeedSection()`, keep using those helpers — do not reintroduce raw `innerHTML` interpolation of feed fields.

| Feed | File | Used In | Update Frequency |
|------|------|---------|-----------------|
| Newsletter campaigns | `data/campaigns.json` | index.html | When new campaign sent |
| Instagram posts | `data/Instagram/instagram.json` | index.html | Ongoing |
| Facebook posts | `data/facebook/posts.json` | index.html | Ongoing |
| Mastodon posts | `data/mastodon/posts.json` | index.html | Ongoing |

Images for social posts are stored alongside their JSON files in the respective subdirectory. (`data/mastodon.json` at the data/ root, a stale duplicate of `data/mastodon/posts.json`, was deleted 2026-07-10.)

---

## Images

All site images live in `/images/` (~28 MB, down from ~98 MB after the 2026-07-10 cleanup). Key files:

| File | Used For |
|------|---------|
| `HD55 White.png` | Header logo (50px height); source for the favicon |
| `Harrison Dessoy 2025 logo.png` | Profile section logo |
| `2025_profilepic.png` | Profile photo |
| `hero-bg-desktop.webp` / `hero-bg-tablet.webp` / `hero-bg-mobile.webp` | Responsive hero backgrounds (index.html) |
| `og-image-home.jpg` / `og-image-fanclub.jpg` / `og-image-merchandise.jpg` | Open Graph / Twitter card preview images (1200×630) |
| `cap-2026-front.webp`, `hoody-2026-front.webp`/`-rear.webp`, `t-shirt-2026-front.webp`/`-rear.webp`, `beanie-2026-front.webp` (+ `-black`/`-yellow`/`-white` color variants) | Merchandise product photos |
| `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` | Browser tab / home-screen icons, generated from `HD55 White.png` |
| `Instagram logo(2).png`, `Facebook logo.png`, `Youtube_logo.png`, `LinkedIn_logo.png` | Footer social icons (rendered by `footer.js`) |

**Formats in use:** WebP (preferred — merch, hero backgrounds, most logos), PNG (logos/UI needing transparency), JPEG/JPG (photos, OG images), SVG (a few sponsor logos).

**Convention for new images:** WebP, ≤300–500 KB, lowercase-hyphenated filename (`sponsor-name-logo.webp`, not `Sponsor Name (2).PNG`). Use the `optimize-image` Claude Code skill — `cwebp` is installed via Homebrew on the primary dev machine (verified 2026-07-10: turns an 8.5 MB source photo into ~45 KB with no visible quality loss). Existing pre-2026-07-10 filenames keep spaces/mixed case; match them exactly since the deploy host is case-sensitive.

`scripts/site-check.py` flags any committed image over 500 KB — a growing list of pre-existing large photos (data/Instagram JPEGs, a few `images/IMG_*.JPEG` files) is tracked as ongoing warnings in `AUDIT.md`, not yet cleaned up.

**`loading="lazy"`:** applied 2026-07-10 to below-the-fold `<img>` tags (index.html's sponsor grid, events.html's flags/venue logos, merchandise.html's rear/back carousel photos). Leave it off anything likely to be in the initial viewport (header logo, hero images, front-facing product photos) — it only helps if the browser can skip a real network fetch. Note this doesn't apply to the "News"/social-feed cards on index.html — those render via CSS `background-image` on a `<div>`, and the `loading` attribute only works on `<img>`/`<iframe>`.

---

## Adding a New Page

1. Copy the header/footer structure from an existing page (e.g., `events.html`) — empty `<nav id="nav"><ul></ul></nav>` + `<footer></footer>`, with `nav.js`/`footer.js` included and `renderNav()`/`renderFooter()` called
2. Include Google Analytics snippet in `<head>` — use the same tracking ID `G-Z0P3DBDMDZ`
3. Include the favicon `<link>` block (copy from any page) and a `<meta name="description">`
4. Give the page exactly one `<h1>`
5. If the page needs a newsletter popup, add `newsletter-popup.css`, `newsletter-popup.js`, and the modal HTML (see `newsletter-popup.html` for the reference implementation)
6. Add the page to `sitemap.xml` — see `SITEMAP_MAINTENANCE.md` for priority/frequency guidelines
7. Update `SITEMAP_MAINTENANCE.md` to record the new page
8. Link the page from at least one other page so it is reachable from the site

Or use the `new-page`/`new-sponsor-page` Claude Code skill, which encodes this checklist — and run `scripts/site-check.py` afterward either way.

---

## Adding a New Sponsor Page

There are 13 existing sponsor pages following the pattern `sponsor-[name].html`. Each page is self-contained with inline styles following the site design system, and shares the `.sponsor-hero` CSS pattern (see Design System above — remember the actual `<h1>{Name}</h1>` element, not just the CSS class). After creating the new page:

1. Add a card to the sponsor grid in `index.html`'s `<section id="sponsors">`
2. Add the logo to `index.html`'s `.hero-sponsors` strip
3. Add the page to `sitemap.xml` (priority 0.5, changefreq monthly)

Or use the `new-sponsor-page` skill, which does all three plus verification.

---

## Sitemap Rules

`sitemap.xml` must be kept in sync. Full instructions: `SITEMAP_MAINTENANCE.md`.

Priority scale:
- `1.0` — index.html
- `0.9` — fanclub.html, merchandise.html
- `0.8` — events.html
- `0.7` — nft.html, behind-the-scenes.html
- `0.6` — news/update pages
- `0.5` — sponsor pages
- Not included — success.html, cancel.html (checkout artifacts, `noindex` instead), card/index.html (personal contact card, deliberately not indexed), portimao-test-report.html, newsletter-popup.html

---

## Known Issues / Technical Debt

See `AUDIT.md` in this folder for the full, prioritized, checkbox-tracked list — this section only calls out what's still genuinely open as of 2026-07-10:

| Item | Details |
|------|---------|
| Blog archive not accessible | 13 posts in `2023/` and `2024/` have no entry point from main nav. |
| No 2025/2026 blog posts in archive structure | Recent news is standalone HTML files, not in the dated archive folder structure. |
| `partnership-menu.html` commented out | Intentionally hidden — do not remove, may be activated later. |
| CSS not consolidated | All styles inline per page (`nav`/`footer` markup is centralized in JS, but CSS is not) — a global design change must still be applied to each file individually. |
| Some pre-existing photos still over the 500 KB image budget | Tracked as ongoing `site-check.py` warnings, not yet optimized — mostly `data/Instagram/*.jpg` and a few root `images/IMG_*.JPEG`/`.JPG` files. |
| Meta descriptions missing on most pages | Only index/events/merchandise/fanclub/card have them; sponsor pages, success/cancel, and news posts don't yet. |

---

## Files That Look Orphaned But Are NOT

These files exist for a reason — do not delete them:

- **UUID directories** (`d2e44591-...`, `ead5073b-d8be-...`, `ead5073b-d8ce-...`) — Redirect old URLs to homepage. Deleting breaks any existing external links pointing to these.
- **`img_7218/`, `img_7386-mp4/`, `img_7586-mp4/`, `img_8781/`** — Redirect old media share URLs to `behind-the-scenes.html`.
- **`about-me/index.html`**, **`alan-roberts/index.html`** — Old URL redirects kept for SEO continuity.
- **`success.html`**, **`cancel.html`** — Stripe post-checkout redirect targets. Not linked from the site but required by Stripe. `noindex`'d and excluded from the sitemap since 2026-07-10.
- **`newsletter-popup.html`** — Development reference file showing the popup implementation. Not a live page, not linked from anywhere.
- **`partnership-menu.html`** — Future feature, commented out of nav.
- **`portimao-test-report.html`** — Deliberately bare (no header/footer/nav) — a fullscreen PDF viewer reached from an events.html link. Don't add the standard chrome to it.

---

## Development Workflow

1. This is a plain static site — serve it locally with `python3 -m http.server 8899` from the repo root and browse `http://127.0.0.1:8899/` (opening files directly via `file://` breaks the `fetch()` calls the social feeds and campaigns list depend on)
2. There are no build steps, no compilation, no minification
3. Run `python3 scripts/site-check.py` before committing — fix anything your change introduced; pre-existing warnings are tracked in `AUDIT.md`
4. All changes are committed to git and go live once merged to `main` (GitHub Pages rebuilds in ~1–2 minutes)
5. After adding or removing pages, update `sitemap.xml` and `SITEMAP_MAINTENANCE.md`
6. Test on mobile widths (768px and 480px breakpoints) — the site uses a hamburger nav on mobile
7. Use the `verify-site` Claude Code skill for the full local-server + real-browser + console-check routine before calling anything done

---

## Other Documentation in This Repo

| File | Topic |
|------|-------|
| `../CLAUDE.md` | Short invariants auto-loaded by Claude Code every session (points here for detail) |
| `AUDIT.md` (this folder) | Prioritized site audit checklist (started 2026-07-10, updated as items are completed) — the authoritative list of what's done vs. outstanding |
| `FEED_SECURITY_CHANGES.md` (this folder) | Feed-rendering XSS fix + required Publisher-side sanitization — read before touching `loadCampaigns()`/`renderFeedSection()` |
| `../.claude/skills/` | Project skills: new-page, new-sponsor-page, add-product, optimize-image, verify-site |
| `../scripts/site-check.py` | Consistency checks (GA, footer credit, sitemap, nav, h1, noopener, image budget) — run before committing |
| `SITEMAP_MAINTENANCE.md` | How to keep sitemap.xml current |
| `NEWSLETTER_POPUP_README.md` | Newsletter popup implementation details |
| `MAILCHIMP_TROUBLESHOOTING.md` | Mailchimp integration issues |
| `STRIPE_SETUP.md` | How Stripe Payment Links work here and how to add a new one (rewritten 2026-07-10 — the old version described a checkout-session/basket flow that never actually existed) |
