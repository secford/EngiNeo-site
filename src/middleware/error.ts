// ========================================
// Middleware — обработка ошибок
// ========================================

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorMiddleware(
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  const response: ApiResponse = {
    success: false,
    error: message,
  };

  res.status(statusCode).json(response);
}

export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  next(new AppError(`Маршрут не найден: ${req.originalUrl}`, 404));
}
