import { TournamentStatsCollection } from '../db/models/tournamentStats.js';

export const getRankingService = async (tournamentTag) => {
  const topPlayers = await TournamentStatsCollection.find({
    tournament: tournamentTag,
  })
    .sort({ points: -1 })
    .limit(50)
    .populate('userId', 'userName userNickname')
    .lean();

  return topPlayers.map((player, index) => ({
    id: player._id,
    rank: index + 1,
    points: player.points,
    userId: player.userId?._id || null,
    userName: player.userId?.userName || '',
    userNickname: player.userId?.userNickname || null,
  }));
};
