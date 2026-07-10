# Stripe Payment Setup Guide

**How this site actually takes payments:** every "Buy Now" / "Join Now" button is a plain link to a Stripe-hosted **Payment Link** (`https://buy.stripe.com/...`). There is no checkout session, no cart, no Price IDs wired into the site's JavaScript, and (as of 2026-07-10) no `basket.js` at all. Clicking a button opens Stripe's hosted page directly in a new tab; Stripe handles the whole payment, then redirects to `success.html` or `cancel.html`.

This is simpler than a Checkout Session integration and requires zero code changes to add a new product — you only need a new link.

## Creating a new Payment Link

1. Stripe Dashboard → **Payment Links** → **+ New**
2. Add the product (name, price, image) or pick an existing one
3. Configure options as needed:
   - Shipping countries, if it's a physical product (Settings → Shipping address collection)
   - Quantity limits, if relevant
4. Save — Stripe gives you a URL like `https://buy.stripe.com/abc123xyz`
5. Set the **success URL** to `https://dessoyracing.com/success.html` and the **cancel/back URL** to `https://dessoyracing.com/cancel.html` (Payment Link settings → After payment)

## Wiring it into the site

### Simple case — one link, one button
```html
<a href="https://buy.stripe.com/your_new_link" target="_blank" rel="noopener" class="cta-button">Buy Now</a>
```
That's the entire integration. See any `sponsor-*.html` CTA button or a `fanclub.html` membership tier for the exact pattern to copy.

### Variant case — color/size selectors (merchandise.html)
`merchandise.html` has products with color variants (cap, beanie). Each color maps to its own Payment Link inside a `buyX()` function, e.g.:

```javascript
function buyBeanie() {
    const selectedColor = document.getElementById('beanie-color').value;
    let paymentLink;
    if (selectedColor === 'black') {
        paymentLink = 'https://buy.stripe.com/dRmaEX1lU3pa5sx25V9k40a';
    } else if (selectedColor === 'yellow') {
        paymentLink = 'https://buy.stripe.com/3cI4gz1lUf7S1ch25V9k40b';
    } else {
        paymentLink = 'https://buy.stripe.com/14A8wP8Ome3O4ot8uj9k403'; // red, default
    }
    window.open(paymentLink, '_blank', 'noopener');
}
```
To add a new color/size variant: create the Payment Link in Stripe, add a branch to the relevant `buyX()` function, and add the option to the matching `<select>`. There's a matching `changeXImage()` function per product that swaps the preview photo the same way — see the `add-product` Claude Code skill for the full checklist (including image optimization).

## Testing

- Stripe Payment Links have their own test-mode toggle in the Dashboard — no code-side test/live key to swap, since nothing in this repo holds a Stripe key at all
- Test card: `4242 4242 4242 4242`, any future expiry, any CVC
- To go live: switch the Payment Link itself to live mode in the Dashboard (or create a new live-mode link) and swap the URL in the HTML

## Troubleshooting

**Button does nothing / wrong product opens** — check the `href` (or the `paymentLink` variable for variant products) points at the correct Payment Link URL, and that you copied it from the correct (test vs. live) Stripe mode.

**Redirect after payment goes to the wrong place** — check the Payment Link's own "after payment" URL settings in the Stripe Dashboard; this site does not control that redirect from its own code.

## Need Help?

- Stripe Payment Links docs: https://stripe.com/docs/payment-links
- Stripe Support: https://support.stripe.com/
- Contact: Robert@DessoyRacing.com

## Security Notes

No Stripe key of any kind belongs in this repository. Payment Links require no publishable or secret key in the site's code — the link itself is the only thing Stripe needs, and it can only be used to pay for the product it was created for.
