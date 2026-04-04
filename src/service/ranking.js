import { TournamentStatsCollection } from '../db/models/tournamentStats.js';

export const getRankingService = async (tournamentTag) => {
  const topPlayers = await TournamentStatsCollection.find({
    tournament: tournamentTag,
  })
    .sort({ points: -1 })
    .limit(50)
    .populate('userId', 'username avatarUrl')
    .lean();

  return topPlayers.map((player, index) => ({
    ...player,
    rank: index + 1,
    user: player.userId
      ? {
          username: player.userId.username,
          avatarUrl: player.userId.avatarUrl,
        }
      : null,
    userId: player.userId?._id || player.userId,
  }));
};
