/**
 * Newsletter Popup Functions
 * Shows a newsletter signup popup once a visitor has had a chance to look
 * around: after 20 seconds OR once they have scrolled about 40% of the page,
 * whichever comes first. Not shown again for 7 days after it is dismissed.
 * Keyboard accessible: Esc closes, Tab is kept inside the dialog, and focus
 * returns to where it was when the dialog closes.
 */

const NEWSLETTER_DELAY_MS = 20000;      // time-based trigger
const NEWSLETTER_SCROLL_DEPTH = 0.4;    // scroll-based trigger (40% of the page)
const NEWSLETTER_DISMISS_DAYS = 7;
const NEWSLETTER_STORAGE_KEY = 'newsletterPopupDismissed';

let newsletterPreviousFocus = null;     // element to give focus back to on close

// Builds and inserts the popup + hidden iframe. Call once, synchronously,
// before this file's own DOMContentLoaded listener runs (i.e. anywhere in a
// normal <script> tag — just don't defer/async it) so the form/title/message
// elements exist by the time that listener looks for them.
function renderNewsletterPopup() {
    if (document.getElementById('newsletterPopup')) return; // already rendered

    document.body.insertAdjacentHTML('beforeend', `
    <div id="newsletterPopup" class="newsletter-popup-overlay" style="display: none;">
        <div class="newsletter-popup-modal" role="dialog" aria-modal="true" aria-labelledby="newsletterTitle" tabindex="-1">
            <button type="button" class="newsletter-popup-close" aria-label="Close" onclick="closeNewsletterPopup()">&times;</button>
            <div class="newsletter-popup-container">
                <div class="newsletter-popup-image">
                    <picture><source type="image/avif" srcset="images/optimised/idm-assen-480.avif 480w, images/optimised/idm-assen-960.avif 960w, images/optimised/idm-assen-1600.avif 1600w" sizes="(min-width: 600px) 300px, 100vw"><source type="image/webp" srcset="images/optimised/idm-assen-480.webp 480w, images/optimised/idm-assen-960.webp 960w, images/optimised/idm-assen-1600.webp 1600w" sizes="(min-width: 600px) 300px, 100vw"><img src="images/optimised/idm-assen-960.jpg" srcset="images/optimised/idm-assen-480.jpg 480w, images/optimised/idm-assen-960.jpg 960w, images/optimised/idm-assen-1600.jpg 1600w" sizes="(min-width: 600px) 300px, 100vw" width="960" height="1200" loading="lazy" decoding="async" alt="Harrison Dessoy Racing"></picture>
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
    <iframe name="hidden_iframe" id="hidden_iframe" style="display:none;"></iframe>`);
}

// Newsletter Popup Functions
function showNewsletterPopup() {
    const popup = document.getElementById('newsletterPopup');
    if (popup && popup.style.display !== 'flex') {
        newsletterPreviousFocus = document.activeElement;
        popup.style.display = 'flex';
        // Focus the dialog itself (not the first input) so a phone keyboard
        // does not pop up; the first Tab then lands on the first control.
        const modal = popup.querySelector('.newsletter-popup-modal');
        if (modal) modal.focus();
    }
}

function closeNewsletterPopup() {
    const popup = document.getElementById('newsletterPopup');
    if (popup) {
        popup.style.display = 'none';
        // Remember the dismissal. localStorage can throw (e.g. Safari private
        // mode), so never let that break closing the popup.
        try {
            const expiryTime = Date.now() + (NEWSLETTER_DISMISS_DAYS * 24 * 60 * 60 * 1000);
            localStorage.setItem(NEWSLETTER_STORAGE_KEY, expiryTime.toString());
        } catch (e) { /* ignore */ }
        if (newsletterPreviousFocus && typeof newsletterPreviousFocus.focus === 'function') {
            newsletterPreviousFocus.focus();
        }
        newsletterPreviousFocus = null;
    }
}

function checkNewsletterPopup() {
    let dismissalExpiry = null;
    try {
        dismissalExpiry = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    } catch (e) { /* storage unavailable: treat as not dismissed */ }

    // Still within the dismissal window: stay quiet
    if (dismissalExpiry && Date.now() < parseInt(dismissalExpiry)) {
        return;
    }

    // Clear an expired dismissal
    if (dismissalExpiry) {
        try { localStorage.removeItem(NEWSLETTER_STORAGE_KEY); } catch (e) { /* ignore */ }
    }

    // Two triggers; whichever fires first shows the popup and cancels the other.
    let timer = null;
    const trigger = () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', onScroll);
        showNewsletterPopup();
    };
    const onScroll = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable > 0 && window.scrollY / scrollable >= NEWSLETTER_SCROLL_DEPTH) {
            trigger();
        }
    };
    timer = setTimeout(trigger, NEWSLETTER_DELAY_MS);
    window.addEventListener('scroll', onScroll, { passive: true });
}

// Keyboard: Esc closes; Tab / Shift+Tab stay inside the dialog while it is open.
document.addEventListener('keydown', function(e) {
    const popup = document.getElementById('newsletterPopup');
    if (!popup || popup.style.display !== 'flex') return;

    if (e.key === 'Escape') {
        closeNewsletterPopup();
        return;
    }
    if (e.key !== 'Tab') return;

    const focusable = Array.from(popup.querySelectorAll(
        'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), a[href], [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null);   // skip hidden elements (e.g. the form after success)
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const modal = popup.querySelector('.newsletter-popup-modal');
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
});

// Handle newsletter form submission
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            // Show success message
            const title = document.getElementById('newsletterTitle');
            const message = document.getElementById('newsletterMessage');
            const form = document.getElementById('newsletterForm');

            if (title && message && form) {
                // Change the content to show success
                setTimeout(function() {
                    title.textContent = 'Almost There!';
                    message.textContent = 'Please check your email and click the confirmation link to complete your subscription.';
                    form.style.display = 'none';

                    // Close popup after 4 seconds
                    setTimeout(function() {
                        closeNewsletterPopup();
                        // Reset the popup content for next time
                        title.textContent = 'Stay Updated!';
                        message.textContent = 'Get exclusive racing updates, behind-the-scenes content, and special announcements delivered to your inbox.';
                        form.style.display = 'flex';
                        const nameField = document.getElementById('newsletterName');
                        const emailField = document.getElementById('newsletterEmail');
                        if (nameField) nameField.value = '';
                        if (emailField) emailField.value = '';
                    }, 4000);
                }, 500);
            }
        });
    }

    // Check if we should show the popup
    checkNewsletterPopup();
});

// Close popup when clicking outside the modal
document.addEventListener('click', function(e) {
    const popup = document.getElementById('newsletterPopup');
    if (popup && e.target === popup) {
        closeNewsletterPopup();
    }
});
