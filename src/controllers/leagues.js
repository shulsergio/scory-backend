import createHttpError from 'http-errors';
import {
  createLeague,
  getLeagueResults,
  getUserLeagues,
} from '../service/leagues.js';

/**
 * --контроллер для создания Лиги--
 * создает новую Лигу с заданным именем и администратором.
 * name - название Лиги
 * adminId - id пользователя, создающего Лигу
 *
 * @param {*} req
 * @param {*} res
 * @export
 * @return {*}
 */
export const createLeagueController = async (req, res) => {
  const { name } = req.body;
  const adminId = req.user._id;
  if (!name || name.trim() === '') {
    throw createHttpError(400, 'Название лиги не может быть пустым');
  }

  const league = await createLeague(name, adminId);

  res.status(201).json({
    status: 201,
    message: 'Лига создана!',
    data: league,
  });
};

/**
 * --контроллер для получения результатов Лиги--
 * leagueId - идентификатор Лиги
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
 
  if (!req.user || !req.user._id) {
    console.log('USER FROM REQ req.user:', req.user);
        console.log('USER FROM REQ req.user._id:', req.user._id);
    console.error('ОШИБКА: req.user не определен в контроллере!');
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }

  const userId = req.user._id;
  console.log('USER FROM REQ:', req.user);
  const leagues = await getUserLeagues(userId);
  res.status(200).json({
    status: 200,
    message: 'Лиги пользователя успешно получены',
    data: leagues,
  });
};;
