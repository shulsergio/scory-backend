import createHttpError from 'http-errors';
import {
  createLeague,
  getLeagueResults,
  getUserLeagues,
} from '../service/leagues.js';

/**
 * --контроллер для создания группы--
 * создает новую группу с заданным именем и администратором.
 * name - название группы
 * adminId - id пользователя, создающего группу
 *
 * @param {*} req
 * @param {*} res
 * @export
 * @return {*}
 */
export const createLeagueController = async (req, res) => {
  const { name } = req.body;
  const adminId = req.user._id;
  if (!name) {
    throw createHttpError(409, 'Такая Лига уже существует');
  }

  const league = await createLeague(name, adminId);

  res.status(201).json({
    status: 201,
    message: 'Лига создана!',
    data: league,
  });
};

/**
 * --контроллер для получения результатов группы--
 * leagueId - идентификатор группы
 * @param {*} req
 * @param {*} res
 * @export
 * @return {*}
 */
export const getLeagueResultsController = async (req, res) => {
  const { leagueId } = req.params;

  const results = await getLeagueResults(leagueId);

  res.status(200).json({
    status: 200,
    message: 'Результаты лиги успешно получены',
    data: results,
  });
};

/**
 * --контроллер для получения списка лиг конкретного юзера--
 * userId - идентификатор пользователя
 * @param {*} req
 * @param {*} res
 * @export
 * @return {*}
 */
export const getUserLeaguesController = async (req, res) => {
  const userId = req.user._id;
  const leagues = await getUserLeagues(userId);
  res.status(200).json({
    status: 200,
    message: 'Лиги пользователя успешно получены',
    data: leagues,
  });
};
