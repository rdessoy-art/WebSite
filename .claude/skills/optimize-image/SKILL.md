---
name: optimize-image
description: Optimize an image for the website before it is committed — resize, convert, compress to a size budget, and name it correctly. Use this every time an image enters the repo: new sponsor logos, merch product photos, profile/news photos, anything from a phone, camera, Canva or design export. Trigger even if the user just says "add this photo/logo" without mentioning size — raw exports have shipped at 8–9 MB and made pages unusable on mobile.
---

# Optimize an image for the site

Raw images are the #1 performance problem this site has had (a 49 MB merchandise page). Every image goes through **`tools/optimise_images.py`** before it is referenced from a page. Read `DESIGN.md` §5 for the markup patterns.

## The flow

1. Put the **original** in `images-src/` (never edit it, never reference it from a page). Lowercase-hyphenated name where you can (`phr-logo.png`, not `PHR Logo (2).PNG`).
2. If it is a **logo**, add its slug (lowercase, hyphens, no extension) to `LOGO_STEMS` in `tools/optimise_images.py`. Anything not listed is treated as a photo.
3. Preview, then generate: `python3 tools/optimise_images.py --dry-run`, then `python3 tools/optimise_images.py`. Needs Pillow (`pip install -r requirements.txt`).
4. Reference the generated files in `images/optimised/` using the `<picture>` pattern in `DESIGN.md` (photos) or a plain `<img>` with the logo `.webp`.
5. **View the output** — check text/logo edges for quality loss before committing. Report before → after sizes to the user.

## What the tool produces

| Kind | Output | Budget |
|---|---|---|
| Photo | `name-480/960/1600` in `.avif`, `.webp`, `.jpg` | ≤ 200 KB per file |
| Logo | one `name.webp`, long edge ≤ 800 px (header-size icons smaller) | ≤ 60 KB |
| SVG | leave as is | — |

Never commit a raw image over 200 KB; `python3 tools/check_site.py` fails if one appears outside `images-src/`.

## Rules for the `<img>` tag

- Always `alt`, `width` and `height` (the pixel size of the file in `src`). If CSS caps the width, add `height: auto`.
- `loading="lazy" decoding="async"` below the fold; none on above-the-fold images.
- Replacing an existing image under the same name? Browser caches will mask the change — flag it, or use a new filename.

## Manual fallback

`cwebp -q 80 -resize <width> 0 in.png -o out.webp` (Homebrew `webp`) is fine for a one-off, but the result still belongs in `images/optimised/` and the original in `images-src/`.
