import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import 'dotenv/config';
import { matchPreviewsCollection } from '../db/models/matchPreviews.js';
import { matchOverviewCollection } from '../db/models/matchOverview.js';
import { TournamentsCollection } from '../db/models/tournaments.js';

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
const LEAGUE_TABLES_FOLDER = path.join(
  __dirname,
  '../../../fot_data_py/tables',
);

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

// --- IMPORT ALL LEAGUES Tables!!!---

async function importLeagueTables() {
  if (!fs.existsSync(LEAGUE_TABLES_FOLDER))
    return console.log(`[Skip] Папка tables не найдена.`);

  const files = fs.readdirSync(LEAGUE_TABLES_FOLDER);
  // Парсим файлы вида league_54_teams_clean.json
  const jsonFiles = files.filter(
    (f) => f.startsWith('scory_league_') && f.endsWith('_table.json'),
  );
  if (jsonFiles.length === 0)
    return console.log('Нет новых файлов турнирных таблиц.');

  const bulkOperations = [];

  for (const file of jsonFiles) {
    const matchIdAttr = file.match(/league_(\d+)_/);
    if (!matchIdAttr) continue;
    const leagueFotmobId = parseInt(matchIdAttr[1], 10);
    console.log('leagueFotmobId- ', leagueFotmobId);
    const fileData = fs.readFileSync(
      path.join(LEAGUE_TABLES_FOLDER, file),
      'utf-8',
    );
    const tableDataArray = JSON.parse(fileData);

    if (!Array.isArray(tableDataArray)) {
      console.log(`[Пропуск] Файл ${file} содержит некорректную структуру`);
      continue;
    }

    bulkOperations.push({
      updateOne: {
        filter: { fotmobId: leagueFotmobId },
        update: {
          $set: {
            table: tableDataArray,
          },
        },
        upsert: false,
      },
    });
  }

  if (bulkOperations.length > 0) {
    const result = await TournamentsCollection.bulkWrite(bulkOperations);
    console.log(
      `[League Tables] Обновлено турнирных таблиц: ${result.modifiedCount}`,
    );
  }
}

// -------------------------
async function runMainImport() {
  console.log('=== Запуск полного импорта данных Scory ===');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[OK] Подключение к MongoDB успешно.');

    await Promise.all([
      importPreviews(),
      importOverview(),
      importLeagueTables(),
    ]);

    console.log('[Успех] Все данные успешно синхронизированы.');
  } catch (error) {
    console.error('Критическая ошибка импорта:', error);
  } finally {
    await mongoose.disconnect();
    console.log('=== Соединение с MongoDB закрыто ===');
  }
}

runMainImport();
