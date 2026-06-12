import { TournamentsCollection } from '../db/models/tournaments.js';
import { TournamentStatsCollection } from '../db/models/tournamentStats.js';

export const getRankingService = async (tournamentTag, page = 1, limit = 5) => {
  const tournamentDoc = await TournamentsCollection.findOne({
    slug: tournamentTag,
  }).lean();

  if (!tournamentDoc) {
    console.log(`---Турнир ${tournamentTag} не найден ---`);
    return null;
  }

  const skip = (page - 1) * limit;
  const filter = { tournament: tournamentDoc._id };

  const [topPlayers, totalPlayers] = await Promise.all([
    TournamentStatsCollection.find(filter)
      .sort({ points: -1, exactScores: -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'userName userNickname country')
      .lean(),
    TournamentStatsCollection.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalPlayers / limit) || 1;

  const mappedPlayers = topPlayers.map((player, index) => {
    const previousRank = player.prevRank || 0;
    const currentRank = player.rank || skip + index + 1;

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
      country: player.userId?.country || null,
    };
  });

  return {
    pagination: {
      totalPlayers,
      totalPages,
      currentPage: page,
      limit,
    },
    data: mappedPlayers,
  };
};
