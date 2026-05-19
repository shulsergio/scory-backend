import { TournamentsCollection } from '../db/models/tournaments.js';
import { TournamentStatsCollection } from '../db/models/tournamentStats.js';

export const getRankingService = async (tournamentTag) => {
  const tournamentDoc = await TournamentsCollection.findOne({
    slug: tournamentTag,
  }).lean();

  if (!tournamentDoc) {
    console.log(`---Турнир ${tournamentTag} не найден в базе---`);
    return [];
  }

  const topPlayers = await TournamentStatsCollection.find({
    tournament: tournamentDoc._id,
  })
    .sort({ points: -1 })
    .limit(50)
    .populate('userId', 'userName userNickname')
    .lean();

  return topPlayers.map((player, index) => {
    const previousRank = player.prevRank || 0;
    const currentRank = player.rank || index + 1;

    let rankDiff = 0;
    if (previousRank > 0) {
      rankDiff = previousRank - currentRank;
    }

    return {
      id: player._id,
      rank: currentRank,
      prevRank: previousRank,
      rankDiff: rankDiff,
      points: player.points,
      matchesPredicted: player.matchesPredicted || 0,
      exactScores: player.exactScores || 0,
      userId: player.userId?._id || null,
      userName: player.userId?.userName || '',
      userNickname: player.userId?.userNickname || null,
    };
  });
};
