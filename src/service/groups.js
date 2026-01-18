import { randomBytes } from 'crypto';
import { GroupCollection } from '../db/models/groups';
import { MembershipCollection } from '../db/models/memberships';

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
