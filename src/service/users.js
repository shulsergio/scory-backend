import { PredictorsCollection } from '../db/models/predictors.js';
import { TournamentStatsCollection } from '../db/models/tournamentStats.js';
import { UsersCollection } from '../db/models/users.js';

export const getUserProfileData = async (userId) => {
  const user = await UsersCollection.findById(userId)
    .select('userName userNickname lastVisit createdAt')
    .lean();
  if (!user) return null;

  const tournamentStats = await TournamentStatsCollection.find({ userId })
    .populate('tournament')
    .sort({ points: -1 })
    .lean();

  const recentPredictions = await PredictorsCollection.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate({
      path: 'matchId',
      select: 'homeTeam awayTeam score status league',
      populate: [
        { path: 'homeTeam', select: 'name' },
        { path: 'awayTeam', select: 'name' },
      ],
    })
    .lean();

  return {
    user: {
      nickname: user.userNickname,
      userName: user.userName,
      lastVisit: user.lastVisit,
      memberSince: user.createdAt,
    },
    stats: tournamentStats.map((s) => ({
      tournamentSlug: s.tournament.slug || 'unknown',
      tournamentName: s.tournament.name || 'unknown',
      points: s.points,
      rank: s.rank || 0,
      prevRank: s.prevRank || 0,
      matchesPredicted: s.matchesPredicted,
      exactScores: s.exactScores || 0,
      correctOutcomes: s.correctOutcomes || 0,
    })),
    predictions: recentPredictions.map((p) => ({
      id: p._id,
      match: p.matchId,
      userPrediction: {
        home: p.homeGoals,
        away: p.awayGoals,
      },
      pointsEarned: p.points,
      isCalculated: p.isCalculated,
    })),
  };
};
