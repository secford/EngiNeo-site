const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    const searchBtn = document.getElementById('searchOrdersBtn');
    const emailInput = document.getElementById('emailInput');

    searchBtn?.addEventListener('click', () => searchOrders());
    emailInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchOrders();
    });
});

async function searchOrders() {
    const query = document.getElementById('emailInput').value.trim();

    if (!query) {
        alert('Введите email или номер заказа');
        return;
    }

    const list = document.getElementById('ordersList');
    list.innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const response = await fetch(`${API_BASE}/orders/track?q=${encodeURIComponent(query)}`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            renderOrders(result.data);
        } else {
            list.innerHTML = `
                <div class="orders-empty">
                    <i class="fas fa-box-open"></i>
                    <h2>Заказы не найдены</h2>
                    <p>По вашему запросу заказов не найдено</p>
                </div>
            `;
        }
    } catch (err) {
        console.error('Error searching orders:', err);
        list.innerHTML = `
            <div class="orders-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Ошибка</h2>
                <p>Не удалось загрузить заказы</p>
            </div>
        `;
    }
}

function getStatusStep(status) {
    const steps = {
        'pending': 1,
        'processing': 2,
        'printing': 3,
        'quality-check': 4,
        'ready': 5,
        'shipped': 6,
        'delivered': 7,
        'cancelled': -1
    };
    return steps[status] || 0;
}

function renderTimeline(order) {
    const steps = [
        { key: 'pending', label: 'Новый', icon: 'fa-clipboard-list' },
        { key: 'processing', label: 'В обработке', icon: 'fa-cogs' },
        { key: 'printing', label: 'Печать', icon: 'fa-print' },
        { key: 'quality-check', label: 'Проверка', icon: 'fa-search' },
        { key: 'ready', label: 'Готов', icon: 'fa-check-circle' },
        { key: 'shipped', label: 'Отправлен', icon: 'fa-truck' },
        { key: 'delivered', label: 'Доставлен', icon: 'fa-home' }
    ];

    const currentStep = getStatusStep(order.status);
    const isCancelled = order.status === 'cancelled';

    let html = '<div class="order-timeline">';
    
    if (isCancelled) {
        html += `
            <div class="timeline-cancelled">
                <i class="fas fa-times-circle"></i>
                <span>Заказ отменён</span>
            </div>
        `;
    } else {
        steps.forEach((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum <= currentStep;
            const isCurrent = stepNum === currentStep;
            const isFuture = stepNum > currentStep;

            html += `
                <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isFuture ? 'future' : ''}">
                    <div class="timeline-marker">
                        <i class="fas ${step.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <span class="timeline-label">${step.label}</span>
                    </div>
                    ${index < steps.length - 1 ? '<div class="timeline-line"></div>' : ''}
                </div>
            `;
        });
    }

    html += '</div>';
    return html;
}

function renderOrders(orders) {
    const list = document.getElementById('ordersList');
    list.innerHTML = orders.map(order => {
        const item = order.items?.[0] || {};
        const timeline = renderTimeline(order);
        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-card-header">
                    <span class="order-number">${order.number}</span>
                    <span class="order-status ${order.status}">${getStatusLabel(order.status)}</span>
                </div>
                <div class="order-card-body">
                    <div class="order-item-info">
                        <h4>${item.title || 'Товар'}</h4>
                        <p>Кол-во: ${item.quantity || 1}</p>
                        <p>Материал: ${item.options?.material || '-'}</p>
                    </div>
                    <div class="order-item-info">
                        <p>Дата: ${new Date(order.date).toLocaleDateString('ru-RU')}</p>
                        <p>Доставка: ${order.delivery?.type || '-'}</p>
                        <p>Оплата: ${order.payment || '-'}</p>
                    </div>
                </div>
                ${timeline}
                <div class="order-summary">
                    <span>Сумма заказа:</span>
                    <span class="order-total">${order.total} ₽</span>
                </div>
                <button class="btn btn-outline btn-small" onclick="viewOrderDetail('${order.id}')" style="margin-top:0.5rem;width:100%">
                    Подробнее
                </button>
            </div>
        `;
    }).join('');
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Новый',
        'processing': 'В обработке',
        'printing': 'Печать',
        'quality-check': 'Проверка',
        'ready': 'Готов',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменён'
    };
    return labels[status] || status;
}

async function viewOrderDetail(orderId) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`);
        const result = await response.json();
        if (result.success) {
            showDetailModal(result.data);
        }
    } catch (err) {
        console.error('Error loading order:', err);
    }
}

function showDetailModal(order) {
    const item = order.items?.[0] || {};
    const timeline = renderTimeline(order);
    document.getElementById('detailOrderNumber').textContent = order.number;
    document.getElementById('detailOrderContent').innerHTML = `
        ${timeline}
        <div class="order-detail-info" style="margin-top:1rem">
            <p><strong>Дата создания:</strong> ${new Date(order.date).toLocaleString('ru-RU')}</p>
            <p><strong>Статус:</strong> <span class="order-status ${order.status}">${getStatusLabel(order.status)}</span></p>
            <hr style="margin: 1rem 0; border-color: var(--border-color);">
            <p><strong>Товар:</strong> ${item.title || '-'}</p>
            <p><strong>Количество:</strong> ${item.quantity || 1}</p>
            <p><strong>Материал:</strong> ${item.options?.material || '-'}</p>
            <p><strong>Размер:</strong> ${item.options?.size || '-'}</p>
            <p><strong>Цвет:</strong> ${item.options?.color || '-'}</p>
            <hr style="margin: 1rem 0; border-color: var(--border-color);">
            <p><strong>Доставка:</strong> ${order.delivery?.type === 'pickup' ? 'Самовывоз' : order.delivery?.type === 'courier' ? 'Курьер' : 'Почта'}</p>
            <p><strong>Способ оплаты:</strong> ${order.payment === 'card' ? 'Карта' : order.payment === 'cash' ? 'Наличные' : 'Перевод'}</p>
            <hr style="margin: 1rem 0; border-color: var(--border-color);">
            <p><strong>Подытог:</strong> ${order.subtotal} ₽</p>
            <p><strong>Доставка:</strong> ${order.shipping} ₽</p>
            <p style="font-size: 1.25rem; font-weight: 700;"><strong>Итого:</strong> ${order.total} ₽</p>
            ${order.customer?.phone ? `<p><strong>Телефон:</strong> ${order.customer.phone}</p>` : ''}
            ${order.customer?.email ? `<p><strong>Email:</strong> ${order.customer.email}</p>` : ''}
        </div>
    `;
    document.getElementById('orderDetailModal').classList.add('active');
}

function closeDetailModal() {
    document.getElementById('orderDetailModal').classList.remove('active');
}

function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;
    const icon = toggleBtn.querySelector('i');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });
}

window.viewOrderDetail = viewOrderDetail;
window.closeDetailModal = closeDetailModal;
