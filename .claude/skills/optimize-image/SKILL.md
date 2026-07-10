---
name: optimize-image
description: Optimize an image for the website before it is committed — resize, convert, compress to a size budget, and name it correctly. Use this every time an image enters the repo: new sponsor logos, merch product photos, profile/news photos, anything from a phone, camera, Canva or design export. Trigger even if the user just says "add this photo/logo" without mentioning size — raw exports have shipped at 8–9 MB and made pages unusable on mobile.
---

# Optimize an image for the site

Raw images are the #1 performance problem this site has had (a 49 MB merchandise page). Every image gets sized for its use, compressed to budget, and named to convention **before** it lands in `images/`.

## Targets by use

| Use | Max long edge | Budget |
|---|---|---|
| Hero / full-width background | 1920 px | ≤ 400 KB |
| Content / product / profile photo | 800–1200 px | ≤ 300 KB |
| Sponsor logo (hero strip / cards) | 400–600 px | ≤ 100 KB |
| Favicon / small UI | as needed | ≤ 20 KB |

**Naming:** lowercase, hyphens, no spaces/parens, correct lowercase extension — `hoody-2026-front.webp`, `phr-logo.png`. Never overwrite an existing image with different content under the same name without flagging it (browser caches will mask the change — and check nothing else references the old look).

## Tooling on this machine

`cwebp` is installed (Homebrew, verified 2026-07-10 — turned the 8.5 MB cap photo into 43 KB at 800 px with no visible quality loss). Use it as the default:

```
cwebp -q 80 -resize <width> 0 in.png -o images/out.webp
```

WebP handles transparency, so logos convert too (no need to stay PNG). If `cwebp` is ever missing (new machine), `brew install webp` restores it; the stopgap is `sips`: photos → `sips -Z <maxdim> -s format jpeg -s formatOptions 80 in.png --out images/out.jpg`, transparent logos → resize-only PNG.

HEIC inputs: `sips -s format jpeg` converts them directly; don't commit the `.heic` original.

## Process

1. Inspect the source: `sips -g pixelWidth -g pixelHeight <file>` and its byte size; look at the image to check content/orientation.
2. Pick the target row above; transparency ⇒ PNG/WebP, photo ⇒ JPEG/WebP.
3. Convert into `images/` with a conventional name. Verify: byte size within budget, `file` reports the right format, and **view the output** — check for quality loss on text/logos (bump quality to 90 and retry if edges look mushy).
4. Report before → after (dimensions and KB) so the user sees what happened.
5. If replacing an existing committed image, remember the old bytes stay in git history — that's fine, just don't churn multi-MB files repeatedly.
6. When wiring the `<img>` tag into a page, check whether its CSS constrains both width and height (e.g. a parent with fixed dimensions, or `width: 100%; height: 100%` of a fixed box) — if either axis is left `auto`, add `width`/`height` HTML attributes using the dimensions from step 1, so the browser reserves the right aspect-ratio box before the image loads instead of reflowing the page (see `AUDIT.md` §1 for the site-wide fix this pattern came from).
