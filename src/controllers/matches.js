import { MatchesCollection } from '../db/models/matches';

/**
 *--контроллер для получения всех матчей--
 * Получает все матчи из базы данных и возвращает их в ответе.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @export
 * @return {*}
 */
export const getAllMatchesController = async (req, res, next) => {
  try {
    const matches = await MatchesCollection.find({ league: 'WC2026' })
      .populate('homeTeam')
      .populate('awayTeam')
      .sort({ kickoffTime: 1 });
    res.status(200).json({
      status: 200,
      message: 'Matches successfully found!',
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};
