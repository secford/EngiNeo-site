// ========================================
// In-memory база данных
// ========================================

import {
  Order,
  Product,
  ContactMessage,
  PromoCode,
  OrderStatus,
} from '../types';

// ---------- Продукты ----------
export const products: Product[] = [
  {
    id: 1,
    title: 'Фигурка дракона',
    category: 'figurines',
    categoryLabel: 'Фигурки',
    price: 1200,
    image: 'fa-dragon',
    badge: 'Хит',
    materials: ['pla', 'petg', 'resin'],
    sizes: ['medium', 'large'],
    colors: ['Красный', 'Зелёный', 'Синий', 'Чёрный'],
    rating: 5,
    reviews: 24,
    description: 'Детализированная фигурка дракона с расправленными крыльями',
  },
  {
    id: 2,
    title: 'Ваза геометрическая',
    category: 'decoration',
    categoryLabel: 'Декор',
    price: 850,
    image: 'fa-vase',
    badge: 'Новинка',
    materials: ['pla', 'petg'],
    sizes: ['medium'],
    colors: ['Белый', 'Серый', 'Бежевый'],
    rating: 4.8,
    reviews: 18,
    description: 'Стильная ваза с геометрическим узором для современного интерьера',
  },
  {
    id: 3,
    title: 'Шестерня техническая',
    category: 'technical',
    categoryLabel: 'Технические детали',
    price: 350,
    image: 'fa-cog',
    materials: ['abs', 'nylon', 'petg'],
    sizes: ['small', 'medium'],
    colors: ['Чёрный', 'Белый', 'Серый'],
    rating: 4.9,
    reviews: 42,
    description: 'Прочная шестерня для механических устройств',
  },
  {
    id: 4,
    title: 'Подставка для наушников',
    category: 'accessories',
    categoryLabel: 'Аксессуары',
    price: 950,
    image: 'fa-headphones',
    materials: ['pla', 'abs', 'petg'],
    sizes: ['medium'],
    colors: ['Чёрный', 'Белый', 'Красный', 'Синий'],
    rating: 4.7,
    reviews: 31,
    description: 'Эргономичная подставка для игровых наушников',
  },
  {
    id: 5,
    title: 'Фигурка совы',
    category: 'figurines',
    categoryLabel: 'Фигурки',
    price: 780,
    image: 'fa-crow',
    materials: ['pla', 'resin'],
    sizes: ['small'],
    colors: ['Коричневый', 'Серый', 'Белый'],
    rating: 4.6,
    reviews: 15,
    description: 'Милая фигурка совы с большими глазами',
  },
  {
    id: 6,
    title: 'Кашпо для цветов',
    category: 'decoration',
    categoryLabel: 'Декор',
    price: 650,
    image: 'fa-leaf',
    materials: ['pla', 'petg'],
    sizes: ['small', 'medium'],
    colors: ['Терракотовый', 'Зелёный', 'Серый'],
    rating: 4.5,
    reviews: 22,
    description: 'Кашпо с дренажным отверстием для комнатных растений',
  },
  {
    id: 7,
    title: 'Корпус для электроники',
    category: 'technical',
    categoryLabel: 'Технические детали',
    price: 550,
    image: 'fa-microchip',
    materials: ['abs', 'petg', 'nylon'],
    sizes: ['small', 'medium'],
    colors: ['Чёрный', 'Белый', 'Прозрачный'],
    rating: 4.8,
    reviews: 38,
    description: 'Универсальный корпус для Arduino и Raspberry Pi',
  },
  {
    id: 8,
    title: 'Брелок с логотипом',
    category: 'accessories',
    categoryLabel: 'Аксессуары',
    price: 200,
    image: 'fa-key',
    materials: ['pla', 'abs', 'flex'],
    sizes: ['small'],
    colors: ['Любой цвет'],
    rating: 4.4,
    reviews: 56,
    description: 'Персонализированный брелок с вашим логотипом',
  },
  {
    id: 9,
    title: 'Фигурка рыцаря',
    category: 'figurines',
    categoryLabel: 'Фигурки',
    price: 1450,
    image: 'fa-chess-knight',
    badge: 'Хит',
    materials: ['resin', 'pla'],
    sizes: ['medium'],
    colors: ['Серебро', 'Золото', 'Сталь'],
    rating: 4.9,
    reviews: 28,
    description: 'Детализированная фигурка средневекового рыцаря в доспехах',
  },
  {
    id: 10,
    title: 'Светильник луна',
    category: 'decoration',
    categoryLabel: 'Декор',
    price: 1800,
    image: 'fa-moon',
    badge: 'Новинка',
    materials: ['pla'],
    sizes: ['large'],
    colors: ['Белый', 'Жёлтый'],
    rating: 5,
    reviews: 12,
    description: 'Настольный светильник в форме луны с LED подсветкой',
  },
  {
    id: 11,
    title: 'Кронштейн для монитора',
    category: 'technical',
    categoryLabel: 'Технические детали',
    price: 1200,
    image: 'fa-tv',
    materials: ['abs', 'nylon', 'petg'],
    sizes: ['large'],
    colors: ['Чёрный', 'Серый'],
    rating: 4.7,
    reviews: 19,
    description: 'Прочный кронштейн для крепления монитора до 27 дюймов',
  },
  {
    id: 12,
    title: 'Органайзер для кабелей',
    category: 'accessories',
    categoryLabel: 'Аксессуары',
    price: 380,
    image: 'fa-plug',
    materials: ['pla', 'flex'],
    sizes: ['small'],
    colors: ['Чёрный', 'Белый', 'Серый'],
    rating: 4.6,
    reviews: 45,
    description: 'Набор органайзеров для упорядочивания кабелей',
  },
  {
    id: 13,
    title: 'Игрушка динозавр',
    category: 'toys',
    categoryLabel: 'Игрушки',
    price: 920,
    image: 'fa-dragon',
    materials: ['pla', 'petg'],
    sizes: ['medium'],
    colors: ['Зелёный', 'Синий', 'Красный'],
    rating: 4.8,
    reviews: 33,
    description: 'Подвижная игрушка динозавра с шарнирными соединениями',
  },
  {
    id: 14,
    title: 'Кубик Рубика',
    category: 'toys',
    categoryLabel: 'Игрушки',
    price: 450,
    image: 'fa-dice',
    materials: ['pla', 'abs'],
    sizes: ['small'],
    colors: ['Классический', 'Чёрный'],
    rating: 4.5,
    reviews: 27,
    description: 'Классический кубик Рубика 3x3, напечатанный на 3D принтере',
  },
  {
    id: 15,
    title: 'Фигурка космонавта',
    category: 'figurines',
    categoryLabel: 'Фигурки',
    price: 1100,
    image: 'fa-user-astronaut',
    materials: ['pla', 'resin'],
    sizes: ['medium'],
    colors: ['Белый', 'Серебро'],
    rating: 4.7,
    reviews: 21,
    description: 'Фигурка космонавта в скафандре для коллекции',
  },
  {
    id: 16,
    title: 'Держатель для телефона',
    category: 'accessories',
    categoryLabel: 'Аксессуары',
    price: 420,
    image: 'fa-mobile-alt',
    materials: ['pla', 'petg', 'flex'],
    sizes: ['small'],
    colors: ['Чёрный', 'Белый', 'Синий', 'Красный'],
    rating: 4.6,
    reviews: 52,
    description: 'Регулируемая подставка для смартфона на рабочий стол',
  },
];

// ---------- Заказы ----------
export const orders: Order[] = [];

// ---------- Сообщения ----------
export const contactMessages: ContactMessage[] = [];

// ---------- Промокоды ----------
export const promoCodes: PromoCode[] = [
  {
    code: 'WELCOME10',
    discount: 0.1,
    freeShipping: false,
    description: 'Скидка 10% на первый заказ',
    active: true,
  },
  {
    code: 'SUMMER20',
    discount: 0.2,
    freeShipping: false,
    description: 'Летняя скидка 20%',
    active: true,
  },
  {
    code: 'FREESHIP',
    discount: 0,
    freeShipping: true,
    description: 'Бесплатная доставка',
    active: true,
  },
];

// ---------- Счётчик ID заказов ----------
let orderCounter = 0;

// ---------- Утилиты ----------
export function generateOrderNumber(): string {
  orderCounter++;
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `#${date}-${String(orderCounter).padStart(3, '0')}`;
}

export function saveOrder(order: Order): Order {
  orders.push(order);
  return order;
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function getOrdersByEmail(email: string): Order[] {
  return orders.filter((o) => o.customer.email.toLowerCase() === email.toLowerCase());
}

export function getAllOrders(): Order[] {
  return orders;
}

export function getOrdersByNumberOrEmail(query: string): Order[] {
  const lower = query.toLowerCase();
  return orders.filter((o) =>
    o.number.toLowerCase().includes(lower) ||
    o.customer.email.toLowerCase().includes(lower)
  );
}

export function addProduct(product: Product): Product {
  const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
  product.id = maxId + 1;
  products.push(product);
  return product;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const order = getOrderById(id);
  if (order) {
    order.status = status;
  }
  return order;
}

export function saveContactMessage(msg: ContactMessage): ContactMessage {
  contactMessages.push(msg);
  return msg;
}

export function getPromoCode(code: string): PromoCode | undefined {
  return promoCodes.find(
    (p) => p.code.toLowerCase() === code.toLowerCase() && p.active
  );
}
