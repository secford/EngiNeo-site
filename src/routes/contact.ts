// ========================================
// Маршруты — Контактные сообщения
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { saveContactMessage } from '../db/database';
import { ApiResponse, ContactMessage } from '../types';
import { AppError } from '../middleware/error';

const router = Router();

/**
 * POST /api/contact
 * Отправка контактного сообщения
 */
router.post('/', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Валидация
    if (!name || !email || !subject || !message) {
      throw new AppError('Заполните все обязательные поля', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Неверный формат email', 400);
    }

    const contactMsg: ContactMessage = {
      id: uuidv4(),
      name,
      email,
      phone,
      subject,
      message,
      date: new Date().toISOString(),
      status: 'new',
    };

    saveContactMessage(contactMsg);

    const response: ApiResponse<ContactMessage> = {
      success: true,
      data: contactMsg,
      message: 'Сообщение успешно отправлено',
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
