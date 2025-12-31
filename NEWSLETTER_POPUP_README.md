# Newsletter Popup Implementation Guide

This guide explains how the newsletter popup works and how to add it to additional pages.

## Overview

The newsletter popup appears after 8 seconds on every page and includes:
- A name field for user's name
- An email field for user's email address
- An image of Harrison Dessoy racing (IDM Assen.jpg) displayed on the left
- Mailchimp integration for newsletter signups
- 7-day dismissal period (won't show again for 7 days after closing)

## Files

- `newsletter-popup.css` - Styles for the popup
- `newsletter-popup.js` - JavaScript functionality
- `newsletter-popup.html` - HTML markup (reference only)

## How to Add to a New Page

To add the newsletter popup to any page, follow these 3 steps:

### 1. Add CSS Link to `<head>`

Add this line before the closing `</head>` tag:

```html
<link rel="stylesheet" href="newsletter-popup.css">
```

### 2. Add HTML Markup Before `</body>`

Add this markup before the closing `</body>` tag:

```html
<!-- Newsletter Popup Modal -->
<div id="newsletterPopup" class="newsletter-popup-overlay" style="display: none;">
    <div class="newsletter-popup-modal">
        <button class="newsletter-popup-close" onclick="closeNewsletterPopup()">&times;</button>
        <div class="newsletter-popup-container">
            <div class="newsletter-popup-image">
                <img src="images/IDM Assen.jpg" alt="Harrison Dessoy Racing">
            </div>
            <div class="newsletter-popup-content">
                <h3 id="newsletterTitle">Stay Updated!</h3>
                <p id="newsletterMessage">Get exclusive racing updates, behind-the-scenes content, and special announcements delivered to your inbox.</p>
                <form id="newsletterForm" class="newsletter-popup-form" action="https://gmail.us14.list-manage.com/subscribe/post?u=dba85c89d82fef7f216d3993b&amp;id=6ff0d772ac&amp;f_id=0071bce5f0" method="post" target="hidden_iframe">
                    <input type="text" name="FNAME" id="newsletterName" placeholder="Enter your name" required>
                    <input type="email" name="EMAIL" id="newsletterEmail" placeholder="Enter your email" required>
                    <!-- Anti-bot honeypot field -->
                    <div style="position: absolute; left: -5000px;" aria-hidden="true">
                        <input type="text" name="b_dba85c89d82fef7f216d3993b_6ff0d772ac" tabindex="-1" value="">
                    </div>
                    <button type="submit" class="newsletter-submit-btn" id="newsletterSubmitBtn">Subscribe</button>
                </form>
                <p class="newsletter-popup-privacy">We respect your privacy. Unsubscribe anytime.</p>
            </div>
        </div>
    </div>
</div>

<!-- Hidden iframe for form submission -->
<iframe name="hidden_iframe" id="hidden_iframe" style="display:none;"></iframe>
```

### 3. Add JavaScript Before `</body>`

Add this line after the HTML markup and before the closing `</body>` tag:

```html
<script src="newsletter-popup.js"></script>
```

## Pages Already Updated

The newsletter popup has been added to:
- ✅ index.html
- ✅ events.html
- ✅ fanclub.html
- ✅ merchandise.html

## Configuration

### Timing
The popup appears after **8 seconds**. To change this, edit the timeout value in `newsletter-popup.js`:

```javascript
// Show popup after 8 seconds
setTimeout(() => {
    showNewsletterPopup();
}, 8000); // Change this value (in milliseconds)
```

### Dismissal Period
The popup won't show again for **7 days** after being closed. To change this, edit `newsletter-popup.js`:

```javascript
const expiryTime = dismissalTime + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
```

### Image Path
The image path is set to `images/IDM Assen.jpg`. If pages are in subdirectories, you may need to adjust the path:
- For pages in root: `images/IDM Assen.jpg`
- For pages in subdirectories: `../images/IDM Assen.jpg` or adjust as needed

## Features

- **Name Field**: Captures user's name (FNAME field in Mailchimp)
- **Email Field**: Captures user's email (required)
- **Image**: Displays racing image on the left side
- **Responsive**: Stacks vertically on mobile devices
- **Auto-hide**: Automatically hides after successful submission
- **Mailchimp Integration**: Submits to Mailchimp list via iframe
- **LocalStorage**: Remembers dismissal for 7 days

## Testing

To test the popup:
1. Clear localStorage: Open browser console and run `localStorage.removeItem('newsletterPopupDismissed')`
2. Reload the page
3. Wait 8 seconds for the popup to appear
4. Test the form submission with a valid email

## Troubleshooting

### Popup doesn't appear
- Check browser console for errors
- Verify `newsletter-popup.js` is loading
- Check localStorage: run `localStorage.getItem('newsletterPopupDismissed')` in console
- Clear the dismissal: `localStorage.removeItem('newsletterPopupDismissed')`

### Styles look wrong
- Verify `newsletter-popup.css` is loading
- Check that CSS variables are defined in the page (--primary, --secondary, etc.)

### Form doesn't submit
- Check network tab to see if request is being sent
- Verify the Mailchimp action URL is correct
- Check that the hidden iframe exists
