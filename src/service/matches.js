import { MatchesCollection } from '../db/models/matches.js';

export const getMatchByIdData = async (matchId) => {
  const match = await MatchesCollection.findById(matchId)
    .populate('homeTeam')
    .populate('awayTeam')
    .populate('tournament', 'name')
    .lean();

  return match;
};
