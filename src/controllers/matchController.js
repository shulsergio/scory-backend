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

    // console.log('---Найдено прогнозов---', predictions.length);
    // console.log('---matchId---', matchId);
    // console.log('---predictions---', predictions);
    // console.log('---activeLeagueIds---', activeLeagueIds);

    if (predictions.length === 0) {
      return res
        .status(200)
        .json({ message: 'Прогнозов нет, просто закрываем матч.' });
    }

    // ОБНОВА ПАКЕТОМ!!!
    const predictionUpdates = [];
    // const userUpdates = [];--- юзера не обновляю (удалить с коллекции)
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
