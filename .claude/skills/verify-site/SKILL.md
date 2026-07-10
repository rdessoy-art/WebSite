---
name: verify-site
description: Verify website changes end-to-end — local server, real-browser click-through, console check, and the site consistency script. Use this before committing any change to HTML/JS/CSS/images, whenever the user asks "does it work / check the site / test it", and after merging to confirm the live site. Don't skip it for "small" changes — the nav bug that motivated this skill shipped as a small change.
---

# Verify the site

This is the project verify skill: exercise the real pages, don't just eyeball the diff.

## 1. Static checks first (fast)

```bash
python3 scripts/site-check.py
```

Fix anything your change introduced. Pre-existing failures are tracked in `AUDIT.md` — don't add new ones.

If you changed any `<script>` content, syntax-check it: extract inline scripts and run `node --check` (and `node --check nav.js basket.js newsletter-popup.js` if touched).

## 2. Serve locally

```bash
python3 -m http.server 8899 --bind 127.0.0.1   # run in background from the repo root
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8899/index.html   # expect 200
```

Pages must be served over HTTP, not opened as `file://` — the social feeds `fetch()` JSON and fail on file URLs.

## 3. Browse it for real

Use the Claude in Chrome tools (`mcp__claude-in-chrome__*`) against `http://127.0.0.1:8899/`:

- Load the page(s) you changed; screenshot and actually look at the result
- **Beware stale cache when you replaced an image/file keeping the same name** — the browser will happily show you the old one; hard-reload or cache-bust before concluding
- Click through the nav: all 7 items present on every page, current page highlighted
- Scroll to the footer: credit line present, links work
- `read_console_messages` with `onlyErrors: true` — must be clean
- If index.html changed: newsletters + all three social feeds render (no fallback text)
- Check a mobile width (~480 px) if layout was touched: hamburger opens/closes

If the browser extension isn't connected, fall back to `curl` content assertions plus running extracted page JS in node with a DOM stub — but say so in your report; it's weaker evidence.

## 4. Clean up and report

Kill the server (`pkill -f "http.server 8899"`). Report what you exercised and what you observed — if something failed, show it; don't soften it.

## After deploy (merge to main)

GitHub Pages rebuilds in ~1–2 minutes. Spot-check `https://www.dessoyracing.com/` (the apex domain 301s to www): confirm your change is live (`curl` a distinctive string, or compare an image checksum) before telling the user it's deployed.
