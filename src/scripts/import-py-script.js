import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import 'dotenv/config';
import { matchPreviewsCollection } from '../db/models/matchPreviews.js';
import { matchOverviewCollection } from '../db/models/matchOverview.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const user = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;
const url = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB || 'scory';

const MONGO_URI = `mongodb+srv://${user}:${password}@${url}/${dbName}?retryWrites=true&w=majority`;

// Папки для разных типов данных от питоновского парсера
const PREVIEW_FOLDER = path.join(__dirname, '../../../fot_data_py/preview');
const OVERVIEW_FOLDER = path.join(__dirname, '../../../fot_data_py/overview'); // 🟢 Твой новый путь

// --- PREVIEW ---
async function importPreviews() {
  if (!fs.existsSync(PREVIEW_FOLDER))
    return console.log(`[Skip] Папка preview не найдена.`);

  const files = fs.readdirSync(PREVIEW_FOLDER);
  const jsonFiles = files.filter(
    (f) => f.startsWith('scory_preview_') && path.extname(f) === '.json',
  );
  if (jsonFiles.length === 0) return console.log('Нет новых файлов preview.');

  const bulkOperations = [];
  for (const file of jsonFiles) {
    const fileData = fs.readFileSync(path.join(PREVIEW_FOLDER, file), 'utf-8');
    const jsonData = JSON.parse(fileData);
    if (!jsonData.fotmobId) continue;

    bulkOperations.push({
      updateOne: {
        filter: { fotmobId: jsonData.fotmobId },
        update: { $set: jsonData },
        upsert: true,
      },
    });
  }

  if (bulkOperations.length > 0) {
    const result = await matchPreviewsCollection.bulkWrite(bulkOperations);
    console.log(
      `[Preview] Создано: ${result.upsertedCount}, Обновлено: ${result.modifiedCount}`,
    );
  }
}

// --- OVERVIEW ---
async function importOverview() {
  if (!fs.existsSync(OVERVIEW_FOLDER))
    return console.log(`[Skip] Папка overview не найдена.`);

  const files = fs.readdirSync(OVERVIEW_FOLDER);
  const jsonFiles = files.filter(
    (f) => f.startsWith('scory_overview_') && path.extname(f) === '.json',
  );
  if (jsonFiles.length === 0) return console.log('Нет новых файлов overview.');

  const bulkOperations = [];
  for (const file of jsonFiles) {
    const fileData = fs.readFileSync(path.join(OVERVIEW_FOLDER, file), 'utf-8');
    const jsonData = JSON.parse(fileData);
    if (!jsonData.fotmobId) continue;

    bulkOperations.push({
      updateOne: {
        filter: { fotmobId: jsonData.fotmobId },
        update: { $set: jsonData },
        upsert: true,
      },
    });
  }

  if (bulkOperations.length > 0) {
    const result = await matchOverviewCollection.bulkWrite(bulkOperations);
    console.log(
      `[Overview] Создано: ${result.upsertedCount}, Обновлено: ${result.modifiedCount}`,
    );
  }
}

// -------------------------
async function runMainImport() {
  console.log('=== Запуск полного импорта данных Scory ===');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[OK] Подключение к MongoDB успешно.');

    await Promise.all([importPreviews(), importOverview()]);

    console.log('[Успех] Все данные успешно синхронизированы.');
  } catch (error) {
    console.error('Критическая ошибка импорта:', error);
  } finally {
    await mongoose.disconnect();
    console.log('=== Соединение с MongoDB закрыто ===');
  }
}

runMainImport();
