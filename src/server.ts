// ========================================
// EngiNeo — основной сервер
// ========================================

import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';

// Middleware
import { corsMiddleware } from './middleware/cors';
import { errorMiddleware, notFoundMiddleware, AppError } from './middleware/error';

// Routes
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import promoRouter from './routes/promo';
import contactRouter from './routes/contact';
import uploadRouter from './routes/upload';

// Types
import { ApiResponse } from './types';

dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// ========================================
// Global middleware
// ========================================

// Безопасность заголовков
app.use(helmet());

// CORS
app.use(cors());
app.use(corsMiddleware);

// Логирование
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы (клиентский фронтенд)
app.use(express.static(path.join(__dirname, '..')));

// ========================================
// API маршруты
// ========================================

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/promo', promoRouter);
app.use('/api/contact', contactRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    },
  };
  res.json(response);
});

// ========================================
// SPA fallback — отдаём index.html для любых других маршрутов
// ========================================
app.get('*', (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ========================================
// Обработка ошибок
// ========================================
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// ========================================
// Запуск сервера
// ========================================
app.listen(PORT, (): void => {
  console.log(`\n🚀 EngiNeo Server`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   Port: http://localhost:${PORT}`);
  console.log(`   API:    http://localhost:${PORT}/api/health\n`);
});

export default app;
