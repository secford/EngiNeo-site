// ========================================
// Корзина покупок
// ========================================

class Cart {
    constructor() {
        this.items = [];
        this.load();
        this.updateCartCount();
    }

    // Загрузка корзины из localStorage
    load() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                this.items = [];
            }
        }
    }

    // Сохранение корзины в localStorage
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    // Добавление товара в корзину
    add(productId, options = {}) {
        const product = products.find(p => p.id === productId);
        if (!product) return false;

        const existingIndex = this.items.findIndex(item => 
            item.id === productId && 
            JSON.stringify(item.options) === JSON.stringify(options)
        );

        if (existingIndex !== -1) {
            this.items[existingIndex].quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                category: product.category,
                options: {
                    material: options.material || product.materials[0],
                    color: options.color || product.colors[0],
                    size: options.size || product.sizes[0]
                },
                quantity: 1
            });
        }

        this.save();
        this.showNotification('Товар добавлен в корзину', 'success');
        return true;
    }

    // Удаление товара из корзины
    remove(index) {
        this.items.splice(index, 1);
        this.save();
    }

    // Обновление количества товара
    updateQuantity(index, quantity) {
        if (quantity < 1) {
            this.remove(index);
            return;
        }
        this.items[index].quantity = quantity;
        this.save();
    }

    // Увеличение количества
    increaseQuantity(index) {
        this.items[index].quantity += 1;
        this.save();
    }

    // Уменьшение количества
    decreaseQuantity(index) {
        if (this.items[index].quantity > 1) {
            this.items[index].quantity -= 1;
        } else {
            this.remove(index);
        }
        this.save();
    }

    // Очистка корзины
    clear() {
        this.items = [];
        this.save();
    }

    // Получение общей суммы
    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Получение количества товаров
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Применение промокода
    applyPromoCode(code) {
        const promo = promoCodes[code.toUpperCase()];
        if (!promo) {
            return { valid: false, message: 'Неверный промокод' };
        }
        return { valid: true, promo };
    }

    // Расчёт доставки
    getShipping(deliveryType) {
        const shippingRates = {
            pickup: 0,
            courier: this.getSubtotal() > 5000 ? 0 : 300,
            post: this.getSubtotal() > 3000 ? 0 : 500
        };
        return shippingRates[deliveryType] || 0;
    }

    // Обновление счётчика корзины
    updateCartCount() {
        const countElements = document.querySelectorAll('#cartCount');
        const totalItems = this.getTotalItems();
        countElements.forEach(el => {
            el.textContent = totalItems;
            if (totalItems > 0) {
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    }

    // Показ уведомления
    showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Создаём глобальный экземпляр корзины
const cart = new Cart();

// Стили для уведомлений
const notificationStyles = `
<style>
    .cart-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s ease;
    }
    .cart-notification.show {
        transform: translateX(0);
    }
    .cart-notification.success {
        border-left: 4px solid #10b981;
    }
    .cart-notification.success i {
        color: #10b981;
    }
    .cart-notification.info {
        border-left: 4px solid #3b82f6;
    }
    .cart-notification.info i {
        color: #3b82f6;
    }
    .cart-notification.error {
        border-left: 4px solid #ef4444;
    }
    .cart-notification.error i {
        color: #ef4444;
    }
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);
