const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    checkAuth();
    document.getElementById('loginBtn')?.addEventListener('click', doLogin);
    document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doLogin();
    });
    document.getElementById('logoutBtn')?.addEventListener('click', doLogout);
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        document.getElementById('productModal').classList.add('active');
    });
    document.getElementById('productForm')?.addEventListener('submit', saveProduct);
    const stlInput = document.getElementById('prodStlFile');
    if (stlInput) {
        stlInput.addEventListener('change', function() {
            document.getElementById('stlFileName').textContent = this.files[0] ? this.files[0].name : 'Выберите STL файл';
        });
    }
});

function getToken() {
    return localStorage.getItem('admin_token');
}

function checkAuth() {
    const token = getToken();
    if (token) {
        fetch(`${API_BASE}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                showAdmin();
            } else {
                localStorage.removeItem('admin_token');
                showLogin();
            }
        })
        .catch(() => showLogin());
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
}

function showAdmin() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    initTabs();
    loadOrders();
    loadStats();
    loadProducts();
    initFilters();
}

async function doLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorEl = document.getElementById('loginError');

    if (!username || !password) {
        errorEl.textContent = 'Введите логин и пароль';
        errorEl.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (result.success) {
            localStorage.setItem('admin_token', result.data.token);
            errorEl.style.display = 'none';
            showAdmin();
        } else {
            errorEl.textContent = result.error || 'Ошибка входа';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        errorEl.textContent = 'Ошибка соединения с сервером';
        errorEl.style.display = 'block';
    }
}

function doLogout() {
    localStorage.removeItem('admin_token');
    showLogin();
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.admin-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(`tab-${tab.dataset.tab}`).style.display = 'block';
        });
    });
}

function authFetch(url, options = {}) {
    const token = getToken();
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {})
        }
    });
}

async function loadOrders() {
    try {
        const response = await authFetch(`${API_BASE}/orders/all`);
        const result = await response.json();
        if (result.success && result.data) {
            renderOrders(result.data);
        } else {
            document.getElementById('ordersTableBody').innerHTML = '<tr><td colspan="7">Нет заказов</td></tr>';
        }
    } catch (err) {
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
                <button onclick="viewOrder('${order.id}')" title="Подробнее"><i class="fas fa-eye"></i></button>
                <button onclick="editOrderStatus('${order.id}')" title="Изменить статус"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Новый', 'processing': 'В обработке', 'printing': 'Печать',
        'quality-check': 'Проверка', 'ready': 'Готов', 'shipped': 'Отправлен',
        'delivered': 'Доставлен', 'cancelled': 'Отменён'
    };
    return labels[status] || status;
}

async function viewOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`);
        const result = await response.json();
        if (result.success) showOrderModal(result.data);
    } catch (err) {}
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
        if (result.success) { alert('Статус обновлён'); loadOrders(); }
        else { alert('Ошибка: ' + result.error); }
    } catch (err) { alert('Ошибка обновления статуса'); }
}

function initFilters() {
    document.getElementById('statusFilter')?.addEventListener('change', filterOrders);
    document.getElementById('searchOrder')?.addEventListener('input', filterOrders);
}

async function filterOrders() {
    const status = document.getElementById('statusFilter')?.value;
    const search = document.getElementById('searchOrder')?.value.toLowerCase();
    try {
        const response = await fetch(`${API_BASE}/orders/all`);
        const result = await response.json();
        if (result.success && result.data) {
            let orders = result.data;
            if (status) orders = orders.filter(o => o.status === status);
            if (search) orders = orders.filter(o => o.number?.toLowerCase().includes(search));
            renderOrders(orders);
        }
    } catch (err) {}
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
    } catch (err) {}
}

async function saveProduct(e) {
    e.preventDefault();
    const title = document.getElementById('prodTitle').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    if (!title || !price) { alert('Укажите название и цену'); return; }

    const data = {
        title,
        price,
        description: document.getElementById('prodDescription').value.trim(),
        category: document.getElementById('prodCategory').value,
        categoryLabel: document.getElementById('prodCategory').selectedOptions[0].text,
        materials: document.getElementById('prodMaterials').value.split(',').map(s => s.trim()).filter(Boolean),
        colors: document.getElementById('prodColors').value.split(',').map(s => s.trim()).filter(Boolean),
        badge: document.getElementById('prodBadge').value.trim() || undefined,
        image: document.getElementById('prodImage').value.trim() || 'fa-cube'
    };

    try {
        const response = await authFetch(`${API_BASE}/products`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            const productId = result.data.id;
            const stlInput = document.getElementById('prodStlFile');
            if (stlInput && stlInput.files.length > 0) {
                const formData = new FormData();
                formData.append('stlFile', stlInput.files[0]);
                try {
                    await authFetch(`${API_BASE}/products/${productId}/stl`, {
                        method: 'POST',
                        body: formData
                    });
                } catch (stlErr) {
                    console.warn('STL not uploaded', stlErr);
                }
            }
            alert('Товар добавлен!');
            closeProductModal();
            loadProducts();
        } else {
            alert('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
        }
    } catch (err) {
        alert('Ошибка сохранения товара');
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
}

async function loadProducts() {
    const grid = document.getElementById('adminProductsGrid');
    try {
        const response = await fetch(`${API_BASE}/products`);
        const result = await response.json();
        if (result.success && result.data) {
            grid.innerHTML = result.data.map(p => `
                <div class="product-card" style="cursor:default">
                    <div class="product-image">
                        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
                        <i class="fas ${p.image || 'fa-cube'}"></i>
                    </div>
                    <div class="product-info">
                        <span class="product-category">${p.categoryLabel}</span>
                        <h3 class="product-title">${p.title}</h3>
                        <div class="product-footer">
                            <span class="product-price">${p.price} <small>₽</small></span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        grid.innerHTML = '<p class="error">Ошибка загрузки товаров</p>';
    }
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

window.viewOrder = viewOrder;
window.editOrderStatus = editOrderStatus;
window.closeOrderModal = closeOrderModal;
window.closeProductModal = closeProductModal;
