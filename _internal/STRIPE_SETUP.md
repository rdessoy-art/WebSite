# Stripe Checkout Integration Setup Guide

This guide will help you complete the Stripe Checkout integration for your website.

## Overview

The Stripe Checkout integration has been set up to handle both single and multiple item purchases. Here's what's been implemented:

✅ Stripe.js added to all HTML pages
✅ Basket system updated to support Stripe Price IDs
✅ Checkout function created using Stripe Checkout API
✅ Success page (success.html) created
✅ Cancel page (cancel.html) created

## What You Need to Do

### 1. Get Your Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com/
2. Click on **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)

### 2. Update the Stripe Publishable Key

Open `basket.js` and replace the placeholder key on line 9:

```javascript
// Replace this line:
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';

// With your actual publishable key:
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51...'; // Your actual key
```

### 3. Get Your Stripe Price IDs

For each product, you need to create a Price in Stripe:

#### Option A: Use the Stripe Dashboard
1. Go to **Products** in your Stripe Dashboard
2. Click on a product (or create a new one)
3. Copy the **Price ID** (starts with `price_`)

#### Option B: Extract from Payment Links
If you're using Stripe Payment Links, you can find the Price IDs:
1. Go to **Payment Links** in Stripe Dashboard
2. Click on your payment link
3. The Price ID will be shown in the details

### 4. Update Product Price IDs

Update the Price IDs in your HTML files:

#### merchandise.html (Line 558)
```javascript
// Replace:
onclick="addToBasket('HD55 Beanie', 15.00, 'images/Drawing.jpg', 'https://buy.stripe.com/...', 'price_HD55_BEANIE_REPLACE_ME')"

// With your actual Price ID:
onclick="addToBasket('HD55 Beanie', 15.00, 'images/Drawing.jpg', 'https://buy.stripe.com/...', 'price_1234567890abcdef')"
```

#### fanclub.html (Line 788)
```javascript
// Replace:
onclick="addToBasket('The Fan - Racing Club Membership', 50, 'images/HD55beanie.png', 'https://buy.stripe.com/...', 'price_FAN_MEMBERSHIP_REPLACE_ME')"

// With your actual Price ID:
onclick="addToBasket('The Fan - Racing Club Membership', 50, 'images/HD55beanie.png', 'https://buy.stripe.com/...', 'price_1234567890abcdef')"
```

## How It Works

### Single Item Purchase
- User clicks "Add to Basket" → Item added to basket
- User clicks "Checkout" → Redirects to Stripe Checkout with that single item
- After payment → Redirects to success.html

### Multiple Item Purchase
- User adds multiple items to basket
- User clicks "Checkout" → Redirects to Stripe Checkout with all items as line items
- After payment → Redirects to success.html

### Payment Flow
1. User clicks "Checkout"
2. Stripe Checkout opens with all basket items
3. User enters payment and shipping details
4. On success → Redirected to `success.html` (basket is cleared)
5. On cancel → Redirected to `cancel.html` (basket items preserved)

## Testing

### Test Mode
1. Use your test mode API keys (start with `pk_test_`)
2. Use test card: `4242 4242 4242 4242`
3. Use any future expiry date and any CVC

### Going Live
1. Replace `pk_test_` with your live `pk_live_` key
2. Test the checkout flow one more time
3. Make a real test purchase (you can refund it later)

## Product Structure

Each product in your basket needs:
- **name**: Product name
- **price**: Price in GBP (e.g., 15.00)
- **image**: Product image path
- **stripeLink**: Stripe Payment Link (for fallback/single items)
- **stripePriceId**: Stripe Price ID (for checkout with multiple items)

## Shipping Countries

The checkout is currently configured to allow shipping to:
- United Kingdom (GB)
- United States (US)
- Canada (CA)
- Australia (AU)
- New Zealand (NZ)
- Ireland (IE)

To modify this, edit the `shippingAddressCollection` in `basket.js` (line 200).

## Troubleshooting

### "Stripe is not configured" error
- Check that you've replaced `STRIPE_PUBLISHABLE_KEY` in basket.js
- Make sure Stripe.js is loading (check browser console)

### "Some items are missing payment information" error
- Verify all products have valid Price IDs
- Check that Price IDs start with `price_`

### Checkout doesn't redirect
- Check browser console for errors
- Verify Price IDs are correct
- Make sure you're using the correct Stripe account

## Need Help?

- Stripe Documentation: https://stripe.com/docs/payments/checkout
- Stripe Support: https://support.stripe.com/
- Contact: Robert@DessoyRacing.com

## Security Notes

⚠️ **Important**: Never commit your Stripe Secret Key (starts with `sk_`) to your repository. Only use the Publishable Key in your frontend code.

The Publishable Key is safe to expose in your HTML/JS as it can only create checkout sessions, not process refunds or access sensitive data.
