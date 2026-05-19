import createHttpError from 'http-errors';
import { MatchesCollection } from '../db/models/matches.js';
import { PredictorsCollection } from '../db/models/predictors.js';
import { TournamentsCollection } from '../db/models/tournaments.js';

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
  const tournamentDoc = await TournamentsCollection.findOne({
    slug: league,
  }).lean();

  console.log('league (строка с фронта):', league);
  console.log('Найденный документ турнира:', tournamentDoc);

  if (!tournamentDoc) {
    console.log(`--- Турнир ${league} не найден ---`);
    return [];
  }

  const testMatch = await MatchesCollection.findOne({
    tournament: tournamentDoc._id,
  }).lean();
  console.log('2. Тестовый матч по ObjectId турнира:', testMatch);

  const testStringMatch = await MatchesCollection.findOne({
    tournament: league,
  }).lean();
  console.log('3. Тестовый матч по строке турнира:', testStringMatch);

  const matches = await MatchesCollection.aggregate([
    {
      $match: {
        tournament: tournamentDoc._id,
      },
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
