import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import 'dotenv/config';
import { matchPreviewsCollection } from '../db/models/matchPreviews.js';
import { matchOverviewCollection } from '../db/models/matchOverview.js';
import { TournamentsCollection } from '../db/models/tournaments.js';
import { TeamsCollection } from '../db/models/teams.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const user = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASSWORD;
const url = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB || 'scory';

const MONGO_URI = `mongodb+srv://${user}:${password}@${url}/${dbName}?retryWrites=true&w=majority`;

// Папки для разных типов данных от питоновского парсера
const PREVIEW_FOLDER = path.join(__dirname, '../../../fot_data_py/preview');
const OVERVIEW_FOLDER = path.join(__dirname, '../../../fot_data_py/overview');
const LEAGUE_TABLES_FOLDER = path.join(
  __dirname,
  '../../../fot_data_py/tables',
);
const TEAMS_FOLDER = path.join(__dirname, '../../../fot_data_py/teams');

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
  const jsonFiles = files.filter(
    (f) => f.startsWith('scory_league_') && f.endsWith('_table.json'),
  );
  if (jsonFiles.length === 0)
    return console.log('Нет новых файлов турнирных таблиц.');

  // 1. Оптимизация: загружаем все команды из коллекции teams одним запросом
  // Создаем карту Map: fotmobId (число) -> MongoDB ObjectId (_id)
  const teamsList = await TeamsCollection.find(
    {},
    { _id: 1, fotmobId: 1 },
  ).lean();
  const teamsMap = new Map(
    teamsList
      .filter((t) => t.fotmobId != null)
      .map((t) => [Number(t.fotmobId), t._id]),
  );

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

    // 2. Трансформируем каждый объект в массиве таблицы
    const enrichedTableData = tableDataArray.map((row) => {
      const originalFotmobId = Number(row.id);

      const mongoTeamId = teamsMap.get(originalFotmobId) || null;

      if (!mongoTeamId) {
        console.warn(
          `[Warning] Команда "${row.name}" (fotmobId: ${originalFotmobId}) не найдена в коллекции teams!`,
        );
      }

      const { id, ...restRow } = row;
      console.log(id);
      return {
        id: mongoTeamId,
        fotmobId: originalFotmobId,
        ...restRow,
      };
    });

    bulkOperations.push({
      updateOne: {
        filter: { fotmobId: leagueFotmobId },
        update: {
          $set: {
            table: enrichedTableData,
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
async function importTeamsData() {
  if (!fs.existsSync(TEAMS_FOLDER)) {
    return console.log(`[Skip] Папка команд (${TEAMS_FOLDER}) не найдена.`);
  }

  const files = fs.readdirSync(TEAMS_FOLDER);

  const jsonFiles = files.filter(
    (f) => f.startsWith('scory_team_') && f.endsWith('_data.json'),
  );

  if (jsonFiles.length === 0) {
    return console.log('Нет новых файлов данных команд.');
  }

  const bulkOperations = [];

  for (const file of jsonFiles) {
    const matchIdAttr = file.match(/scory_team_(\d+)_data\.json$/);
    if (!matchIdAttr) continue;

    const teamFotmobId = parseInt(matchIdAttr[1], 10);

    const filePath = path.join(TEAMS_FOLDER, file);
    const fileData = fs.readFileSync(filePath, 'utf-8');

    let teamData;
    try {
      teamData = JSON.parse(fileData);
    } catch (e) {
      console.log(` Ошибка ${file}`, e);
      continue;
    }

    if (!teamData || typeof teamData !== 'object' || Array.isArray(teamData)) {
      console.log(`Файл ${file} содержит некорректную структуру`);
      continue;
    }

    bulkOperations.push({
      updateOne: {
        filter: { fotmobId: teamFotmobId },
        update: {
          $set: {
            fotmobId: teamData.fotmobId || teamFotmobId,
            name: teamData.name,
            shortName: teamData.shortName,
            country: teamData.country,
            logoUrl: teamData.logoUrl,
            colors: teamData.colors,
            stadium: teamData.stadium,
            coach: teamData.coach,
            squadLines: teamData.squadLines,
            fixtures: teamData.fixtures || [],
          },
        },
        upsert: true,
      },
    });
  }
  try {
    await TeamsCollection.collection.dropIndex('code_1');
    console.log('Старый индекс code_1 успешно удален!');
  } catch (e) {
    console.log('Индекс code_1 уже был удален', e);
  }

  if (bulkOperations.length > 0) {
    const result = await TeamsCollection.bulkWrite(bulkOperations);
    console.log(
      `[Teams Import] Вставлено новых: ${result.upsertedCount}, Обновлено: ${result.modifiedCount}`,
    );
  }
}
// -------------------------

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
      importTeamsData(),
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
