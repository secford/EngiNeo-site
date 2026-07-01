// ========================================
// Основной JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Мобильное меню
    initMobileMenu();
    
    // Переключатель темы
    initThemeToggle();
    
    // Загрузка популярных товаров на главной
    loadPopularProducts();
    
    // Анимация счётчиков
    animateCounters();
    
    // FAQ аккордеон
    initFAQ();
    
    // Плавная прокрутка
    initSmoothScroll();
    
    // Обработка формы быстрого заказа
    initQuickOrderForm();
});
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 55.7558, lng: 37.6173 },
      zoom: 8,
    });
  }
// ========================================
// Мобильное меню
// ========================================
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
    
    // Закрытие меню при клике на ссылку
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });
    
    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    });
}

// ========================================
// Переключатель темы
// ========================================
function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;
    
    const icon = toggleBtn.querySelector('i');
    
    // Загрузка сохранённой темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    // Переключение темы
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

// ========================================
// Популярные товары
// ========================================
function loadPopularProducts() {
    const container = document.getElementById('popularProducts');
    if (!container) return;
    
    // Берём первые 4 товара с бейджем "Хит" или высоким рейтингом
    const popular = products
        .filter(p => p.badge === 'Хит' || p.rating >= 4.8)
        .slice(0, 4);
    
    container.innerHTML = popular.map(product => createProductCard(product)).join('');
    
    // Навешиваем обработчики на кнопки "В корзину"
    container.querySelectorAll('.add-to-cart').forEach(btn => {
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

// ========================================
// Создание карточки товара
// ========================================
function createProductCard(product) {
    const badgeHTML = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
    const optionsHTML = `
        <div class="product-options">
            <span class="product-option">${getMaterialLabel(product.materials[0])}</span>
            <span class="product-option">${product.colors[0]}</span>
        </div>
    `;
    
    return `
        <div class="product-card" data-id="${product.id}">
            <a href="product.html?id=${product.id}" class="product-link" style="text-decoration:none;color:inherit">
                <div class="product-image">
                    ${badgeHTML}
                    <i class="fas ${product.image}"></i>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.categoryLabel}</span>
                    <h3 class="product-title">${product.title}</h3>
                    ${optionsHTML}
                    <div class="product-footer">
                        <span class="product-price">${product.price} <small>₽</small></span>
                    </div>
                </div>
            </a>
            <button class="add-to-cart" aria-label="Добавить в корзину" style="position:absolute;bottom:1rem;right:1rem">
                <i class="fas fa-cart-plus"></i>
            </button>
        </div>
    `;
}

// ========================================
// Получение названия материала
// ========================================
function getMaterialLabel(materialId) {
    const material = materials.find(m => m.id === materialId);
    return material ? material.label : materialId;
}

// ========================================
// Анимация счётчиков
// ========================================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current).toLocaleString('ru-RU');
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target.toLocaleString('ru-RU') + '+';
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ========================================
// FAQ аккордеон
// ========================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Закрываем все остальные
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Открываем/закрываем текущий
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ========================================
// Плавная прокрутка
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (!target) return;
            
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// ========================================
// Форма быстрого заказа
// ========================================
function initQuickOrderForm() {
    const form = document.getElementById('quickOrderForm');
    if (!form) return;

    const fileInput = document.getElementById('fileUpload');
    const previewContainer = document.getElementById('quick-stl-preview');
    let stlViewerInstance = null;

    if (fileInput && previewContainer) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) {
                previewContainer.style.display = 'none';
                return;
            }
            if (!file.name.toLowerCase().endsWith('.stl')) {
                previewContainer.style.display = 'none';
                return;
            }
            previewContainer.style.display = 'block';
            previewContainer.innerHTML = '';
            previewContainer.id = 'quickStlViewer';

            if (typeof StlViewer !== 'undefined' && typeof THREE !== 'undefined') {
                stlViewerInstance = new StlViewer('quickStlViewer', {
                    autoRotate: true,
                    backgroundColor: 0x1a1a2e,
                    modelColor: 0x4fc3f7,
                    height: 250
                });
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const buffer = ev.target.result;
                    if (stlViewerInstance && stlViewerInstance.loadStlFromBuffer) {
                        stlViewerInstance.loadStlFromBuffer(buffer);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                previewContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888"><i class="fas fa-cube" style="font-size:48px;margin-right:1rem"></i><span>3D файл загружен</span></div>';
            }
        });
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        cart.showNotification('Заявка отправлена! Мы свяжемся с вами в течение 30 минут', 'success');
        form.reset();
        if (previewContainer) {
            previewContainer.style.display = 'none';
            previewContainer.innerHTML = '';
        }
        if (stlViewerInstance && stlViewerInstance.destroy) {
            stlViewerInstance.destroy();
            stlViewerInstance = null;
        }
    });
}

// ========================================
// Форматирование цены
// ========================================
function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}

// ========================================
// Маска для телефона
// ========================================
function initPhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
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
    });
}

// Запуск маски для телефона
document.addEventListener('DOMContentLoaded', initPhoneMask);
