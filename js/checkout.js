// ========================================
// Оформление заказа
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
});

let selectedDelivery = 'pickup';
let selectedPayment = 'card';
let additionalOptions = {
    giftWrap: false,
    qualityCheck: false,
    express: false
};

function initCheckout() {
    const checkoutForm = document.getElementById('checkoutForm');
    
    // Проверка пустой корзины
    if (cart.items.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    // Отрисовка товаров в заказе
    renderOrderItems();
    
    // Инициализация выбора доставки
    initDeliverySelection();
    
    // Инициализация выбора оплаты
    initPaymentSelection();
    
    // Инициализация дополнительных опций
    initAdditionalOptions();
    
    // Обновление итогов
    updateCheckoutTotal();
    
    // Обработка формы
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
    
    // Инициализация маски телефона
    initPhoneMask();
}

function renderOrderItems() {
    const orderItems = document.getElementById('orderItems');
    if (!orderItems) return;
    
    orderItems.innerHTML = cart.items.map(item => `
        <div class="order-item">
            <div class="order-item-image">
                <i class="fas ${item.image}"></i>
            </div>
            <div class="order-item-info">
                <h4>${item.title}</h4>
                <p>${getMaterialLabel(item.options.material)}, ${item.options.color}</p>
                <p>× ${item.quantity} шт.</p>
            </div>
            <div class="order-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
    `).join('');
}

function initDeliverySelection() {
    const deliveryRadios = document.querySelectorAll('input[name="deliveryType"]');
    
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedDelivery = e.target.value;
            
            // Поле адреса
            const addressInput = document.getElementById('address');
            const cityInput = document.getElementById('city');
            const postalInput = document.getElementById('postalCode');
            
            if (selectedDelivery === 'pickup') {
                if (addressInput) addressInput.disabled = true;
                if (cityInput) cityInput.disabled = true;
                if (postalInput) postalInput.disabled = true;
            } else {
                if (addressInput) addressInput.disabled = false;
                if (cityInput) cityInput.disabled = false;
                if (postalInput) postalInput.disabled = false;
            }
            
            updateCheckoutTotal();
        });
    });
}

function initPaymentSelection() {
    const paymentRadios = document.querySelectorAll('input[name="paymentType"]');
    
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedPayment = e.target.value;
        });
    });
}

function initAdditionalOptions() {
    const giftWrap = document.getElementById('giftWrap');
    const qualityCheck = document.getElementById('qualityCheck');
    const express = document.getElementById('express');
    
    if (giftWrap) {
        giftWrap.addEventListener('change', (e) => {
            additionalOptions.giftWrap = e.target.checked;
            updateCheckoutTotal();
        });
    }
    
    if (qualityCheck) {
        qualityCheck.addEventListener('change', (e) => {
            additionalOptions.qualityCheck = e.target.checked;
            updateCheckoutTotal();
        });
    }
    
    if (express) {
        express.addEventListener('change', (e) => {
            additionalOptions.express = e.target.checked;
            updateCheckoutTotal();
        });
    }
}

function updateCheckoutTotal() {
    const subtotal = cart.getSubtotal();
    const shipping = cart.getShipping(selectedDelivery);
    
    let optionsTotal = 0;
    if (additionalOptions.giftWrap) optionsTotal += 200;
    if (additionalOptions.qualityCheck) optionsTotal += 500;
    if (additionalOptions.express) optionsTotal += subtotal * 0.3;
    
    const total = subtotal + shipping + optionsTotal;
    
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutShipping = document.getElementById('checkoutShipping');
    const checkoutOptions = document.getElementById('checkoutOptions');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = formatPrice(subtotal);
    if (checkoutShipping) checkoutShipping.textContent = formatPrice(shipping);
    if (checkoutOptions) checkoutOptions.textContent = formatPrice(optionsTotal);
    if (checkoutTotal) checkoutTotal.textContent = formatPrice(total);
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Валидация
    if (selectedDelivery !== 'pickup') {
        if (!data.address || !data.city) {
            cart.showNotification('Заполните адрес доставки', 'error');
            return;
        }
    }
    
    // Имитация отправки заказа
    const orderNumber = generateOrderNumber();
    
    // Сохранение заказа в localStorage
    const order = {
        number: orderNumber,
        date: new Date().toISOString(),
        items: [...cart.items],
        customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone
        },
        delivery: {
            type: selectedDelivery,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            comment: data.comment
        },
        payment: selectedPayment,
        options: additionalOptions,
        total: calculateTotal(data)
    };
    
    saveOrder(order);
    
    // Очистка корзины
    cart.clear();
    
    // Показ модального окна
    showOrderSuccess(orderNumber);
}

function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `#${year}${month}${day}-${random}`;
}

function calculateTotal(data) {
    const subtotal = cart.getSubtotal();
    const shipping = cart.getShipping(selectedDelivery);
    
    let optionsTotal = 0;
    if (additionalOptions.giftWrap) optionsTotal += 200;
    if (additionalOptions.qualityCheck) optionsTotal += 500;
    if (additionalOptions.express) optionsTotal += subtotal * 0.3;
    
    return subtotal + shipping + optionsTotal;
}

function saveOrder(order) {
    const orders = getOrders();
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

function getOrders() {
    const saved = localStorage.getItem('orders');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            return [];
        }
    }
    return [];
}

function showOrderSuccess(orderNumber) {
    const modal = document.getElementById('orderSuccessModal');
    const orderNumberEl = document.getElementById('orderNumber');
    
    if (orderNumberEl) {
        orderNumberEl.textContent = orderNumber;
    }
    
    if (modal) {
        modal.classList.add('active');
    } else {
        // Если модального окна нет, показываем alert
        alert(`Заказ успешно оформлен!\n\nНомер заказа: ${orderNumber}\n\nНа email отправлено подтверждение.`);
        window.location.href = 'index.html';
    }
}

function initPhoneMask() {
    const phoneInput = document.getElementById('phone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value[0] === '7' || value[0] === '8') {
                    value = value.substring(1);
                }
                value = '7' + value;
            }
            if (value.length > 11) value = value.substring(0, 11);
            
            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.substring(1, 4);
            if (value.length > 4) formatted += ') ' + value.substring(4, 7);
            if (value.length > 7) formatted += '-' + value.substring(7, 9);
            if (value.length > 9) formatted += '-' + value.substring(9, 11);
            
            e.target.value = formatted;
        });
    }
}

function getMaterialLabel(materialId) {
    const material = materials.find(m => m.id === materialId);
    return material ? material.label : materialId;
}

// Закрытие модального окна по клику вне его
document.addEventListener('click', (e) => {
    const modal = document.getElementById('orderSuccessModal');
    if (modal && e.target === modal) {
        window.location.href = 'index.html';
    }
});
