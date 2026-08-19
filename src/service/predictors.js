import createHttpError from 'http-errors';
import { MatchesCollection } from '../db/models/matches.js';
import { PredictorsCollection } from '../db/models/predictors.js';
import mongoose from 'mongoose';
import { LeaguesCollection } from '../db/models/leagues.js';
import { MembershipCollection } from '../db/models/memberships.js';

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

export const getMatchesWithPredictions = async (userId, leagueId) => {
  const targetUserId = new mongoose.Types.ObjectId(userId);
  let matchIdsToFetch = [];

  if (leagueId) {
    // 1. Если передана конкретная лига
    const leagueDoc = await LeaguesCollection.findById(leagueId).lean();
    if (leagueDoc && leagueDoc.selectedMatches) {
      matchIdsToFetch = leagueDoc.selectedMatches;
    }
  } else {
    // 💡 2. Если грузим ВСЕ прогнозы юзера во всех его лигах:

    // Шаг А: Ищем все членства пользователя
    const userMemberships = await MembershipCollection.find({
      userId: targetUserId,
    }).lean();

    const userLeagueIds = userMemberships.map((m) => m.leagueId);

    const userLeagues = await LeaguesCollection.find({
      $or: [{ _id: { $in: userLeagueIds } }, { adminId: targetUserId }],
    }).lean();

    const allSelected = userLeagues.flatMap((l) => l.selectedMatches || []);
    matchIdsToFetch = [...new Set(allSelected.map((id) => id.toString()))];
  }

  if (!matchIdsToFetch.length) {
    return [];
  }

  const targetMatchObjectIds = matchIdsToFetch.map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  const matches = await MatchesCollection.aggregate([
    {
      $match: {
        _id: { $in: targetMatchObjectIds },
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
                  { $eq: ['$userId', targetUserId] },
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
      $lookup: {
        from: 'tournaments',
        localField: 'tournament',
        foreignField: '_id',
        as: 'tournament',
      },
    },
    { $unwind: { path: '$tournament', preserveNullAndEmptyArrays: true } },
    {
      $sort: { kickoffTime: 1 },
    },
  ]);

  return matches;
};
