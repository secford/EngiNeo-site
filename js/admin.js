const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadOrders();
    loadStats();
    initFilters();
});

function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.admin-content').forEach(content => {
                content.style.display = 'none';
            });

            const targetId = `tab-${tab.dataset.tab}`;
            document.getElementById(targetId).style.display = 'block';
        });
    });
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders/all`);
        const result = await response.json();

        if (result.success && result.data) {
            renderOrders(result.data);
        } else {
            document.getElementById('ordersTableBody').innerHTML = '<tr><td colspan="7">Нет заказов</td></tr>';
        }
    } catch (err) {
        console.error('Error loading orders:', err);
        document.getElementById('ordersTableBody').innerHTML = '<tr><td colspan="7" class="error">Ошибка загрузки</td></tr>';
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Нет заказов</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.number}</td>
            <td>${new Date(order.date).toLocaleDateString('ru-RU')}</td>
            <td>${order.items?.[0]?.title || '-'}</td>
            <td>${order.items?.[0]?.quantity || 1}</td>
            <td>${order.total} ₽</td>
            <td><span class="order-status ${order.status}">${getStatusLabel(order.status)}</span></td>
            <td class="order-actions">
                <button onclick="viewOrder('${order.id}')" title="Подробнее">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editOrderStatus('${order.id}')" title="Изменить статус">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
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

async function viewOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`);
        const result = await response.json();

        if (result.success) {
            showOrderModal(result.data);
        }
    } catch (err) {
        console.error('Error loading order:', err);
    }
}

function showOrderModal(order) {
    document.getElementById('modalOrderNumber').textContent = order.number;
    document.getElementById('modalOrderDetails').innerHTML = `
        <div class="order-detail-info">
            <p><strong>Дата:</strong> ${new Date(order.date).toLocaleString('ru-RU')}</p>
            <p><strong>Статус:</strong> <span class="order-status ${order.status}">${getStatusLabel(order.status)}</span></p>
            <p><strong>Товар:</strong> ${order.items?.[0]?.title}</p>
            <p><strong>Количество:</strong> ${order.items?.[0]?.quantity}</p>
            <p><strong>Материал:</strong> ${order.items?.[0]?.options?.material}</p>
            <p><strong>Принтер:</strong> ${order.items?.[0]?.options?.printer || 'Не указан'}</p>
            <p><strong>Итого:</strong> ${order.total} ₽</p>
            <p><strong>Доставка:</strong> ${order.delivery?.type}</p>
            <p><strong>Оплата:</strong> ${order.payment}</p>
            ${order.customer?.email ? `<p><strong>Email:</strong> ${order.customer.email}</p>` : ''}
            ${order.customer?.phone ? `<p><strong>Телефон:</strong> ${order.customer.phone}</p>` : ''}
        </div>
    `;
    document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

async function editOrderStatus(orderId) {
    const newStatus = prompt('Введите новый статус:\npending, processing, printing, quality-check, ready, shipped, delivered, cancelled');
    if (!newStatus) return;

    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await response.json();

        if (result.success) {
            alert('Статус обновлён');
            loadOrders();
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (err) {
        console.error('Error updating status:', err);
        alert('Ошибка обновления статуса');
    }
}

function initFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const searchOrder = document.getElementById('searchOrder');

    statusFilter?.addEventListener('change', filterOrders);
    searchOrder?.addEventListener('input', filterOrders);
}

async function filterOrders() {
    const status = document.getElementById('statusFilter')?.value;
    const search = document.getElementById('searchOrder')?.value.toLowerCase();

    try {
        const response = await fetch(`${API_BASE}/orders/all`);
        const result = await response.json();

        if (result.success && result.data) {
            let orders = result.data;

            if (status) {
                orders = orders.filter(o => o.status === status);
            }
            if (search) {
                orders = orders.filter(o => o.number?.toLowerCase().includes(search));
            }

            renderOrders(orders);
        }
    } catch (err) {
        console.error('Filter error:', err);
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/orders/all`);
        const result = await response.json();

        if (result.success && result.data) {
            const orders = result.data;
            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
            const avgProfit = totalOrders > 0 ? Math.round(totalRevenue * 0.3) : 0;
            const avgMargin = totalRevenue > 0 ? Math.round((avgProfit / totalRevenue) * 100) : 0;

            document.getElementById('totalOrders').textContent = totalOrders;
            document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString('ru-RU') + ' ₽';
            document.getElementById('avgProfit').textContent = avgProfit.toLocaleString('ru-RU') + ' ₽';
            document.getElementById('avgMargin').textContent = avgMargin + '%';
        }
    } catch (err) {
        console.error('Stats error:', err);
    }
}

window.viewOrder = viewOrder;
window.editOrderStatus = editOrderStatus;
window.closeOrderModal = closeOrderModal;