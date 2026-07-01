// ========================================
// Маршруты — Продукты
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { products, addProduct } from '../db/database';
import { ApiResponse, Product, CreateProductRequest } from '../types';
import { AppError } from '../middleware/error';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const stlStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'stl');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const id = req.params.id || Date.now().toString();
    cb(null, `${id}.stl`);
  },
});
const uploadStl = multer({ storage: stlStorage, fileFilter: (_req, file, cb) => {
  cb(null, file.originalname.toLowerCase().endsWith('.stl'));
} });

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

/**
 * POST /api/products
 * Создание нового товара (админка)
 */
router.post('/', authMiddleware, (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const data = req.body as CreateProductRequest;
    if (!data.title || !data.price) {
      throw new AppError('Укажите название и цену товара', 400);
    }
    const product: Product = {
      id: 0,
      title: data.title,
      category: data.category || 'other',
      categoryLabel: data.categoryLabel || data.category || 'Другое',
      price: data.price,
      image: data.image || 'fa-cube',
      badge: data.badge,
      materials: data.materials || ['pla'],
      sizes: data.sizes || ['medium'],
      colors: data.colors || ['Разный'],
      rating: 0,
      reviews: 0,
      description: data.description || '',
    };
    const saved = addProduct(product);
    const response: ApiResponse<Product> = {
      success: true,
      data: saved,
      message: 'Товар успешно добавлен',
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/products/:id/stl
 * Загрузка STL файла для товара
 */
router.post('/:id/stl', authMiddleware, (req: Request, res: Response, next: NextFunction): void => {
  uploadStl.single('stlFile')(req, res, (err) => {
    if (err) return next(new AppError('Ошибка загрузки файла', 400));
    if (!req.file) return next(new AppError('Файл не загружен', 400));
    res.json({ success: true, message: 'STL файл загружен', data: { filename: req.file.filename } });
  });
});

export default router;
