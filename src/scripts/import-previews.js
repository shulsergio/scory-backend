import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import 'dotenv/config';
import { matchPreviewsCollection } from '../db/models/matchPreviews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const user = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;
const url = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB || 'scory';

const MONGO_URI = `mongodb+srv://${user}:${password}@${url}/${dbName}?retryWrites=true&w=majority`;
const FOLDER_PATH = path.join(__dirname, '../../../fot_data_py/preview');
async function runImport() {
  console.log('=== Начало импорта превью матчей ===');

  try { 
    await mongoose.connect(MONGO_URI);
    console.log('[OK] Подключение к MongoDB успешно.');

    if (!fs.existsSync(FOLDER_PATH)) {
      console.error(`[Error] Папка не найдена по пути: ${FOLDER_PATH}`);
      return;
    }

    const files = fs.readdirSync(FOLDER_PATH);
    const jsonFiles = files.filter(
      (file) =>
        file.startsWith('scory_preview_') && path.extname(file) === '.json',
    );

    if (jsonFiles.length === 0) {
      console.log('В папке нет новых файлов scory_preview для импорта.');
      return;
    }

    console.log(`Найдено файлов для импорта: ${jsonFiles.length}`);

    // Массив, в который мы соберем операции для базы данных
    const bulkOperations = [];

    for (const file of jsonFiles) {
      const filePath = path.join(FOLDER_PATH, file);
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileData);

      if (!jsonData.fotmobId) {
        console.log(`[Пропуск] Файл ${file} не содержит fotmobId.`);
        continue;
      }

      // Формируем операцию upsert (обновить, если есть, или создать, если нет)
      bulkOperations.push({
        updateOne: {
          filter: { fotmobId: jsonData.fotmobId },
          update: { $set: jsonData },
          upsert: true,
        },
      });
    }

    // Выполняем все операции в базе данных ОДНИМ пакетом
    if (bulkOperations.length > 0) {
      const result = await matchPreviewsCollection.bulkWrite(bulkOperations);
      console.log(`\n[Успех] Обработано файлов: ${jsonFiles.length}`);
      console.log(`  - Создано новых записей: ${result.upsertedCount}`);
      console.log(`  - Обновлено существующих: ${result.modifiedCount}`);
    }
  } catch (error) {
    console.error('Критическая ошибка во время импорта:', error);
  } finally {
    // Обязательно закрываем соединение с базой
    await mongoose.disconnect();
    console.log('=== Соединение с MongoDB закрыто ===');
  }
}

runImport();
