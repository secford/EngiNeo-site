// ========================================
// Маршруты — Заказы
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import {
  saveOrder,
  getOrderById,
  getOrdersByEmail,
  getAllOrders,
  getOrdersByNumberOrEmail,
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

// Транспорт для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

async function sendOrderConfirmation(order: Order): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const statusLabels: Record<string, string> = {
    'pending': 'Новый',
    'processing': 'В обработке',
    'printing': 'Печать',
    'quality-check': 'Проверка качества',
    'ready': 'Готов',
    'shipped': 'Отправлен',
    'delivered': 'Доставлен',
    'cancelled': 'Отменён',
  };

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.title}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.price} ₽</td>
    </tr>
  `).join('');

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center;border-radius:10px 10px 0 0">
        <h1 style="color:#fff;margin:0;font-size:24px">EngiNeo — 3D печать</h1>
        <p style="color:#ddd;margin:8px 0 0">Ваш заказ подтверждён</p>
      </div>
      <div style="background:#fff;padding:30px;border:1px solid #eee">
        <p style="font-size:16px;color:#333">Здравствуйте, <strong>${order.customer.firstName || 'Уважаемый клиент'}</strong>!</p>
        <p style="color:#555">Спасибо за ваш заказ! Мы уже начали его обработку.</p>
        <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0">
          <p style="margin:0 0 5px"><strong>Номер заказа:</strong> ${order.number}</p>
          <p style="margin:0 0 5px"><strong>Дата:</strong> ${new Date(order.date).toLocaleString('ru-RU')}</p>
          <p style="margin:0 0 5px"><strong>Статус:</strong> ${statusLabels[order.status] || order.status}</p>
          <p style="margin:0"><strong>Сумма:</strong> ${order.total} ₽</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead>
            <tr style="background:#667eea;color:#fff">
              <th style="padding:10px;text-align:left">Товар</th>
              <th style="padding:10px;text-align:center">Кол-во</th>
              <th style="padding:10px;text-align:right">Цена</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="border-top:2px solid #667eea;padding:15px 0;margin-top:20px;text-align:right">
          <p style="margin:0;font-size:18px;font-weight:bold">Итого: ${order.total} ₽</p>
        </div>
        <p style="color:#888;font-size:13px;margin-top:20px">
          Вы можете отслеживать статус заказа на странице:
          <a href="${process.env.SITE_URL || 'http://localhost:3000'}/my-orders.html" style="color:#667eea">Мои заказы</a>
        </p>
      </div>
      <div style="background:#2d2d3d;padding:20px;text-align:center;border-radius:0 0 10px 10px">
        <p style="color:#999;margin:0;font-size:12px">© 2024 EngiNeo — Студия 3D печати</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"EngiNeo" <${process.env.SMTP_USER}>`,
      to: order.customer.email,
      subject: `Заказ ${order.number} подтверждён — EngiNeo`,
      html,
    });
    console.log(`Email sent for order ${order.number}`);
  } catch (err) {
    console.error('Email send error:', err);
  }
}

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

    sendOrderConfirmation(savedOrder);

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
 * GET /api/orders/track
 * Поиск заказов по email или номеру заказа
 */
router.get('/track', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      throw new AppError('Укажите email или номер заказа', 400);
    }
    const orders = getOrdersByNumberOrEmail(query);
    const response: ApiResponse<Order[]> = {
      success: true,
      data: orders,
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/all
 * Получение всех заказов (для админа)
 */
router.get('/all', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const orders = getAllOrders();
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
