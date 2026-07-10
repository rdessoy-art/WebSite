/**
 * Newsletter Popup Functions
 * Shows a newsletter signup popup after 8 seconds on every page
 */

// Builds and inserts the popup + hidden iframe. Call once, synchronously,
// before this file's own DOMContentLoaded listener runs (i.e. anywhere in a
// normal <script> tag — just don't defer/async it) so the form/title/message
// elements exist by the time that listener looks for them.
function renderNewsletterPopup() {
    if (document.getElementById('newsletterPopup')) return; // already rendered

    document.body.insertAdjacentHTML('beforeend', `
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
    <iframe name="hidden_iframe" id="hidden_iframe" style="display:none;"></iframe>`);
}

// Newsletter Popup Functions
function showNewsletterPopup() {
    const popup = document.getElementById('newsletterPopup');
    if (popup) {
        popup.style.display = 'flex';
    }
}

function closeNewsletterPopup() {
    const popup = document.getElementById('newsletterPopup');
    if (popup) {
        popup.style.display = 'none';
        // Store dismissal in localStorage for 7 days
        const dismissalTime = new Date().getTime();
        const expiryTime = dismissalTime + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
        localStorage.setItem('newsletterPopupDismissed', expiryTime.toString());
    }
}

function checkNewsletterPopup() {
    const dismissalExpiry = localStorage.getItem('newsletterPopupDismissed');
    const currentTime = new Date().getTime();

    // Check if popup was dismissed and if 7 days have passed
    if (dismissalExpiry && currentTime < parseInt(dismissalExpiry)) {
        // Popup is still dismissed
        return;
    }

    // Clear expired dismissal
    if (dismissalExpiry) {
        localStorage.removeItem('newsletterPopupDismissed');
    }

    // Show popup after 8 seconds
    setTimeout(() => {
        showNewsletterPopup();
    }, 8000);
}

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
