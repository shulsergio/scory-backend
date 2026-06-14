import { PredictorsCollection } from '../db/models/predictors.js';

import { ObjectId } from 'mongodb';

export const calculatePoints = (pHome, pAway, rHome, rAway) => {
  let basePoints = 0;

  const isExactScore = pHome === rHome && pAway === rAway;
  const isCorrectDifference = pHome - pAway === rHome - rAway;
  const isCorrectOutcome =
    Math.sign(pHome - pAway) === Math.sign(rHome - rAway);

  // схема начіслений!!!
  if (isExactScore) {
    basePoints = 5;
  } else if (isCorrectOutcome && isCorrectDifference) {
    basePoints = 3; // Включая ничьи (1:1 при 2:2)
  } else if (isCorrectOutcome) {
    basePoints = 2;
  }
  //  БЛНУС
  const isTotalCorrect = pHome + pAway === rHome + rAway;
  const totalBonus = isTotalCorrect ? 1 : 0;
  const points = basePoints + totalBonus;
  return points;
};

export const getPredictionMatchStatsService = async (matchId) => {
  try {
    const stats = await PredictorsCollection.aggregate([
      {
        $match: {
          matchId: new ObjectId(matchId),
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          homeWins: [
            { $match: { $expr: { $gt: ['$homeGoals', '$awayGoals'] } } },
            { $count: 'count' },
          ],
          draws: [
            { $match: { $expr: { $eq: ['$homeGoals', '$awayGoals'] } } },
            { $count: 'count' },
          ],
          awayWins: [
            { $match: { $expr: { $lt: ['$homeGoals', '$awayGoals'] } } },
            { $count: 'count' },
          ],
        },
      },
      {
        $project: {
          total: { $arrayElemAt: ['$totalCount.count', 0] },
          home: { $arrayElemAt: ['$homeWins.count', 0] },
          draw: { $arrayElemAt: ['$draws.count', 0] },
          away: { $arrayElemAt: ['$awayWins.count', 0] },
        },
      },
    ]);

    if (!stats || stats.length === 0 || !stats[0].total) {
      return {
        totalPredictions: 0,
        percentages: { home: 0, draw: 0, away: 0 },
      };
    }

    const { total, home = 0, draw = 0, away = 0 } = stats[0];

    const homePercent = Math.round((home / total) * 100);
    const drawPercent = Math.round((draw / total) * 100);
    const awayPercent = Math.round((away / total) * 100);

    return {
      totalPredictions: total,
      percentages: {
        home: homePercent, // % на П1
        draw: drawPercent, // % на Ничью
        away: awayPercent, // % на П2
      },
    };
  } catch (error) {
    console.error('error:', error);
    throw error;
  }
};
