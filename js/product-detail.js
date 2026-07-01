document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    initTabs();
    loadProduct();
});

function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}

function loadProduct() {
    const id = getProductId();
    if (!id) {
        showError('Товар не указан');
        return;
    }

    const product = products.find(p => p.id === id);
    if (!product) {
        showError('Товар не найден');
        return;
    }

    renderProduct(product);
}

function renderProduct(product) {
    document.title = `${product.title} — EngiNeo`;
    document.getElementById('productBreadcrumb').textContent = product.title;
    document.getElementById('productCategory').textContent = product.categoryLabel;
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productDescription').textContent = product.description;

    renderPrice(product.price);
    renderRating(product.rating, product.reviews);
    renderOptions(product);
    renderCharacteristics(product);
    initStlViewer(product);
    initAddToCart(product);
}

function renderPrice(price) {
    const el = document.getElementById('productPrice');
    el.innerHTML = `${price.toLocaleString('ru-RU')} <small>₽</small>`;
    updateTotalPrice();
}

function renderRating(rating, reviews) {
    const el = document.getElementById('productRating');
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - rating < 1) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    el.innerHTML = `${stars} <span>${rating}</span> <span class="reviews-count">(${reviews} отзывов)</span>`;
}

function renderOptions(product) {
    const materialSelect = document.getElementById('optionMaterial');
    materialSelect.innerHTML = product.materials.map(m =>
        `<option value="${m}">${getMaterialLabel(m)}</option>`
    ).join('');

    const colorSelect = document.getElementById('optionColor');
    colorSelect.innerHTML = product.colors.map(c =>
        `<option value="${c}">${c}</option>`
    ).join('');

    const sizeSelect = document.getElementById('optionSize');
    sizeSelect.innerHTML = product.sizes.map(s =>
        `<option value="${s}">${getSizeLabel(s)}</option>`
    ).join('');

    materialSelect.addEventListener('change', updateTotalPrice);
    document.getElementById('optionQuality').addEventListener('change', updateTotalPrice);
}

function getSizeLabel(size) {
    const labels = { small: 'Маленький', medium: 'Средний', large: 'Большой' };
    return labels[size] || size;
}

function updateTotalPrice() {
    const priceEl = document.getElementById('productPrice');
    const basePrice = parseInt(priceEl.textContent.replace(/\s/g, ''));
    const quality = document.getElementById('optionQuality')?.value;
    let multiplier = 1;
    if (quality === 'high') multiplier = 1.3;
    if (quality === 'ultra') multiplier = 1.6;
    const total = Math.round(basePrice * multiplier);
    document.getElementById('totalPrice').textContent = `${total.toLocaleString('ru-RU')} ₽`;
}

function renderCharacteristics(product) {
    const table = document.getElementById('charsTable');
    table.innerHTML = `
        <tr><td>Категория</td><td>${product.categoryLabel}</td></tr>
        <tr><td>Материалы</td><td>${product.materials.map(m => getMaterialLabel(m)).join(', ')}</td></tr>
        <tr><td>Доступные цвета</td><td>${product.colors.join(', ')}</td></tr>
        <tr><td>Размеры</td><td>${product.sizes.map(s => getSizeLabel(s)).join(', ')}</td></tr>
        <tr><td>Рейтинг</td><td>${product.rating} / 5</td></tr>
        <tr><td>Отзывы</td><td>${product.reviews}</td></tr>
    `;
}

function initStlViewer(product) {
    const container = document.getElementById('stlViewerContainer');
    const placeholder = container.querySelector('.stl-viewer-placeholder');

    container.style.width = '100%';
    container.style.height = '500px';

    const viewerId = 'stlViewer_' + product.id;
    const viewerDiv = document.createElement('div');
    viewerDiv.id = viewerId;
    viewerDiv.style.width = '100%';
    viewerDiv.style.height = '100%';
    container.appendChild(viewerDiv);

    const stlUrl = `/stl/${product.id}.stl`;

    if (typeof StlViewer !== 'undefined') {
        const viewer = new StlViewer(viewerId, {
            autoRotate: true,
            backgroundColor: 0x1a1a2e,
            modelColor: 0x4fc3f7
        });
        viewer.loadStl(stlUrl);
        if (placeholder) placeholder.remove();
    } else {
        if (placeholder) {
            placeholder.innerHTML = '<i class="fas fa-cube" style="font-size:64px;opacity:0.3"></i><p>3D модель</p>';
        }
    }
}

function initAddToCart(product) {
    document.getElementById('addToCartBtn').addEventListener('click', () => {
        const material = document.getElementById('optionMaterial')?.value || product.materials[0];
        const color = document.getElementById('optionColor')?.value || product.colors[0];
        const size = document.getElementById('optionSize')?.value || product.sizes[0];
        cart.add(product.id, { material, color, size });
    });
}

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });
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

function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!menuBtn || !mobileMenu) return;
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
}

function showError(msg) {
    const container = document.querySelector('.product-detail .container');
    if (container) {
        container.innerHTML = `
            <div class="no-products" style="text-align:center;padding:4rem 2rem">
                <i class="fas fa-exclamation-triangle" style="font-size:4rem;color:var(--text-light);margin-bottom:1rem"></i>
                <h2>${msg}</h2>
                <a href="catalog.html" class="btn btn-primary" style="margin-top:1rem">Вернуться в каталог</a>
            </div>
        `;
    }
}
