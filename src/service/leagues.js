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
    adminId: league.adminId,
    leaderboard: members
      .filter((m) => m.userId)
      .map((m) => ({
        nickname: m.userId.userNickname,
        points: m.totalPoints,
        joinedAt: m.joinedAt,
      })),
  };
};

/**
 * --сервис для получения списка лиг конкретного юзера--
 * @param {*} userId -- идентификатор пользователя
 *
 * @returns -- список лиг, в которых состоит пользователь, с указанием его общего количества очков в каждой лиге
 */

export const getUserLeagues = async (userId) => {
  const memberships = await MembershipCollection.find({ userId })
    .populate('leagueId')
    .lean();

  if (!memberships || !Array.isArray(memberships)) return [];

  return memberships
    .filter((m) => {
      return m.leagueId && typeof m.leagueId === 'object' && m.leagueId._id;
    })
    .map((m) => ({
      leagueId: m.leagueId._id,
      leagueName: m.leagueId.name || 'Название не указано',
      leagueAvatar: m.leagueId.avatarUrl || null,
      totalPoints: m.totalPoints || 0,
      adminId: m.leagueId.adminId || null,
    }));
};

export const joinLeagueService = async (leagueId, userId) => {
  const league = await LeagueCollection.findById(leagueId);
  if (!league) {
    throw createHttpError(404, 'League not found');
  }
  const existingMembership = await MembershipCollection.findOne({
    leagueId,
    userId,
  });
  if (existingMembership) {
    throw createHttpError(400, 'You are already a member of this league');
  }
  const newMembership = await MembershipCollection.create({
    leagueId,
    userId,
    totalPoints: 0,
  });
  return newMembership;
};
