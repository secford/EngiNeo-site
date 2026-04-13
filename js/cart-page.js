// ========================================
// Страница корзины
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsContainer) return;
    
    if (cart.items.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartSummary.style.display = 'none';
        if (cartEmpty) cartEmpty.style.display = 'block';
        return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    cartItemsContainer.style.display = 'flex';
    cartSummary.style.display = 'block';
    
    // Отрисовка товаров
    cartItemsContainer.innerHTML = cart.items.map((item, index) => `
        <div class="cart-item" data-index="${index}">
            <div class="cart-item-image">
                <i class="fas ${item.image}"></i>
            </div>
            <div class="cart-item-info">
                <h3>${item.title}</h3>
                <div class="cart-item-options">
                    <span class="cart-item-option">${getMaterialLabel(item.options.material)}</span>
                    <span class="cart-item-option">${item.options.color}</span>
                    <span class="cart-item-option">${getSizeLabel(item.options.size)}</span>
                </div>
                <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn decrease-qty" data-index="${index}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase-qty" data-index="${index}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item" data-index="${index}">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `).join('');
    
    // Навешиваем обработчики
    cartItemsContainer.querySelectorAll('.decrease-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            cart.decreaseQuantity(index);
            renderCart();
        });
    });
    
    cartItemsContainer.querySelectorAll('.increase-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            cart.increaseQuantity(index);
            renderCart();
        });
    });
    
    cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            cart.remove(index);
            renderCart();
        });
    });
    
    // Обновление итогов
    updateCartSummary();
}

function updateCartSummary() {
    const totalItems = document.getElementById('totalItems');
    const subtotalPrice = document.getElementById('subtotalPrice');
    const discountPrice = document.getElementById('discountPrice');
    const shippingPrice = document.getElementById('shippingPrice');
    const totalPrice = document.getElementById('totalPrice');
    
    if (totalItems) totalItems.textContent = cart.getTotalItems();
    if (subtotalPrice) subtotalPrice.textContent = formatPrice(cart.getSubtotal());
    if (discountPrice) discountPrice.textContent = '-0 ₽';
    if (shippingPrice) shippingPrice.textContent = 'Рассчитывается при оформлении';
    if (totalPrice) totalPrice.textContent = formatPrice(cart.getSubtotal());
}

function getMaterialLabel(materialId) {
    const material = materials.find(m => m.id === materialId);
    return material ? material.label : materialId;
}

function getSizeLabel(sizeId) {
    const sizes = {
        'small': 'Маленький',
        'medium': 'Средний',
        'large': 'Большой',
        'xl': 'XL'
    };
    return sizes[sizeId] || sizeId;
}

// Промокод
const applyPromoBtn = document.getElementById('applyPromo');
if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', () => {
        const promoInput = document.getElementById('promoInput');
        const code = promoInput?.value.trim();
        
        if (!code) {
            cart.showNotification('Введите промокод', 'error');
            return;
        }
        
        const result = cart.applyPromoCode(code);
        if (result.valid) {
            cart.showNotification(`Промокод применён: ${result.promo.description}`, 'success');
        } else {
            cart.showNotification('Неверный промокод', 'error');
        }
    });
}
