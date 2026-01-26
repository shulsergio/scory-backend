import { LeagueCollection } from '../db/models/leagues.js';
import { MembershipCollection } from '../db/models/memberships.js';
import createHttpError from 'http-errors';

/**
 * --сервис для создания лиги--
 * @param {*} name -- название лиги
 * @param {*} adminId -- id администратора лиги
 * @returns -- новая лига
 */
export const createLeague = async (name, adminId) => {
  try {
    const newLeague = await LeagueCollection.create({
      name,
      adminId,
    });

    await MembershipCollection.create({
      leagueId: newLeague._id,
      userId: adminId,
      totalPoints: 0,
    });

    return newLeague;
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError(409, `Лига "${name}" уже существует`);
    }
    throw error;
  }
};

/**
 * --сервис для получения результатов группы--
 * @param {*} leagueId -- идентификатор группы
 * @returns
 */
export const getLeagueResults = async (leagueId) => {
  const league = await LeagueCollection.findById(leagueId);
  if (!league) {
    throw createHttpError(404, 'Лига не найдена');
  }

  const members = await MembershipCollection.find({ leagueId })
    .populate('userId', 'userNickname')
    .sort({ totalPoints: -1 });

  return {
    leagueName: league.name,
    leaderboard: members
      .filter((m) => m.userId)
      .map((m) => ({
        nickname: m.userId.userNickname,
        points: m.totalPoints,
        joinedAt: m.joinedAt,
      })),
  };
};
