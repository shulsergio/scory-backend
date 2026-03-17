import createHttpError from 'http-errors';
import { upsertPrediction } from '../service/predictors';

export const upsertPredictionController = async (req, res) => {
  const userId = req.user._id;
  const { matchId, homeGoals, awayGoals } = req.body;

  if (homeGoals < 0 || awayGoals < 0) {
    throw createHttpError(400, 'No minus goals');
  }

  const result = await upsertPrediction({
    userId,
    matchId,
    homeGoals,
    awayGoals,
  });

  res.status(200).json({
    status: 200,
    message: 'Прогноз успешно сохранен!',
    data: result,
  });
};
