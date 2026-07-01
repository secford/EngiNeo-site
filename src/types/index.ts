// ========================================
// Типы данных для EngiNeo API
// ========================================

export interface Product {
  id: number;
  title: string;
  category: string;
  categoryLabel: string;
  price: number;
  image: string;
  badge?: string;
  materials: string[];
  sizes: string[];
  colors: string[];
  rating: number;
  reviews: number;
  description: string;
}

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  options: {
    material: string;
    color: string;
    size: string;
  };
  quantity: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface DeliveryInfo {
  type: 'pickup' | 'courier' | 'post';
  address?: string;
  city?: string;
  postalCode?: string;
  comment?: string;
}

export interface OrderOptions {
  giftWrap: boolean;
  qualityCheck: boolean;
  express: boolean;
}

export interface Order {
  id: string;
  number: string;
  date: string;
  status: OrderStatus;
  items: CartItem[];
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  payment: 'card' | 'cash' | 'invoice';
  options: OrderOptions;
  subtotal: number;
  shipping: number;
  optionsTotal: number;
  total: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'printing'
  | 'quality-check'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface QuickOrderRequest {
  name: string;
  email: string;
  phone: string;
  message?: string;
  files?: string[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'replied';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PromoCode {
  code: string;
  discount: number;
  freeShipping: boolean;
  description: string;
  active: boolean;
  expiresAt?: string;
}

export interface FileUpload {
  originalname: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  price: number;
  image?: string;
  badge?: string;
  materials?: string[];
  sizes?: string[];
  colors?: string[];
  stlFile?: string;
  photos?: string[];
}
