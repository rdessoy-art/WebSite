# Sitemap Maintenance Guide

## Important: Keep sitemap.xml Updated

The `sitemap.xml` file helps search engines discover and index all pages on the website. It's crucial to keep it updated whenever you make changes to the site structure.

## When to Update sitemap.xml

Update the sitemap whenever you:
- ✅ Add a new HTML page
- ✅ Remove an existing page
- ✅ Change page URLs or filenames
- ✅ Make significant content updates to important pages

## How to Update

### 1. Manual Update
Edit `sitemap.xml` and add/remove/modify `<url>` entries:

```xml
<url>
  <loc>https://dessoyracing.com/your-new-page.html</loc>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

### 2. Priority Guidelines
- **1.0**: Homepage (index.html)
- **0.9**: Key pages (fanclub, merchandise)
- **0.8**: Important content (events)
- **0.7**: Secondary content (nft, behind-the-scenes)
- **0.6**: News/updates
- **0.5**: Sponsor pages

`success.html` and `cancel.html` are **not** in the sitemap and carry `<meta name="robots" content="noindex">` instead (since 2026-07-10) — they're Stripe post-payment redirect targets, not content anyone should land on via search. Don't re-add them at a low priority; leave them out entirely.

### 3. Change Frequency Guidelines
- **daily**: Frequently changing content
- **weekly**: Regular updates (main pages)
- **monthly**: Occasional updates (news, sponsors)
- **yearly**: Rarely changes (utility pages)

## Current Pages in Sitemap

Last updated: 2026-07-10 (`scripts/site-check.py` checks every real content page is listed here — run it rather than trusting this list to stay current by itself)

### Main Pages
- index.html
- fanclub.html
- merchandise.html
- events.html
- nft.html
- behind-the-scenes.html

### News/Updates
- motorcycle-live-announcement.html
- training-update.html

### Sponsor Pages (all 13)
- sponsor-arc-on.html
- sponsor-bonabotanica.html
- sponsor-fletcherssolicitors.html
- sponsor-grayers-graphics.html
- sponsor-mark-walker-coaching.html
- sponsor-martin-sheath.html
- sponsor-phr-performance.html
- sponsor-pro-bolt.html
- sponsor-rockcameras.html
- sponsor-triumph-east-london.html
- sponsor-twotyres.html
- sponsor-weise.html
- sponsor-zerofit.html

## Verification

After updating, verify your sitemap:
1. Check XML syntax is valid
2. Test at: https://www.xml-sitemaps.com/validate-xml-sitemap.html
3. Submit to Google Search Console: https://search.google.com/search-console

## Excluded Files

The following are intentionally excluded from the sitemap:
- `success.html`, `cancel.html` — Stripe post-payment redirects, `noindex`'d instead
- `card/index.html` — Harrison's personal digital contact card, not meant to be indexed
- `partnership-menu.html` — commented out of nav, not a public-facing page yet
- `portimao-test-report.html`, `newsletter-popup.html` — not real pages (see `CLAUDE_CODE_GUIDE.md`)
- `policies/*.html` — legal docs for the separate Publisher app, linked from every footer but not sitemap-worthy content
- The redirect stubs (`2023/`, `2024/`, UUID folders, `img_*/`, `about-me/`, `alan-roberts/`) — these forward instantly and have nothing for a crawler to index

## Reminder

⚠️ **Remember to update this file when adding or removing pages from the sitemap!**
