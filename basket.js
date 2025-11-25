// Shopping Basket System for Harrison Dessoy Racing
// Uses localStorage to persist basket across pages

// ====================================
// STRIPE CONFIGURATION
// ====================================
// Replace this with your Stripe Publishable Key
// Get this from: https://dashboard.stripe.com/apikeys
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';

// Initialize Stripe (will be set when page loads)
let stripe = null;

// Initialize Stripe when the script loads
if (typeof Stripe !== 'undefined') {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
}

// Get basket from localStorage or initialize empty basket
function getBasket() {
    const basketData = localStorage.getItem('hdRacingBasket');
    return basketData ? JSON.parse(basketData) : [];
}

// Save basket to localStorage
function saveBasket(basket) {
    localStorage.setItem('hdRacingBasket', JSON.stringify(basket));
}

// Add item to basket
function addToBasket(name, price, image, stripeLink, stripePriceId = null) {
    const basket = getBasket();

    // Check if item already exists
    const existingItem = basket.find(item => item.name === name);
    if (existingItem) {
        // Show message that item is already in basket
        showNotification('This item is already in your basket!', 'info');
        toggleBasket(); // Open basket to show item
        return;
    }

    // Add new item
    const newItem = {
        id: Date.now(), // Unique ID
        name: name,
        price: price,
        image: image,
        stripeLink: stripeLink,
        stripePriceId: stripePriceId // Store Stripe Price ID for checkout
    };

    basket.push(newItem);
    saveBasket(basket);
    updateBasketDisplay();
    showNotification('Added to basket!', 'success');

    // Optional: Open basket sidebar to show the added item
    setTimeout(() => toggleBasket(), 300);
}

// Remove item from basket
function removeFromBasket(itemId) {
    let basket = getBasket();
    basket = basket.filter(item => item.id !== itemId);
    saveBasket(basket);
    updateBasketDisplay();
    showNotification('Item removed from basket', 'info');
}

// Clear entire basket
function clearBasket() {
    localStorage.removeItem('hdRacingBasket');
    updateBasketDisplay();
}

// Update basket display (count, items, total)
function updateBasketDisplay() {
    const basket = getBasket();
    const basketCount = basket.length;

    // Update basket count badge
    const countElement = document.getElementById('basketCount');
    if (countElement) {
        countElement.textContent = basketCount;
        if (basketCount === 0) {
            countElement.style.display = 'none';
        } else {
            countElement.style.display = 'flex';
        }
    }

    // Update basket items display
    const basketItemsContainer = document.getElementById('basketItems');
    if (basketItemsContainer) {
        if (basketCount === 0) {
            basketItemsContainer.innerHTML = '<div class="basket-empty">Your basket is empty</div>';
        } else {
            basketItemsContainer.innerHTML = basket.map(item => `
                <div class="basket-item">
                    <img src="${item.image}" alt="${item.name}" class="basket-item-image" onerror="this.style.display='none'">
                    <div class="basket-item-details">
                        <div class="basket-item-name">${item.name}</div>
                        <div class="basket-item-price">£${item.price.toFixed(2)}</div>
                    </div>
                    <button class="remove-item" onclick="removeFromBasket(${item.id})" title="Remove from basket">✕</button>
                </div>
            `).join('');
        }
    }

    // Update total price
    const total = basket.reduce((sum, item) => sum + item.price, 0);
    const totalElement = document.getElementById('basketTotal');
    if (totalElement) {
        totalElement.textContent = `£${total.toFixed(2)}`;
    }

    // Enable/disable checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = basketCount === 0;
    }
}

// Toggle basket sidebar
function toggleBasket() {
    const sidebar = document.getElementById('basketSidebar');
    const overlay = document.getElementById('basketOverlay');

    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');

        // Prevent body scroll when basket is open
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

// Checkout function using Stripe Checkout
async function checkout() {
    const basket = getBasket();

    if (basket.length === 0) {
        showNotification('Your basket is empty!', 'error');
        return;
    }

    // Check if Stripe is initialized
    if (!stripe) {
        showNotification('Stripe is not configured. Please contact support.', 'error');
        console.error('Stripe not initialized. Please check STRIPE_PUBLISHABLE_KEY in basket.js');
        return;
    }

    // Check if all items have Price IDs
    const hasAllPriceIds = basket.every(item => item.stripePriceId);

    if (!hasAllPriceIds) {
        // Fallback for items without Price IDs
        if (basket.length === 1) {
            // Single item without Price ID - use payment link
            const item = basket[0];
            if (item.stripeLink) {
                window.open(item.stripeLink, '_blank');
                showNotification('Redirecting to checkout...', 'success');
                return;
            }
        }

        // Multiple items or no payment link - show error
        showNotification('Some items are missing payment information. Please contact support.', 'error');
        return;
    }

    // Build line items for Stripe Checkout
    const lineItems = basket.map(item => ({
        price: item.stripePriceId,
        quantity: 1
    }));

    try {
        showNotification('Redirecting to checkout...', 'info');

        // Get the current page URL for success/cancel redirects
        const currentUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
            lineItems: lineItems,
            mode: 'payment',
            successUrl: currentUrl + 'success.html?session_id={CHECKOUT_SESSION_ID}',
            cancelUrl: currentUrl + 'cancel.html',
            billingAddressCollection: 'required',
            shippingAddressCollection: {
                allowedCountries: ['GB', 'US', 'CA', 'AU', 'NZ', 'IE']
            }
        });

        if (error) {
            console.error('Stripe Checkout error:', error);
            showNotification('Checkout failed: ' + error.message, 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('An error occurred during checkout. Please try again.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.basket-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `basket-notification basket-notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;

    // Add animation keyframes
    if (!document.querySelector('#basket-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'basket-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close basket when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('basketSidebar');
    const basketIcon = document.querySelector('.basket-icon');

    if (sidebar && basketIcon && sidebar.classList.contains('active')) {
        if (!sidebar.contains(event.target) && !basketIcon.contains(event.target)) {
            // Click is outside basket and icon
            if (event.target.id === 'basketOverlay') {
                // Already handled by overlay onclick
                return;
            }
        }
    }
});

// Initialize basket on page load
document.addEventListener('DOMContentLoaded', function() {
    updateBasketDisplay();
});
