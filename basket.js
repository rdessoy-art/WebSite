// Basket sidebar for Harrison Dessoy Racing
// Note: purchases use direct buy.stripe.com links; this file provides the
// sidebar UI and notification helper only.

function getBasket() {
    const basketData = localStorage.getItem('hdRacingBasket');
    return basketData ? JSON.parse(basketData) : [];
}

function saveBasket(basket) {
    localStorage.setItem('hdRacingBasket', JSON.stringify(basket));
}

function removeFromBasket(itemId) {
    let basket = getBasket();
    basket = basket.filter(item => item.id !== itemId);
    saveBasket(basket);
    updateBasketDisplay();
    showNotification('Item removed from basket', 'info');
}

function updateBasketDisplay() {
    const basket = getBasket();

    const countElement = document.getElementById('basketCount');
    if (countElement) {
        countElement.textContent = basket.length;
        countElement.style.display = basket.length === 0 ? 'none' : 'flex';
    }

    const basketItemsContainer = document.getElementById('basketItems');
    if (basketItemsContainer) {
        if (basket.length === 0) {
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

    const total = basket.reduce((sum, item) => sum + item.price, 0);
    const totalElement = document.getElementById('basketTotal');
    if (totalElement) {
        totalElement.textContent = `£${total.toFixed(2)}`;
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = basket.length === 0;
    }
}

function toggleBasket() {
    const sidebar = document.getElementById('basketSidebar');
    const overlay = document.getElementById('basketOverlay');

    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
}

function checkout() {
    const basket = getBasket();

    if (basket.length === 0) {
        showNotification('Your basket is empty!', 'error');
        return;
    }

    if (basket.length === 1 && basket[0].stripeLink) {
        window.open(basket[0].stripeLink, '_blank');
        showNotification('Redirecting to checkout...', 'success');
        return;
    }

    // Multiple items — fall back to email
    const itemsList = basket.map(item => `${item.name} - £${item.price.toFixed(2)}`).join('%0A');
    const total = basket.reduce((sum, item) => sum + item.price, 0);
    const subject = 'Order from Website';
    const body = `Hi, I would like to purchase:%0A%0A${itemsList}%0A%0ATotal: £${total.toFixed(2)}%0A%0AThank you!`;
    window.location.href = `mailto:Robert@DessoyRacing.com?subject=${subject}&body=${body}`;
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.basket-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `basket-notification basket-notification-${type}`;
    notification.textContent = message;
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

    if (!document.querySelector('#basket-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'basket-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to   { transform: translateX(0);     opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0);     opacity: 1; }
                to   { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    updateBasketDisplay();
});
