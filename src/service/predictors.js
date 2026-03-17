import createHttpError from 'http-errors';
import { MatchesCollection } from '../db/models/matches';
import { PredictorsCollection } from '../db/models/predictors';

export const upsertPrediction = async ({
  userId,
  matchId,
  homeGoals,
  awayGoals,
}) => {
  const match = await MatchesCollection.findById(matchId);
  if (!match) {
    throw createHttpError(404, 'No match found');
  }
  const now = new Date();
  if (now > match.lockTime) {
    throw createHttpError(400, 'Data is locked');
  }
  const prediction = await PredictorsCollection.findOneAndUpdate(
    { userId, matchId },
    {
      homeGoals,
      awayGoals,
      predictedAt: now,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );

  return prediction;
};
