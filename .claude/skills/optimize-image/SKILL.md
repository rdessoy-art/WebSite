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

`cwebp` is **not installed** and `sips` cannot encode WebP here. In order of preference:

1. **WebP via cwebp** (best compression): needs `brew install webp` — ask the user before installing. Then:
   `cwebp -q 80 -resize <width> 0 in.png -o images/out.webp`
2. **Fallback that always works — `sips`:**
   - Photos (no transparency): `sips -Z <maxdim> -s format jpeg -s formatOptions 80 in.png --out images/out.jpg`
   - Logos needing transparency: keep PNG, just resize: `sips -Z <maxdim> in.png --out images/out.png`
   A 1200 px q80 JPEG lands well under 300 KB for normal photos — the fallback still turns 8 MB into ~150 KB.
3. HEIC inputs: `sips` converts them directly (`-s format jpeg`); don't commit the `.heic` original.

## Process

1. Inspect the source: `sips -g pixelWidth -g pixelHeight <file>` and its byte size; look at the image to check content/orientation.
2. Pick the target row above; transparency ⇒ PNG/WebP, photo ⇒ JPEG/WebP.
3. Convert into `images/` with a conventional name. Verify: byte size within budget, `file` reports the right format, and **view the output** — check for quality loss on text/logos (bump quality to 90 and retry if edges look mushy).
4. Report before → after (dimensions and KB) so the user sees what happened.
5. If replacing an existing committed image, remember the old bytes stay in git history — that's fine, just don't churn multi-MB files repeatedly.
