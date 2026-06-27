import { MatchesCollection } from '../db/models/matches.js';
import { TournamentsCollection } from '../db/models/tournaments.js';

export const getPlayoffMatchesService = async (tournamentTag) => {
  const tournament = await TournamentsCollection.findOne({
    slug: tournamentTag,
  }).lean();

  if (!tournament) {
    return null;
  }

  const playoffMatches = await MatchesCollection.find({
    tournament: tournament._id,
    isPlayoff: true,
  })
    .populate('homeTeam', 'name flagCode')
    .populate('awayTeam', 'name flagCode')
    .lean();

  return playoffMatches;
};
