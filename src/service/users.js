import { PredictorsCollection } from '../db/models/predictors.js';
import { TournamentStatsCollection } from '../db/models/tournamentStats.js';
import { UsersCollection } from '../db/models/users.js';

export const getUserProfileData = async (userId) => {
  // 1. Базовая инфа о юзере
  const user = await UsersCollection.findById(userId)
    .select('nickname createdAt')
    .lean();
  if (!user) return null;

  // 2. Статистика по всем турнирам
  // У тебя там лежат: points, rank, matchesPredicted, exactScores, correctOutcomes
  const tournamentStats = await TournamentStatsCollection.find({ userId })
    .sort({ points: -1 })
    .lean();

  // 3. Последние 10 прогнозов (чтобы показать "форму" игрока)
  const recentPredictions = await PredictorsCollection.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate({
      path: 'matchId',
      select: 'homeTeam awayTeam score status league', // вытягиваем инфу о матче
    })
    .lean();

  return {
    user: {
      nickname: user.nickname,
      memberSince: user.createdAt,
    },
    stats: tournamentStats.map((s) => ({
      tournament: s.tournament,
      points: s.points,
      rank: s.rank || 0,
      prevRank: s.prevRank || 0,
      matchesPredicted: s.matchesPredicted,
      exactScores: s.exactScores || 0,
      correctOutcomes: s.correctOutcomes || 0,
    })),
    predictions: recentPredictions.map((p) => ({
      id: p._id,
      match: p.matchId, // тут будет объект с командами
      userPrediction: {
        home: p.homeGoals,
        away: p.awayGoals,
      },
      pointsEarned: p.points,
      isCalculated: p.isCalculated,
    })),
  };
};
