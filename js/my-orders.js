const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchOrdersBtn');
    const emailInput = document.getElementById('emailInput');

    searchBtn?.addEventListener('click', () => searchOrders());
    emailInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchOrders();
    });
});

async function searchOrders() {
    const email = document.getElementById('emailInput').value.trim();

    if (!email) {
        alert('Введите email');
        return;
    }

    const list = document.getElementById('ordersList');
    list.innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const response = await fetch(`${API_BASE}/orders/email/${encodeURIComponent(email)}`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            renderOrders(result.data);
        } else {
            list.innerHTML = `
                <div class="orders-empty">
                    <i class="fas fa-box-open"></i>
                    <h2>Заказы не найдены</h2>
                    <p>По этому email заказов не найдено</p>
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

function renderOrders(orders) {
    const list = document.getElementById('ordersList');
    list.innerHTML = orders.map(order => {
        const item = order.items?.[0] || {};
        const card = document.createElement('div');
        card.className = 'order-card';
        card.dataset.orderId = order.id;
        card.innerHTML = `
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
            <div class="order-summary">
                <span>Сумма заказа:</span>
                <span class="order-total">${order.total} ₽</span>
            </div>
        `;
        return card.outerHTML;
    }).join('');

    // Добавляем обработчики
    list.querySelectorAll('.order-card').forEach(card => {
        card.addEventListener('click', () => viewOrderDetail(card.dataset.orderId));
    });
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
    document.getElementById('detailOrderNumber').textContent = order.number;
    document.getElementById('detailOrderContent').innerHTML = `
        <div class="order-detail-info">
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

window.viewOrderDetail = viewOrderDetail;
window.closeDetailModal = closeDetailModal;