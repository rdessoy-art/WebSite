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
- **0.3**: Utility pages (success, cancel)

### 3. Change Frequency Guidelines
- **daily**: Frequently changing content
- **weekly**: Regular updates (main pages)
- **monthly**: Occasional updates (news, sponsors)
- **yearly**: Rarely changes (utility pages)

## Current Pages in Sitemap

Last updated: 2025-11-26

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

### Sponsor Pages
- sponsor-arc-on.html
- sponsor-mark-walker-coaching.html
- sponsor-martin-sheath.html
- sponsor-phr-performance.html
- sponsor-triumph-east-london.html
- sponsor-twotyres.html
- sponsor-weise.html
- sponsor-zerofit.html

### Transaction Pages
- success.html
- cancel.html

## Verification

After updating, verify your sitemap:
1. Check XML syntax is valid
2. Test at: https://www.xml-sitemaps.com/validate-xml-sitemap.html
3. Submit to Google Search Console: https://search.google.com/search-console

## Excluded Files

The following files are intentionally excluded from the sitemap:
- `google-apps-script/form-update-example.html` (internal utility)

## Reminder

⚠️ **Remember to update this file when adding or removing pages from the sitemap!**
