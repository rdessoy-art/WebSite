# Claude Code Development Guide — dessoyracing.com

**Read this before making any changes to the website.**

Last reviewed: 2026-06-06

---

## What This Site Is

A static HTML website for Harrison Dessoy, a British motorcycle road racing competitor (HD55). There is no build system, no framework, no package manager. Every page is a standalone `.html` file. Pages are deployed directly via GitHub to a static host (CNAME: dessoyracing.com).

---

## Site Structure at a Glance

```
dessoyracing/
├── index.html               # Homepage — hero, profile tabs, social feeds, sponsors
├── events.html              # Racing calendar
├── fanclub.html             # Fan club tiers with Stripe checkout
├── merchandise.html         # Shop with Stripe checkout
├── nft.html                 # NFT/digital collectibles (not in main nav)
├── behind-the-scenes.html   # BTS content (not in main nav)
├── motorcycle-live-announcement.html  # News post (not in main nav)
├── training-update.html     # News post (not in main nav)
├── portimao-test-report.html          # Test report (not in main nav)
├── success.html / cancel.html         # Stripe transaction redirect pages
├── partnership-menu.html    # Sponsorship menu — COMMENTED OUT of nav, keep for future
├── newsletter-popup.html    # Reference/dev file only, not a live page
│
├── sponsor-*.html           # 11 sponsor-specific pages
│
├── 2023/ 2024/              # Blog archive (year/month/date/slug/index.html)
│                            # NOT linked from main nav — archive only
├── category/british-superbikes/       # Blog category page — not in main nav
├── policies/                # privacy-policy.html, terms-of-service.html, data-deletion.html
│                            # NOT currently linked in the footer — should be added
│
├── about-me/index.html      # Redirect → homepage (old URL)
├── alan-roberts/index.html  # Redirect → homepage (old URL)
├── triumph-the-bike-shed-london/      # Event/venue partner page
│
├── d2e44591-.../index.html  # Redirect → homepage  ┐
├── ead5073b-d8be-.../       # Redirect → homepage  │ UUID redirect folders —
├── ead5073b-d8ce-.../       # Redirect → homepage  ┘ DO NOT DELETE (old links)
│
├── img_7218/index.html      # Redirect → behind-the-scenes.html  ┐ Media folder
├── img_7386-mp4/index.html  # Redirect → behind-the-scenes.html  │ redirects —
├── img_7586-mp4/index.html  # Redirect → behind-the-scenes.html  │ DO NOT DELETE
├── img_8781/index.html      # Redirect → behind-the-scenes.html  ┘
│
├── basket.js                # Shared: shopping cart + Stripe checkout
├── newsletter-popup.js      # Shared: newsletter modal logic
├── newsletter-popup.css     # Shared: newsletter modal styles
│
├── images/                  # All site images (logos, photos, merch, icons)
├── data/                    # JSON feeds for dynamic content
│   ├── campaigns.json       # Mailchimp recent newsletter list
│   ├── Instagram/instagram.json  + images
│   ├── facebook/posts.json  + images
│   └── mastodon/posts.json
│
├── sitemap.xml              # Must be kept in sync when adding/removing pages
├── robots.txt
├── CNAME
└── _internal/               # Working docs (Jekyll-excluded from the live site) — you are here
```

---

## Navigation Structure

Main navigation links (consistent across all pages):
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
| `basket.js` | fanclub.html, merchandise.html, events.html, index.html, cancel.html, partnership-menu.html | Notification helper + redirect to Stripe payment links; basket/cart code is vestigial |
| `newsletter-popup.js` | events.html, fanclub.html, merchandise.html, partnership-menu.html | Newsletter modal (8s delay, 7-day localStorage dismissal) |
| `newsletter-popup.css` | All pages that include newsletter-popup.js | Modal CSS |

All other CSS is **inline** inside `<style>` blocks in each HTML file's `<head>`. There is no global stylesheet other than the above.

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

---

## External Services

### Google Analytics 4
- Tracking ID: `G-Z0P3DBDMDZ`
- Present on all 22 HTML pages
- Script tag in `<head>` of every page — include it in any new pages

### Mailchimp (Newsletter)
- Account: `dba85c89d82fef7f216d3993b`
- List ID: `6ff0d772ac`
- Form endpoint: `https://gmail.us14.list-manage.com/subscribe/post?u=...`
- Connected script: `https://chimpstatic.com/mcjs-connected/js/users/...`
- Double opt-in is enabled
- The newsletter popup (`newsletter-popup.js` + `newsletter-popup.css`) integrates with this

### Stripe (Payments)
- **STATUS: FULLY CONFIGURED AND LIVE** — all purchase buttons are direct `<a href="https://buy.stripe.com/...">` links to Stripe-hosted payment pages
- Clicking "Buy Now" or "Join Now" opens Stripe's hosted checkout in a new tab — there is no on-site basket involved in the purchase flow
- `fanclub.html`: three membership tiers each link to their own `buy.stripe.com` URL
- `merchandise.html`: cap and hoodie (per size) each link to their own `buy.stripe.com` URL
- `basket.js` contains a `basketSidebar` and localStorage cart that are vestigial — `addToBasket()` immediately redirects to the Stripe payment link rather than queuing items; the function itself notes "basket is removed"
- The `STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE'` placeholder in `basket.js` line 9 is not used in the current payment flow and does not affect checkout
- Stripe.js v3 is loaded via CDN on fanclub.html and merchandise.html but is not required for the payment link flow

---

## Data Feeds (Dynamic Content)

All data is pre-generated JSON loaded via `fetch()` in JavaScript. There is no CMS or API at runtime — data must be updated by running the sync scripts and committing the result.

| Feed | File | Used In | Update Frequency |
|------|------|---------|-----------------|
| Newsletter campaigns | `data/campaigns.json` | index.html | When new campaign sent |
| Instagram posts | `data/Instagram/instagram.json` | index.html | Ongoing |
| Facebook posts | `data/facebook/posts.json` | index.html | Ongoing |
| Mastodon posts | `data/mastodon/posts.json` | index.html | Ongoing |

Images for social posts are stored alongside their JSON files in the respective subdirectory.

---

## Images

All site images live in `/images/`. Key files:

| File | Used For |
|------|---------|
| `HD55 White.png` | Header logo (50px height) |
| `Harrison Dessoy 2025 logo.png` | Profile section logo |
| `2025_profilepic.png` | Profile photo |
| `centered_wide_fade.png` | Hero background (desktop) |
| `Cap2026_Front.png` | Merchandise — HD55 Cap |
| `Hoody2026_Front.png`, `Hoody2026_Rear.png` | Merchandise — Hoodie |
| `Bennie2026_Front.png` | Merchandise — Beanie |
| `Instagram logo(2).png`, `Facebook logo.png`, `Youtube_logo.png`, `LinkedIn_logo.png` | Footer social icons |

**Formats in use:** PNG (logos/UI), JPEG/JPG (photos), SVG (sponsor logos), WebP (sponsor logos), HEIC (Apple originals — have PNG duplicates; HEIC files are safe to delete if storage is a concern)

**Large files to be aware of:** Merchandise PNGs are 7–9 MB each. Prefer WebP when adding new product images.

---

## Adding a New Page

1. Copy the header/footer structure from an existing page (e.g., `events.html`)
2. Include Google Analytics snippet in `<head>` — use the same tracking ID `G-Z0P3DBDMDZ`
3. If the page needs a newsletter popup, add `newsletter-popup.css`, `newsletter-popup.js`, and the modal HTML (see `newsletter-popup.html` for the reference implementation)
4. If the page needs the shopping basket, include `basket.js`
5. Add the page to `sitemap.xml` — see `SITEMAP_MAINTENANCE.md` for priority/frequency guidelines
6. Update `SITEMAP_MAINTENANCE.md` to record the new page
7. Link the page from at least one other page so it is reachable from the site

---

## Adding a New Sponsor Page

There are 11 existing sponsor pages following the pattern `sponsor-[name].html`. Each page is self-contained with inline styles following the site design system. After creating the new page:

1. Add a card to the sponsor grid in `index.html`
2. Add the page to `sitemap.xml` (priority 0.5, changefreq monthly)

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
- `0.3` — success.html, cancel.html

---

## Known Issues / Technical Debt

| Item | Details |
|------|---------|
| Vestigial basket code in `basket.js` | The `basketSidebar`, localStorage cart, and `STRIPE_PUBLISHABLE_KEY` placeholder are unused. Purchases go directly to `buy.stripe.com` links. The dead code could be cleaned up but is harmless. |
| Policy pages not linked in footer | `policies/privacy-policy.html`, `terms-of-service.html`, `data-deletion.html` exist but no footer links. |
| Blog archive not accessible | 13 posts in `2023/` and `2024/` have no entry point from main nav. |
| No 2025/2026 blog posts in archive structure | Recent news is standalone HTML files, not in the dated archive folder structure. |
| `partnership-menu.html` commented out | Intentionally hidden — do not remove, may be activated later. |
| CSS not consolidated | All styles inline per page. Any global design change must be applied to each file individually. |

---

## Files That Look Orphaned But Are NOT

These files exist for a reason — do not delete them:

- **UUID directories** (`d2e44591-...`, `ead5073b-d8be-...`, `ead5073b-d8ce-...`) — Redirect old URLs to homepage. Deleting breaks any existing external links pointing to these.
- **`img_7218/`, `img_7386-mp4/`, `img_7586-mp4/`, `img_8781/`** — Redirect old media share URLs to `behind-the-scenes.html`.
- **`about-me/index.html`**, **`alan-roberts/index.html`** — Old URL redirects kept for SEO continuity.
- **`success.html`**, **`cancel.html`** — Stripe post-checkout redirect targets. Not linked from the site but required by Stripe.
- **`newsletter-popup.html`** — Development reference file showing the popup implementation. Not a live page.
- **`partnership-menu.html`** — Future feature, commented out of nav.

---

## Files That Are Likely Safe to Remove

These have been identified as genuinely unused. Confirm before deleting:

- **`*.heic`** files in `/images/` — Apple original formats; PNG/JPEG versions already exist
- **`data/mastodon.json`** (root of data/ — separate from `data/mastodon/posts.json`) — appears to be a stale duplicate; verify before deleting

---

## Development Workflow

1. This is a plain static site — open HTML files directly in a browser or use any static server (e.g., `python3 -m http.server 8000`)
2. There are no build steps, no compilation, no minification
3. All changes are committed to git and deployed via the GitHub → static host pipeline
4. After adding or removing pages, update `sitemap.xml` and `SITEMAP_MAINTENANCE.md`
5. Test on mobile widths (768px and 480px breakpoints) — the site uses a hamburger nav on mobile

---

## Other Documentation in This Repo

| File | Topic |
|------|-------|
| `../CLAUDE.md` | Short invariants auto-loaded by Claude Code every session (points here for detail) |
| `AUDIT.md` (this folder) | Prioritized site audit checklist (2026-07-10) — work items with severity |
| `FEED_SECURITY_CHANGES.md` (this folder) | Feed-rendering XSS fix + required Publisher-side sanitization |
| `../.claude/skills/` | Project skills: new-page, new-sponsor-page, add-product, optimize-image, verify-site |
| `../scripts/site-check.py` | Consistency checks (GA, footer credit, sitemap, nav, image budget) — run before committing |
| `SITEMAP_MAINTENANCE.md` | How to keep sitemap.xml current |
| `NEWSLETTER_POPUP_README.md` | Newsletter popup implementation details |
| `MAILCHIMP_TROUBLESHOOTING.md` | Mailchimp integration issues |
| `STRIPE_SETUP.md` | How to configure Stripe keys (⚠ stale — describes a removed basket.js flow; see AUDIT.md §7) |
