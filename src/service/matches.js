import { MatchesCollection } from '../db/models/matches.js';
import mongoose from 'mongoose';
import { matchOverviewCollection } from '../db/models/matchOverview.js';
import { matchPreviewsCollection } from '../db/models/matchPreviews.js';

export const getMatchByIdData = async (matchId) => {
  const isMongoId = mongoose.Types.ObjectId.isValid(matchId);

  const filter = isMongoId
    ? { $or: [{ _id: matchId }, { fotmobId: String(matchId) }] }
    : { fotmobId: String(matchId) };

  const match = await MatchesCollection.findOne(filter)
    .populate('homeTeam')
    .populate('awayTeam')
    .populate('tournament', 'name')
    .lean();

  if (!match) return null;

  match.preview = null;
  match.overview = null;

  if (match.status === 'scheduled' && match.fotmobId) {
    const previewData = await matchPreviewsCollection
      .findOne({
        $or: [
          { fotmobId: match.fotmobId },
          { fotmobId: Number(match.fotmobId) },
        ],
      })
      .lean();

    if (previewData) {
      match.preview = previewData;
    }
  }

  if (match.status === 'finished' && match.fotmobId) {
    const overviewData = await matchOverviewCollection
      .findOne({
        $or: [
          { fotmobId: match.fotmobId },
          { fotmobId: Number(match.fotmobId) },
        ],
      })
      .lean();

    if (overviewData) {
      match.overview = overviewData;
    }
  }

  return match;
};
