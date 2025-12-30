/**
 * Newsletter Popup Functions
 * Shows a newsletter signup popup after 8 seconds on every page
 */

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
