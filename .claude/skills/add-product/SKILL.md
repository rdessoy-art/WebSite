---
name: add-product
description: Add or update a product on the merchandise page — image optimization, product card, Stripe payment link wiring. Use this whenever the user mentions new merch, a product for the shop, updating prices/sizes, or "add the new hoodie/cap/t-shirt", even if they only hand you a product photo — raw product images have shipped at 8–9 MB each and made the shop unusable on mobile, so images must go through this flow.
---

# Add a merchandise product

## The one hard rule: optimize the image first

Product photos arrive as 8–9 MB design-export PNGs. The merchandise page once carried ~49 MB of them. Before anything else, run the source image through the `optimize-image` skill: **WebP, ≤300 KB, ~800 px on the long edge** (cards render ~400 px tall), lowercase-hyphenated name like `hoody-2026-front.webp`. Never commit the raw export.

## How purchases work here

Every buy button is a direct link to a Stripe-hosted payment page: `<a href="https://buy.stripe.com/...">`. There is no cart, no Stripe.js session, no server. **You cannot create these links** — they're made in the Stripe Dashboard (Products → Payment Links). If the user hasn't supplied one, ask for it (one link per product, or per size where sizes are separate links — see the existing hoodie markup for the per-size pattern). Never invent or placeholder a payment URL: a broken buy button costs real sales.

## Steps

1. Optimize image(s) → `images/` (front + rear shots use the carousel pattern — see the hoodie card's `product-carousel` markup).
2. Add a `.product-card` to the grid in `merchandise.html`, copying an existing card: image (or carousel), `<h3>` name, `.product-price` (£, `.toFixed(2)` style formatting, e.g. `£25.00`), `.shipping-note` if applicable, description, size selector if sizes exist, buy button with the real `buy.stripe.com` link (`target="_blank" rel="noopener"`). If it's a carousel, add `loading="lazy"` to every slide after the first (front-facing) one — those are never visible without a user clicking the arrow, so it's free perf with zero risk.
3. If a product is retired, remove its card and (ask first) archive its images.

## Verify

- `verify-site` skill: card renders at desktop and ≤768 px mobile width, carousel arrows/indicators work if used, buy link opens the correct Stripe page (check the product name and price on the Stripe page match).
- `python3 scripts/site-check.py` — especially the oversized-image check.
