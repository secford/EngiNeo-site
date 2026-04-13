// ========================================
// Маршруты — Загрузка файлов
// ========================================

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, FileUpload } from '../types';
import { AppError } from '../middleware/error';

const router = Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedTypes = [
    '.stl',
    '.obj',
    '.3mf',
    '.step',
    '.stp',
    '.ply',
    '.amf',
  ];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Неподдерживаемый формат файла. Допустимы: STL, OBJ, 3MF, STEP, PLY, AMF', 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

/**
 * POST /api/upload
 * Загрузка 3D файла
 */
router.post(
  '/',
  upload.array('files', 5),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('Файлы не загружены', 400);
      }

      const uploadedFiles: FileUpload[] = files.map((file) => ({
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));

      const response: ApiResponse<FileUpload[]> = {
        success: true,
        data: uploadedFiles,
        message: `Загружено файлов: ${files.length}`,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
