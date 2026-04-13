// ========================================
// Маршруты — Промокоды
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import { getPromoCode } from '../db/database';
import { ApiResponse, PromoCode } from '../types';
import { AppError } from '../middleware/error';

const router = Router();

/**
 * GET /api/promo/:code
 * Проверка и получение информации о промокоде
 */
router.get('/:code', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const code = req.params.code.trim().toUpperCase();

    if (!code) {
      throw new AppError('Укажите промокод', 400);
    }

    const promo = getPromoCode(code);

    if (!promo) {
      const response: ApiResponse = {
        success: false,
        error: 'Неверный промокод',
      };
      res.status(404).json(response);
      return;
    }

    // Проверка срока действия
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      const response: ApiResponse = {
        success: false,
        error: 'Промокод истёк',
      };
      res.status(410).json(response);
      return;
    }

    const response: ApiResponse<PromoCode> = {
      success: true,
      data: promo,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
