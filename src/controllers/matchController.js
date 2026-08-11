import { MatchesCollection } from '../db/models/matches.js';
import {
  calculatePoints,
  getPredictionMatchStatsService,
} from '../service/scoring.js';
// import { UsersCollection } from '../db/models/users.js';
import { PredictorsCollection } from '../db/models/predictors.js';
import { LeaguesCollection } from '../db/models/leagues.js';
import { MembershipCollection } from '../db/models/memberships.js';
import { TournamentStatsCollection } from '../db/models/tournamentStats.js';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export const finishAndCalculateMatch = async (req, res) => {
  const { logKey, homeScore, awayScore } = req.body;
  const { matchId } = req.params;

  if (logKey !== process.env.SCORE_KEY?.trim()) {
    console.log('Security');
    return res.status(403).json({ error: 'Неверный ключ.' });
  }
  try {
    const match = await MatchesCollection.findById(matchId).lean();
    if (!match) return res.status(404).json({ error: 'Матч не найден' });
    const tournamentId = match.tournament;
    const activeLeagues = await LeaguesCollection.find({
      tournament: tournamentId,
    }).select('_id');

    const activeLeagueIds = activeLeagues.map((l) => l._id);

    const predictions = await PredictorsCollection.find({
      $or: [{ matchId: matchId }, { matchId: new ObjectId(matchId) }],
      isCalculated: { $ne: true },
    }).lean();

    if (predictions.length === 0) {
      return res
        .status(200)
        .json({ message: 'Прогнозов нет, просто закрываем матч.' });
    }

    // ОБНОВА ПАКЕТОМ!!!
    const predictionUpdates = [];
    const membershipUpdates = [];
    const tournamentUpdates = [];

    predictions.forEach((pred) => {
      const points = calculatePoints(
        pred.homeGoals,
        pred.awayGoals,
        homeScore,
        awayScore,
      );
      const isExact =
        pred.homeGoals === homeScore && pred.awayGoals === awayScore;
      const isOutcome = points > 0 && !isExact;
      //------
      predictionUpdates.push({
        updateOne: {
          filter: { _id: pred._id },
          update: { $set: { points, isCalculated: true } },
        },
      });

      membershipUpdates.push({
        updateMany: {
          filter: {
            userId: pred.userId,
            leagueId: { $in: activeLeagueIds },
          },
          update: { $inc: { totalPoints: points } },
        },
      });

      //------
      tournamentUpdates.push({
        updateOne: {
          // Ищем по userId и ObjectId турнира
          filter: { userId: pred.userId, tournament: tournamentId },
          update: {
            $inc: {
              points: points,
              matchesPredicted: 1,
              exactScores: isExact ? 1 : 0,
              correctOutcomes: isOutcome ? 1 : 0,
            },
          },
          upsert: true,
        },
      });

      //------
    });

    //------
    await Promise.all([
      PredictorsCollection.bulkWrite(predictionUpdates),
      TournamentStatsCollection.bulkWrite(tournamentUpdates),
      // UsersCollection.bulkWrite(userUpdates), - не нужен, юзера не обновляю
    ]);
    if (membershipUpdates.length > 0) {
      await MembershipCollection.bulkWrite(membershipUpdates);
    }
    // 4. Обновляем статус матча
    await MatchesCollection.findByIdAndUpdate(matchId, {
      score: {
        home: homeScore,
        away: awayScore,
      },
      status: 'finished',
      isCalculated: true,
    });

    res.status(200).json({ success: true, processed: predictions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//--------------------
//
export const getPredictionMatchStatsController = async (req, res) => {
  const { matchId } = req.params;

  if (!matchId) {
    return res.status(400).json({ error: 'Не указан ID матча.' });
  }

  try {
    const result = await getPredictionMatchStatsService(matchId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//--------------------

export const getMatchExactWinnersController = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await MatchesCollection.findById(matchId);

    if (!match || !match.score) {
      return res.status(404).json({ message: 'Матч или счет не найдены' });
    }

    const realHomeScore = match.score.home;
    const realAwayScore = match.score.away;

    const predictions = await PredictorsCollection.find({
      matchId: matchId,
    }).populate('userId', 'userNickname');

    const exactWinners = predictions
      .filter(
        (pred) =>
          pred.homeGoals === realHomeScore && pred.awayGoals === realAwayScore,
      )
      .map((pred) => ({
        userId: pred.userId?._id || pred.userId,
        userNickname: pred.userId?.userNickname || 'Аноним',
      }));

    res.json(exactWinners);
  } catch (error) {
    console.error('Ошибка в getMatchExactWinners:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// -------

// -------

// -------

export const calculateAllFinishedMatches = async () => {
  // 1. Ищем все завершённые, но ещё не просчитанные матчи
  const matchesToProcess = await MatchesCollection.find({
    status: 'finished',
    isCalculated: { $ne: true },
  }).lean();

  if (matchesToProcess.length === 0) {
    return { message: 'Нет матчей для подсчета', processedMatches: 0 };
  }

  let totalProcessedPredictions = 0;

  // 2. Обрабатываем каждый матч
  for (const match of matchesToProcess) {
    const matchId = match._id;
    const homeScore = match.score?.home;
    const awayScore = match.score?.away;

    // Пропускаем, если счет не был корректно записан в БД
    if (homeScore === undefined || awayScore === undefined) {
      console.warn(
        `Матч ${matchId} завершен, но счет отсутствует. Пропускаем.`,
      );
      continue;
    }

    // Приводим ID к ObjectId для надежного поиска в Mongo
    const matchObjectId = new mongoose.Types.ObjectId(matchId);

    // Ищем лиги, где админы добавили этот матч в selectedMatches
    const activeLeagues = await LeaguesCollection.find({
      selectedMatches: matchObjectId,
    }).select('_id');

    const activeLeagueIds = activeLeagues.map((l) => l._id);

    // Ищем все непросчитанные прогнозы на данный матч
    const predictions = await PredictorsCollection.find({
      matchId: matchObjectId,
      isCalculated: { $ne: true },
    }).lean();

    // Если прогнозов нет — закрываем матч, чтобы не крутить его повторно
    if (predictions.length === 0) {
      await MatchesCollection.findByIdAndUpdate(matchId, {
        isCalculated: true,
      });
      continue;
    }

    const predictionUpdates = [];
    const membershipUpdates = [];
    const tournamentUpdates = [];

    // 3. Формируем батчи обновлений
    predictions.forEach((pred) => {
      const points = calculatePoints(
        pred.homeGoals,
        pred.awayGoals,
        homeScore,
        awayScore,
      );

      const isExact =
        pred.homeGoals === homeScore && pred.awayGoals === awayScore;
      const isOutcome = points > 0 && !isExact;

      // Обновляем сам прогноз
      predictionUpdates.push({
        updateOne: {
          filter: { _id: pred._id },
          update: { $set: { points, isCalculated: true } },
        },
      });

      // Обновляем очки участника в приватных лигах
      if (activeLeagueIds.length > 0) {
        membershipUpdates.push({
          updateMany: {
            filter: {
              userId: pred.userId,
              leagueId: { $in: activeLeagueIds },
            },
            update: { $inc: { totalPoints: points } },
          },
        });
      }

      // Обновляем общую статистику турнира (если у матча есть tournament)
      if (match.tournament) {
        tournamentUpdates.push({
          updateOne: {
            filter: {
              userId: pred.userId,
              tournament: match.tournament,
            },
            update: {
              $inc: {
                points: points,
                matchesPredicted: 1,
                exactScores: isExact ? 1 : 0,
                correctOutcomes: isOutcome ? 1 : 0,
              },
            },
            upsert: true,
          },
        });
      }
    });

    const bulkPromises = [];

    if (predictionUpdates.length > 0) {
      bulkPromises.push(PredictorsCollection.bulkWrite(predictionUpdates));
    }
    if (membershipUpdates.length > 0) {
      bulkPromises.push(MembershipCollection.bulkWrite(membershipUpdates));
    }
    if (tournamentUpdates.length > 0) {
      bulkPromises.push(TournamentStatsCollection.bulkWrite(tournamentUpdates));
    }

    if (bulkPromises.length > 0) {
      await Promise.all(bulkPromises);
    }

    await MatchesCollection.findByIdAndUpdate(matchId, { isCalculated: true });

    totalProcessedPredictions += predictions.length;
  }

  return {
    success: true,
    processedMatches: matchesToProcess.length,
    processedPredictions: totalProcessedPredictions,
  };
};
