import createHttpError from 'http-errors';
import { MatchesCollection } from '../db/models/matches.js';
import { PredictorsCollection } from '../db/models/predictors.js';

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

export const getMatchesWithPredictions = async (userId, league = 'WC2026') => {
  const matches = await MatchesCollection.aggregate([
    {
      $match: { league: league },
    },
    {
      $lookup: {
        from: 'predictors',
        let: { matchId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$matchId', '$$matchId'] },
                  { $eq: ['$userId', userId] },
                ],
              },
            },
          },
        ],
        as: 'userPrediction',
      },
    },
    {
      $addFields: {
        prediction: { $arrayElemAt: ['$userPrediction', 0] },
      },
    },
    {
      $lookup: {
        from: 'teams',
        localField: 'homeTeam',
        foreignField: '_id',
        as: 'homeTeam',
      },
    },
    { $unwind: '$homeTeam' },
    {
      $lookup: {
        from: 'teams',
        localField: 'awayTeam',
        foreignField: '_id',
        as: 'awayTeam',
      },
    },
    { $unwind: '$awayTeam' },
    {
      $sort: { kickoffTime: 1 },
    },
  ]);

  return matches;
};
