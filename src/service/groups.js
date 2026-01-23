import { randomBytes } from 'crypto';
import { GroupCollection } from '../db/models/groups.js';
import { MembershipCollection } from '../db/models/memberships.js';

/**
 * --сервис для создания группы--
 * @param {*} name -- название группы
 * @param {*} adminId -- id администратора группы
 * @returns -- новая группа
 */
export const createGroup = async (name, adminId) => {
  const inviteCode = randomBytes(3).toString('hex').toUpperCase();
  const newGroup = await GroupCollection.create({
    name,
    adminId,
    inviteCode,
  });

  await MembershipCollection.create({
    groupId: newGroup._id,
    userId: adminId,
    totalPoints: 0,
  });

  return newGroup;
};

/**
 * --сервис для получения результатов группы--
 * @param {*} groupId -- идентификатор группы
 * @returns
 */
export const getGroupLeaderboard = async (groupId) => {
  const group = await GroupCollection.findById(groupId);
  if (!group) {
    throw new Error('Group not found');
  }
  const members = await MembershipCollection.find({ groupId })
    .populate('userId', 'userNickname')
    .sort({ totalPoints: -1 });

  return {
    groupName: group.name,
    inviteCode: group.inviteCode,
    leaderboard: members.map((m) => ({
      nickname: m.userId.userNickname,
      points: m.totalPoints,
      joinedAt: m.joinedAt,
    })),
  };
};
