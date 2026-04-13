// ========================================
// Маршруты — Заказы
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  saveOrder,
  getOrderById,
  getOrdersByEmail,
  updateOrderStatus,
  generateOrderNumber,
} from '../db/database';
import {
  ApiResponse,
  Order,
  OrderStatus,
} from '../types';
import { AppError } from '../middleware/error';

const router = Router();

/**
 * POST /api/orders
 * Создание нового заказа
 */
router.post('/', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const {
      items,
      customer,
      delivery,
      payment,
      options,
      subtotal,
      shipping,
      optionsTotal,
      total,
    } = req.body as Partial<Order>;

    // Валидация
    if (!items || items.length === 0) {
      throw new AppError('Корзина пуста', 400);
    }
    if (!customer?.email || !customer?.phone) {
      throw new AppError('Укажите email и телефон', 400);
    }
    if (!delivery?.type) {
      throw new AppError('Выберите способ доставки', 400);
    }
    if (!payment) {
      throw new AppError('Выберите способ оплаты', 400);
    }

    const order: Order = {
      id: uuidv4(),
      number: generateOrderNumber(),
      date: new Date().toISOString(),
      status: 'pending',
      items: items,
      customer: customer,
      delivery: delivery,
      payment: payment,
      options: options || { giftWrap: false, qualityCheck: false, express: false },
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      optionsTotal: optionsTotal || 0,
      total: total || 0,
    };

    const savedOrder = saveOrder(order);

    // Здесь можно отправить email клиенту

    const response: ApiResponse<Order> = {
      success: true,
      data: savedOrder,
      message: 'Заказ успешно создан',
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/:id
 * Получение заказа по ID
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const order = getOrderById(req.params.id);

    if (!order) {
      throw new AppError('Заказ не найден', 404);
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/email/:email
 * Получение всех заказов по email
 */
router.get('/email/:email', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const orders = getOrdersByEmail(req.params.email);

    const response: ApiResponse<Order[]> = {
      success: true,
      data: orders,
    };

    res.json(response);
  } catch (err) {
    next(new AppError('Ошибка при получении заказов', 500));
  }
});

/**
 * PATCH /api/orders/:id/status
 * Обновление статуса заказа
 */
router.patch('/:id/status', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { status } = req.body as { status?: OrderStatus };

    if (!status) {
      throw new AppError('Укажите статус', 400);
    }

    const validStatuses: OrderStatus[] = [
      'pending',
      'processing',
      'printing',
      'quality-check',
      'ready',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      throw new AppError('Неверный статус', 400);
    }

    const order = updateOrderStatus(req.params.id, status);

    if (!order) {
      throw new AppError('Заказ не найден', 404);
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: 'Статус заказа обновлён',
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
