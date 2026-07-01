// ========================================
// Каталог товаров
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initCatalog();
});

let currentFilters = {
    categories: ['all'],
    materials: [],
    sizes: [],
    priceMin: null,
    priceMax: null
};

let currentSort = 'popular';
let currentPage = 1;
const itemsPerPage = 12;

function initCatalog() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    // Инициализация фильтров
    initFilters();
    
    // Инициализация сортировки
    initSort();
    
    // Инициализация переключения вида
    initViewToggle();
    
    // Первая отрисовка
    renderProducts();
}

function initFilters() {
    // Категории
    document.querySelectorAll('.filter-section input[type="checkbox"][value]').forEach(checkbox => {
        checkbox.addEventListener('change', handleFilterChange);
    });
    
    // Цена
    const applyPriceBtn = document.getElementById('applyPriceFilter');
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', applyPriceFilter);
    }
    
    // Сброс фильтров
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Применение фильтров из URL
    applyUrlFilters();
}

function applyUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    
    if (category && category !== 'all') {
        // Снимаем "Все категории"
        const allCheckbox = document.querySelector('.filter-section input[value="all"]');
        if (allCheckbox) allCheckbox.checked = false;
        
        // Выбираем нужную категорию
        const categoryCheckbox = document.querySelector(`.filter-section input[value="${category}"]`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
            currentFilters.categories = [category];
        }
    }
}

function handleFilterChange(e) {
    const checkbox = e.target;
    const value = checkbox.value;
    const parent = checkbox.closest('.filter-section');
    
    if (!parent) return;
    
    const title = parent.querySelector('h3')?.textContent;
    
    if (title === 'Категории') {
        if (value === 'all') {
            // Если выбрали "Все категории", снимаем остальные
            parent.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                if (cb.value !== 'all') cb.checked = false;
            });
            currentFilters.categories = ['all'];
        } else {
            // Снимаем "Все категории" если выбрано
            const allCheckbox = parent.querySelector('input[value="all"]');
            if (allCheckbox) allCheckbox.checked = false;
            
            // Обновляем выбранные категории
            const checked = Array.from(parent.querySelectorAll('input[type="checkbox"]:checked'))
                .filter(cb => cb.value !== 'all')
                .map(cb => cb.value);
            currentFilters.categories = checked.length > 0 ? checked : ['all'];
        }
    } else if (title === 'Материал') {
        currentFilters.materials = Array.from(parent.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);
    } else if (title === 'Размер') {
        currentFilters.sizes = Array.from(parent.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);
    }
    
    currentPage = 1;
    renderProducts();
}

function applyPriceFilter() {
    const minInput = document.getElementById('minPrice');
    const maxInput = document.getElementById('maxPrice');
    
    currentFilters.priceMin = minInput?.value ? parseFloat(minInput.value) : null;
    currentFilters.priceMax = maxInput?.value ? parseFloat(maxInput.value) : null;
    
    currentPage = 1;
    renderProducts();
}

function resetFilters() {
    // Сброс чекбоксов
    document.querySelectorAll('.filter-section input[type="checkbox"]').forEach(cb => {
        cb.checked = cb.value === 'all';
    });
    
    // Сброс цены
    const minInput = document.getElementById('minPrice');
    const maxInput = document.getElementById('maxPrice');
    if (minInput) minInput.value = '';
    if (maxInput) maxInput.value = '';
    
    // Сброс фильтров
    currentFilters = {
        categories: ['all'],
        materials: [],
        sizes: [],
        priceMin: null,
        priceMax: null
    };
    
    currentPage = 1;
    renderProducts();
}

function initSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            renderProducts();
        });
    }
}

function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const productsGrid = document.getElementById('productsGrid');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (productsGrid) {
                productsGrid.classList.remove('grid-view', 'list-view');
                productsGrid.classList.add(view + '-view');
            }
        });
    });
}

function filterProducts() {
    let filtered = [...products];
    
    // Фильтр по категориям
    if (!currentFilters.categories.includes('all')) {
        filtered = filtered.filter(p => currentFilters.categories.includes(p.category));
    }
    
    // Фильтр по материалам
    if (currentFilters.materials.length > 0) {
        filtered = filtered.filter(p => 
            currentFilters.materials.some(m => p.materials.includes(m))
        );
    }
    
    // Фильтр по размерам
    if (currentFilters.sizes.length > 0) {
        filtered = filtered.filter(p => 
            currentFilters.sizes.some(s => p.sizes.includes(s))
        );
    }
    
    // Фильтр по цене
    if (currentFilters.priceMin !== null) {
        filtered = filtered.filter(p => p.price >= currentFilters.priceMin);
    }
    if (currentFilters.priceMax !== null) {
        filtered = filtered.filter(p => p.price <= currentFilters.priceMax);
    }
    
    // Сортировка
    switch (currentSort) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'newest':
            filtered.sort((a, b) => b.id - a.id);
            break;
        case 'popular':
        default:
            filtered.sort((a, b) => b.rating - a.rating);
    }
    
    return filtered;
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const pagination = document.getElementById('pagination');
    
    if (!productsGrid) return;
    
    const filtered = filterProducts();
    
    // Обновление счётчика
    if (resultsCount) {
        resultsCount.querySelector('span').textContent = filtered.length;
    }
    
    // Пагинация
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageProducts = filtered.slice(start, end);
    
    // Отрисовка товаров
    if (pageProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-search" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Товары не найдены</h3>
                <p style="color: var(--text-secondary);">Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
    } else {
        productsGrid.innerHTML = pageProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <a href="product.html?id=${product.id}" class="product-link" style="text-decoration:none;color:inherit">
                    <div class="product-image">
                        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                        <i class="fas ${product.image}"></i>
                    </div>
                    <div class="product-info">
                        <span class="product-category">${product.categoryLabel}</span>
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-options">
                            <span class="product-option">${getMaterialLabel(product.materials[0])}</span>
                            <span class="product-option">${product.colors[0]}</span>
                        </div>
                        <div class="product-footer">
                            <span class="product-price">${product.price} <small>₽</small></span>
                        </div>
                    </div>
                </a>
                <button class="add-to-cart" aria-label="Добавить в корзину" style="position:absolute;bottom:1rem;right:1rem">
                    <i class="fas fa-cart-plus"></i>
                </button>
            </div>
        `).join('');
        
        // Навешиваем обработчики
        productsGrid.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.product-card').dataset.id);
                const product = products.find(p => p.id === productId);
                if (product) {
                    cart.add(productId, {
                        material: product.materials[0],
                        color: product.colors[0],
                        size: product.sizes[0]
                    });
                }
            });
        });
    }
    
    // Отрисовка пагинации
    renderPagination(totalPages, pagination);
}

function renderPagination(totalPages, container) {
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Предыдущая
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
        <i class="fas fa-chevron-left"></i>
    </button>`;
    
    // Страницы
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span>...</span>`;
        }
    }
    
    // Следующая
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
        <i class="fas fa-chevron-right"></i>
    </button>`;
    
    container.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(filterProducts().length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Глобальная функция для пагинации
window.goToPage = goToPage;
