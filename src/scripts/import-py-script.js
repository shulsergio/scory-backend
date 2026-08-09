import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import 'dotenv/config';
import { matchPreviewsCollection } from '../db/models/matchPreviews.js';
import { matchOverviewCollection } from '../db/models/matchOverview.js';
import { TournamentsCollection } from '../db/models/tournaments.js';
import { TeamsCollection } from '../db/models/teams.js';
import { MatchesCollection } from '../db/models/matches.js';

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
const LEAGUE_MATCHES_FOLDER = path.join(
  __dirname,
  '../../../fot_data_py/league_matches',
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

  const bulkOperations = jsonFiles
    .map((file) => {
      const fileData = fs.readFileSync(
        path.join(PREVIEW_FOLDER, file),
        'utf-8',
      );
      const jsonData = JSON.parse(fileData);
      if (!jsonData.fotmobId) return null;

      return {
        updateOne: {
          filter: { fotmobId: jsonData.fotmobId },
          update: { $set: jsonData },
          upsert: true,
        },
      };
    })
    .filter(Boolean);

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

  const bulkOperations = jsonFiles
    .map((file) => {
      const fileData = fs.readFileSync(
        path.join(OVERVIEW_FOLDER, file),
        'utf-8',
      );
      const jsonData = JSON.parse(fileData);
      if (!jsonData.fotmobId) return null;

      return {
        updateOne: {
          filter: { fotmobId: jsonData.fotmobId },
          update: { $set: jsonData },
          upsert: true,
        },
      };
    })
    .filter(Boolean);

  if (bulkOperations.length > 0) {
    const result = await matchOverviewCollection.bulkWrite(bulkOperations);
    console.log(
      `[Overview] Создано: ${result.upsertedCount}, Обновлено: ${result.modifiedCount}`,
    );
  }
}

// --- IMPORT TEAMS ---
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
      console.log(` Ошибка чтения JSON в файле ${file}`, e);
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

  if (bulkOperations.length > 0) {
    const result = await TeamsCollection.bulkWrite(bulkOperations);
    console.log(
      `[Teams Import] Вставлено новых: ${result.upsertedCount}, Обновлено: ${result.modifiedCount}`,
    );
  }
}

// --- IMPORT LEAGUE TABLES ---
async function importLeagueTables() {
  if (!fs.existsSync(LEAGUE_TABLES_FOLDER))
    return console.log(`[Skip] Папка tables не найдена.`);

  const files = fs.readdirSync(LEAGUE_TABLES_FOLDER);
  const jsonFiles = files.filter(
    (f) => f.startsWith('scory_league_') && f.endsWith('_table.json'),
  );
  if (jsonFiles.length === 0)
    return console.log('Нет новых файлов турнирных таблиц.');

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

    const fileData = fs.readFileSync(
      path.join(LEAGUE_TABLES_FOLDER, file),
      'utf-8',
    );
    const tableDataArray = JSON.parse(fileData);

    if (!Array.isArray(tableDataArray)) {
      console.log(`[Пропуск] Файл ${file} содержит некорректную структуру`);
      continue;
    }

    const enrichedTableData = tableDataArray.map((row) => {
      const originalFotmobId = Number(row.id);
      const mongoTeamId = teamsMap.get(originalFotmobId) || null;

      if (!mongoTeamId) {
        console.warn(
          `[Warning] Команда "${row.name}" (fotmobId: ${originalFotmobId}) не найдена в коллекции teams!`,
        );
      }
      // eslint-disable-next-line no-unused-vars
      const { id, ongoing, ...restRow } = row;
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
        upsert: true,
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

// --- IMPORT LEAGUE MATCHES ⚽ ---
async function importLeagueMatches() {
  if (!fs.existsSync(LEAGUE_MATCHES_FOLDER)) {
    return console.log(`[Skip] Папка league_matches не найдена.`);
  }

  const files = fs.readdirSync(LEAGUE_MATCHES_FOLDER);
  const jsonFiles = files.filter(
    (f) => f.startsWith('scory_league_') && f.endsWith('_matches.json'),
  );
  if (jsonFiles.length === 0) return console.log('Нет новых файлов матчей.');

  // Загружаем карты ObjectId для команд и турниров
  const [teamsList, tournamentsList] = await Promise.all([
    TeamsCollection.find({}, { _id: 1, fotmobId: 1 }).lean(),
    TournamentsCollection.find({}, { _id: 1, fotmobId: 1 }).lean(),
  ]);

  const teamsMap = new Map(
    teamsList
      .filter((t) => t.fotmobId != null)
      .map((t) => [Number(t.fotmobId), t._id]),
  );

  const tournamentsMap = new Map(
    tournamentsList
      .filter((t) => t.fotmobId != null)
      .map((t) => [Number(t.fotmobId), t._id]),
  );

  const bulkOperations = [];

  for (const file of jsonFiles) {
    const fileData = fs.readFileSync(
      path.join(LEAGUE_MATCHES_FOLDER, file),
      'utf-8',
    );
    let matchesArray;

    try {
      matchesArray = JSON.parse(fileData);
    } catch (e) {
      console.log(` Ошибка чтения JSON в файле ${file}`, e);
      continue;
    }

    if (!Array.isArray(matchesArray)) {
      console.log(
        `[Пропуск] Файл ${file} содержит некорректную структуру (ожидался массив)`,
      );
      continue;
    }

    for (const match of matchesArray) {
      const homeTeamFotmobId = Number(match.homeTeamFotmobId);
      const awayTeamFotmobId = Number(match.awayTeamFotmobId);
      const tournamentFotmobId = Number(match.tournamentFotmobId);

      const homeTeamId = teamsMap.get(homeTeamFotmobId) || null;
      const awayTeamId = teamsMap.get(awayTeamFotmobId) || null;
      const tournamentId = tournamentsMap.get(tournamentFotmobId) || null;

      if (!tournamentId) {
        console.warn(
          `[Warning] Турнир с fotmobId: ${tournamentFotmobId} не найден в коллекции tournaments! (Матч ID: ${match.fotmobId})`,
        );
        continue;
      }

      // Удаляем временные ключи Fotmob ID
      // eslint-disable-next-line no-unused-vars
      const { homeTeamFotmobId: _, awayTeamFotmobId: __, ...restMatch } = match;

      const matchDocument = {
        ...restMatch,
        homeTeam: homeTeamId,
        awayTeam: awayTeamId,
        tournament: tournamentId,
        kickoffTime: new Date(match.kickoffTime),
        lockTime: new Date(match.lockTime),
      };

      bulkOperations.push({
        updateOne: {
          filter: { fotmobId: String(match.fotmobId) },
          update: { $set: matchDocument },
          upsert: true,
        },
      });
    }
  }

  if (bulkOperations.length > 0) {
    const result = await MatchesCollection.bulkWrite(bulkOperations);
    console.log(
      `[League Matches] Вставлено новых: ${result.upsertedCount}, Обновлено: ${result.modifiedCount}`,
    );
  }
}

// --- RUN ALL ---
async function runMainImport() {
  console.log('=== Запуск полного импорта данных Scory ===');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[OK] Подключение к MongoDB успешно.');

    await TeamsCollection.syncIndexes().catch(() => {});

    // 1. Сначала подтягиваем ВСЕ команды
    await importTeamsData();

    // 2. Параллельно импортируем превью, обзоры, таблицы и матчи
    await Promise.all([
      importPreviews(),
      importOverview(),
      importLeagueTables(),
      importLeagueMatches(),
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
