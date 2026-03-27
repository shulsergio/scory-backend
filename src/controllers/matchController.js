import { MatchesCollection } from '../db/models/matches.js';
import { calculatePoints } from '../service/scoring.js';
import { UsersCollection } from '../db/models/users.js';
import { PredictorsCollection } from '../db/models/predictors.js';
import { ObjectId } from 'mongodb';

export const finishAndCalculateMatch = async (req, res) => {
  const { logKey, homeScore, awayScore } = req.body;
  const { matchId } = req.params;

  if (logKey !== process.env.SCORE_KEY?.trim()) {
    console.log('Security');
    return res.status(403).json({ error: 'Неверный ключ.' });
  }
  try {
    // 1. Пробуем найти вообще ВСЕ прогнозы этого матча (игнорируем флаги и типы)
    const findAsString = await PredictorsCollection.find({
      matchId: matchId,
    }).lean();
    const findAsObj = await PredictorsCollection.find({
      matchId: new ObjectId(matchId),
    }).lean();

    console.log('--- Поиск строкой ---', findAsString.length);
    console.log('--- Поиск через ObjectId ---', findAsObj.length);

    // Если первый нашел, а второй нет — значит в базе СТРОКИ.
    // Если оба по 0 — значит поле в базе называется по-другому или ID не тот.

    const predictions = await PredictorsCollection.find({
      $or: [{ matchId: matchId }, { matchId: new ObjectId(matchId) }],
      isCalculated: { $ne: true }, // Ищем всё, что не рассчитано
    }).lean();

    // Теперь predictions — это обычный массив [{}, {}, ...]
    console.log('---Найдено прогнозов---', predictions.length);
    console.log('---matchId---', matchId);
    console.log('---predictions---', predictions);

    if (predictions.length === 0) {
      return res
        .status(200)
        .json({ message: 'Прогнозов нет, просто закрываем матч.' });
    }

    // ОБНОВА ПАКЕТОМ!!!
    const predictionUpdates = [];
    const userUpdates = [];

    predictions.forEach((pred) => {
      const points = calculatePoints(
        pred.homeGoals,
        pred.awayGoals,
        homeScore,
        awayScore,
      );

      // Обновление прогноза
      predictionUpdates.push({
        updateOne: {
          filter: { _id: pred._id },
          update: { $set: { points, isCalculated: true } },
        },
      });

      // Обновление общего счета юзера
      userUpdates.push({
        updateOne: {
          filter: { _id: pred.userId },
          update: { $inc: { totalPoints: points } },
        },
      });
    });

    // 3. Выполняем всё в базе
    await PredictorsCollection.bulkWrite(predictionUpdates);
    await UsersCollection.bulkWrite(userUpdates);

    // 4. Обновляем статус матча
    await MatchesCollection.findByIdAndUpdate(matchId, {
      homeScore,
      awayScore,
      status: 'finished',
      calculated: true,
    });

    res.status(200).json({ success: true, processed: predictions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
