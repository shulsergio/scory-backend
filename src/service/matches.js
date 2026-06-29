import { MatchesCollection } from '../db/models/matches.js';
import { matchPreviewsCollection } from '../db/models/matchPreviews.js';

export const getMatchByIdData = async (matchId) => {
  const match = await MatchesCollection.findById(matchId)
    .populate('homeTeam')
    .populate('awayTeam')
    .populate('tournament', 'name')
    .lean();

  if (!match) return null;

  match.preview = null;

  if (match.status === 'scheduled' && match.fotmobId) {
    const previewData = await matchPreviewsCollection
      .findOne({ fotmobId: match.fotmobId })
      .lean();

    if (previewData) {
      match.preview = previewData;
    }
  }

  //   Если матч закончился, то думать тут
  // if (match.status === 'finished') {
  //   match.stats = await matchStatsCollection.findOne({ ... });
  // }

  return match;
};
