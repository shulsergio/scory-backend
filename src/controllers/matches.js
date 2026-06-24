import createHttpError from 'http-errors';
import { MatchesCollection } from '../db/models/matches.js';
import NodeCache from 'node-cache';
import { getMatchByIdData } from '../service/matches.js';
/**
 *--контроллер для получения всех матчей--
 * Получает все матчи из базы данных и возвращает их в ответе.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @export
 * @return {*}
 */

const myCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

export const getAllMatchesController = async (req, res) => {
  const { tournamentId } = req.query;

  const cacheKey = tournamentId ? `matches_${tournamentId}` : 'matches_all';

  try {
    const cachedMatches = myCache.get(cacheKey);

    if (cachedMatches) {
      return res.status(200).json({
        status: 200,
        message: 'Matches successfully found (from cache)!',
        data: cachedMatches,
      });
    }

    const filter = {};
    if (tournamentId) {
      filter.tournament = tournamentId;
    }

    const matches = await MatchesCollection.find(filter)
      .populate('homeTeam')
      .populate('awayTeam')
      .sort({ kickoffTime: 1 })
      .lean();

    myCache.set(cacheKey, matches);

    res.status(200).json({
      status: 200,
      message: 'Matches successfully found!',
      data: matches,
    });
  } catch (error) {
    console.error('Ошибка в getAllMatchesController:', error);
    res.status(500).json({
      status: 500,
      error: 'Внутренняя ошибка сервера при получении матчей.',
    });
  }
};

export const getMatchByIdController = async (req, res) => {
  const { matchId } = req.params;

  const match = await getMatchByIdData(matchId);

  if (!match) {
    throw createHttpError(404, `Match with ID ${matchId} not found`);
  }

  res.status(200).json({
    status: 200,
    message: 'Match details successfully retrieved!',
    data: match,
  });
};
