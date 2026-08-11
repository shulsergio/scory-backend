import createHttpError from 'http-errors';
import {
  createLeague,
  getLeagueResults,
  getUserLeagues,
  joinLeagueService,
  leaveLeagueService,
  updateLeagueDescriptionService,
} from '../service/leagues.js';
import { LeaguesCollection } from '../db/models/leagues.js';
import { LEAGUE_TYPES_CONFIG } from '../constants/index.js';
import { MatchesCollection } from '../db/models/matches.js';
import '../db/models/teams.js';
import '../db/models/tournaments.js';

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
  const { name, description, leagueType } = req.body;
  const adminId = req.user._id;

  if (!name || name.trim().length < 3) {
    throw createHttpError(400, 'min 3 characters');
  }

  if (!leagueType || !['TOP_LEAGUES', 'EUROCUPS'].includes(leagueType)) {
    throw createHttpError(400, 'Invalid league type');
  }

  const league = await createLeague({
    name: name.trim(),
    description: description?.trim(),
    leagueType,
    adminId,
  });

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

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  try {
    const results = await getLeagueResults(leagueId, page, limit);

    res.status(200).json(results);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
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
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Юзер не найден в req.user' });
    }

    const leagues = await getUserLeagues(userId);
    console.log('Final leagues data:', leagues);
    res.status(200).json({
      status: 200,
      message: 'Лиги пользователя успешно получены',
      data: leagues,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Сервер сломался!',
      details: error.message,
      stack: error.stack,
    });
  }
};

export const getListOfAllLeaguesController = async (req, res) => {
  const leagues = await LeaguesCollection.aggregate([
    {
      $lookup: {
        from: 'memberships',
        localField: '_id',
        foreignField: 'leagueId',
        as: 'members',
      },
    },
    {
      $project: {
        leagueId: '$_id',
        leagueName: '$name',
        leagueAvatar: '$avatarUrl',
        adminId: 1,
        membersCount: { $size: '$members' },
      },
    },
    { $sort: { membersCount: -1 } },
  ]);

  res.status(200).json({
    status: 200,
    message: 'Successfully fetched all leagues',
    data: leagues,
  });
};

export const joinLeagueController = async (req, res) => {
  const { leagueId } = req.params;
  const userId = req.user._id;

  const result = await joinLeagueService(leagueId, userId);

  res.status(201).json({
    status: 201,
    message: 'Successfully joined the league!',
    data: result,
  });
};

export const leaveLeagueController = async (req, res) => {
  const { leagueId } = req.params;
  const userId = req.user._id;

  const result = await leaveLeagueService(leagueId, userId);

  res.status(200).json({
    status: 200,
    message: 'Successfully left the league!',
    data: result,
  });
};

export const updateLeagueDescriptionController = async (req, res) => {
  const { leagueId } = req.params;
  const { description } = req.body;
  const userId = req.user._id;

  if (!userId) {
    return res.status(401).json({ message: 'User not found' });
  }

  const updatedLeague = await updateLeagueDescriptionService(
    leagueId,
    userId,
    description,
  );

  res.status(200).json({
    status: 200,
    message: 'Описание лиги успешно обновлено',
    data: {
      id: updatedLeague._id,
      description: updatedLeague.description,
    },
  });
};

export const getAvailableMatchesForAdminController = async (req, res) => {
  try {
    const { leagueId } = req.params;

    const league = await LeaguesCollection.findById(leagueId);

    if (!league) {
      return res.status(404).json({ message: 'Лига не найдена' });
    }

    if (league.adminId?.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    // 3. Расчет временного окна (от +1 суток до +7 суток)
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

    const rawIds =
      league.leagueType === 'TOP_LEAGUES'
        ? LEAGUE_TYPES_CONFIG.TOP_LEAGUES
        : LEAGUE_TYPES_CONFIG.EUROCUPS;
    const targetIds = (rawIds || []).flatMap((id) => [Number(id), String(id)]);

    const availableMatches = await MatchesCollection.find({
      tournamentFotmobId: { $in: targetIds },
      kickoffTime: { $gte: startDate, $lte: endDate },
      status: 'scheduled',
    })
      .populate('homeTeam awayTeam tournament')
      .sort({ kickoffTime: 1 });

    res.json({
      selectedMatches: league.selectedMatches || [],
      availableMatches,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

/**
 * --контроллер для сохранения выбранных админом матчей--
 * leagueId - идентификатор Лиги
 * selectedMatches - массив ID выбранных матчей из req.body
 */
export const updateSelectedMatchesController = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const { leagueId } = req.params;
    const { selectedMatches } = req.body;

    if (!Array.isArray(selectedMatches)) {
      return res
        .status(400)
        .json({ message: 'selectedMatches должен быть массивом' });
    }

    const league = await LeaguesCollection.findById(leagueId);

    if (!league) {
      return res.status(404).json({ message: 'Лига не найдена' });
    }

    if (league.adminId?.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    league.selectedMatches = selectedMatches;
    await league.save();

    res.status(200).json({
      status: 200,
      message: 'Список матчей успешно обновлен',
      data: league.selectedMatches,
    });
  } catch (error) {
    console.error('[UPDATE SELECTED MATCHES ERROR]:', error);
    res.status(500).json({ message: 'Ошибка сервера', details: error.message });
  }
};
