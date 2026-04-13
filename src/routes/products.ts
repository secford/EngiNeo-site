// ========================================
// Маршруты — Продукты
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import { products } from '../db/database';
import { ApiResponse, Product } from '../types';
import { AppError } from '../middleware/error';

const router = Router();

/**
 * GET /api/products
 * Получение всех продуктов с фильтрацией и пагинацией
 */
router.get('/', (req: Request, res: Response, next: NextFunction): void => {
  try {
    let filtered = [...products];

    // Фильтр по категории
    const category = req.query.category as string | undefined;
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    // Фильтр по материалу
    const material = req.query.material as string | undefined;
    if (material) {
      filtered = filtered.filter((p) => p.materials.includes(material));
    }

    // Фильтр по цене
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : null;
    if (minPrice !== null) filtered = filtered.filter((p) => p.price >= minPrice);
    if (maxPrice !== null) filtered = filtered.filter((p) => p.price <= maxPrice);

    // Поиск по названию
    const search = req.query.search as string | undefined;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Сортировка
    const sort = (req.query.sort as string) || 'popular';
    switch (sort) {
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
      default:
        filtered.sort((a, b) => b.rating - a.rating);
    }

    // Пагинация
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    const response: ApiResponse<Product[]> = {
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages },
    };

    res.json(response);
  } catch (err) {
    next(new AppError('Ошибка при получении продуктов', 500));
  }
});

/**
 * GET /api/products/:id
 * Получение одного продукта по ID
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = parseInt(req.params.id);
    const product = products.find((p) => p.id === id);

    if (!product) {
      throw new AppError('Продукт не найден', 404);
    }

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/categories
 * Получение списка категорий
 */
router.get('/categories', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const categoriesMap = new Map<string, string>();
    products.forEach((p) => {
      if (!categoriesMap.has(p.category)) {
        categoriesMap.set(p.category, p.categoryLabel);
      }
    });

    const categories = Array.from(categoriesMap.entries()).map(([id, label]) => ({
      id,
      label,
      count: products.filter((p) => p.category === id).length,
    }));

    const response: ApiResponse = {
      success: true,
      data: categories,
    };

    res.json(response);
  } catch (err) {
    next(new AppError('Ошибка при получении категорий', 500));
  }
});

export default router;
