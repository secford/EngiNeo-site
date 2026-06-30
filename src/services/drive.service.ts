import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Авторизация (используем те же данные, что для таблиц)
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

export async function uploadToDrive(localFilePath: string, fileName: string) {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID as string], // ID папки из .env
    };

    const media = {
      mimeType: 'application/octet-stream', // Для STL файлов
      body: fs.createReadStream(localFilePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Делаем файл доступным для просмотра по ссылке (опционально)
    await drive.permissions.create({
      fileId: response.data.id as string,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data.webViewLink; // Возвращает прямую ссылку на файл
  } catch (error) {
    console.error('Ошибка загрузки на Google Диск:', error);
    throw error;
  }
}