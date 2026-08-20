import mongoose from 'mongoose';
import { LeaguesCollection } from '../db/models/leagues.js';
import { MembershipCollection } from '../db/models/memberships.js';
import createHttpError from 'http-errors';

/**
 * --сервис для создания лиги--
 * @param {*} name -- название лиги
 * @param {*} description -- описание лиги
 * @param {*} leagueType -- тип лиги ('TOP_LEAGUES' | 'EUROCUPS')
 * @param {*} adminId -- id администратора лиги
 * @returns -- новая лига
 */
export const createLeague = async ({
  name,
  description,
  leagueType,
  adminId,
}) => {
  try {
    const newLeague = await LeaguesCollection.create({
      name,
      description,
      leagueType,
      adminId,
      members: [adminId],
    });

    await MembershipCollection.create({
      leagueId: newLeague._id,
      userId: adminId,
      totalPoints: 0,
    });

    return newLeague;
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError(409, `"${name}" already exists`);
    }
    throw error;
  }
};

/**
 * --сервис для получения результатов лиги и юзеров лиги--
 * @param {*} leagueId -- идентификатор лиги
 * @returns
 */
export const getLeagueResults = async (leagueId, page, limit) => {
  const league = await LeaguesCollection.findById(leagueId)
    .populate({
      path: 'selectedMatches',
      populate: { path: 'homeTeam awayTeam tournament' },
    })
    .lean();

  if (!league) {
    throw createHttpError(404, 'League not found');
  }

  const tournamentName =
    league.leagueType === 'EUROCUPS' ? 'European Cups' : 'Top Leagues';

  const skip = (page - 1) * limit;

  const [membersDocs, totalMembers] = await Promise.all([
    MembershipCollection.find({ leagueId })
      .populate('userId', 'userName userNickname country')
      .sort({ totalPoints: -1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MembershipCollection.countDocuments({ leagueId }),
  ]);

  const totalPages = Math.ceil(totalMembers / limit) || 1;

  const leaderboard = membersDocs
    .filter((m) => m.userId)
    .map((m, index) => ({
      id: m.userId._id,
      userName: m.userId.userName,
      nickname: m.userId.userNickname,
      points: m.totalPoints,
      predictionsCount: m.predictionsCount || 0,
      joinedAt: m.createdAt,
      rank: skip + index + 1,
      country: m.userId.country || null,
    }));

  return {
    id: league._id,
    leagueName: league.name,
    description: league.description || '',
    adminId: league.adminId,
    avatarUrl: league.avatarUrl || null,
    leagueType: league.leagueType || 'TOP_LEAGUES',
    tournamentName,
    selectedMatches: league.selectedMatches || [],

    leaderboard,
    pagination: {
      totalPlayers: totalMembers,
      totalPages,
      currentPage: page,
      limit,
    },
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
    .populate({
      path: 'leagueId',
      populate: {
        path: 'tournament',
        select: 'name slug',
      },
    })
    .lean();

  if (!memberships) return [];

  return memberships
    .filter((m) => m.leagueId && typeof m.leagueId === 'object')
    .map((m) => ({
      leagueId: m.leagueId._id,
      leagueName: m.leagueId.name || 'Название не указано',
      leagueAvatar: m.leagueId.avatarUrl || null,
      tournamentName: m.leagueId.tournament?.name || 'No tournament',
      tournamentSlug: m.leagueId.tournament?.slug || null,
      totalPoints: m.totalPoints || 0,
      adminId: m.leagueId.adminId || null,
    }));
};

export const joinLeagueService = async (leagueId, userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const leagueObjectId = new mongoose.Types.ObjectId(leagueId);

  const league = await LeaguesCollection.findById(leagueObjectId);
  if (!league) {
    throw createHttpError(404, 'League not found');
  }

  const existingMembership = await MembershipCollection.findOne({
    leagueId: leagueObjectId,
    userId: userObjectId,
  });

  if (existingMembership) {
    throw createHttpError(400, 'You are already a member of this league');
  }

  const newMembership = await MembershipCollection.create({
    leagueId: leagueObjectId,
    userId: userObjectId,
    totalPoints: 0,
  });

  await LeaguesCollection.findByIdAndUpdate(leagueObjectId, {
    $addToSet: { members: userObjectId },
  });

  return newMembership;
};

export const leaveLeagueService = async (leagueId, userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const leagueObjectId = new mongoose.Types.ObjectId(leagueId);

  const league = await LeaguesCollection.findById(leagueObjectId);

  if (!league) throw createHttpError(404, 'League not found');

  if (league.adminId.toString() === userId.toString()) {
    throw createHttpError(
      400,
      'Admins cannot leave. Delete the league to proceed.',
    );
  }

  const result = await MembershipCollection.findOneAndDelete({
    leagueId: leagueObjectId,
    userId: userObjectId,
  });

  if (!result) {
    throw createHttpError(400, 'You are not a member of this league');
  }

  await LeaguesCollection.findByIdAndUpdate(leagueObjectId, {
    $pull: { members: userObjectId },
  });

  return { message: 'Success' };
};

export const updateLeagueDescriptionService = async (
  leagueId,
  userId,
  description,
) => {
  const league = await LeaguesCollection.findById(leagueId);
  if (!league) throw createHttpError(404, 'League not found');
  if (league.adminId.toString() !== userId.toString()) {
    throw createHttpError(
      403,
      'Only the league admin can update the description',
    );
  }
  league.description = description || '';
  await league.save();
  return league;
};
