import createHttpError from 'http-errors';
import {
  getMatchesWithPredictions,
  upsertPrediction,
} from '../service/predictors.js';

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

export const getMatchesWithPredictionsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { league } = req.query;

    const matches = await getMatchesWithPredictions(userId, league);

    res.status(200).json({
      status: 200,
      message: 'Success',
      data: matches,
    });
  } catch (error) {
    console.error('Error in getMatchesWithPredictions:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};
