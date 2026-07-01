import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'engineo-admin-secret-key-2024';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export interface AuthRequest extends Request {
  user?: { username: string; role: string };
}

export function generateToken(username: string): string {
  return jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Требуется авторизация' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Неверный или просроченный токен' });
  }
}

export function adminLogin(username: string, password: string): boolean {
  if (!ADMIN_PASSWORD_HASH) {
    return username === ADMIN_USERNAME && password === 'admin123';
  }
  const bcrypt = require('bcryptjs');
  return username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}
