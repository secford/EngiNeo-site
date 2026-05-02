// ========================================
// API клиент для общения с сервером
// ========================================

const API_BASE = '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========================================
// Продукты
// ========================================

export async function getProducts(params?: {
  category?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
  }
  return fetchJson<ApiResponse>(`${API_BASE}/products?${query.toString()}`);
}

export async function getProductById(id: number) {
  return fetchJson<ApiResponse>(`${API_BASE}/products/${id}`);
}

export async function getProductCategories() {
  return fetchJson<ApiResponse>(`${API_BASE}/products/categories`);
}

// ========================================
// Заказы
// ========================================

export async function createOrder(orderData: Record<string, unknown>) {
  return fetchJson<ApiResponse>(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
}

export async function getOrderById(id: string) {
  return fetchJson<ApiResponse>(`${API_BASE}/orders/${id}`);
}

export async function getOrdersByEmail(email: string) {
  return fetchJson<ApiResponse>(`${API_BASE}/orders/email/${encodeURIComponent(email)}`);
}

export async function updateOrderStatus(id: string, status: string) {
  return fetchJson<ApiResponse>(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

// ========================================
// Промокоды
// ========================================

export async function checkPromoCode(code: string) {
  return fetchJson<ApiResponse>(`${API_BASE}/promo/${encodeURIComponent(code)}`);
}

// ========================================
// Контактная форма
// ========================================

export async function sendContactMessage(data: Record<string, unknown>) {
  return fetchJson<ApiResponse>(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ========================================
// Загрузка файлов
// ========================================

export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return fetchJson<ApiResponse>(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
}

// ========================================
// Health check
// ========================================

export async function healthCheck() {
  return fetchJson<ApiResponse>(`${API_BASE}/health`);
}

// ========================================
// Утилиты
// ========================================

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}
