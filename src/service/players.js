import createHttpError from 'http-errors';
import { PlayersCollection } from '../db/models/players.js';

export const getPlayerByIdService = async (id) => {
  // Ищем либо по MongoDB _id, либо по fotmobId
  const player = await PlayersCollection.findOne({
    $or: [{ _id: id }, { fotmobId: Number(id) || 0 }],
  })
    .populate('team.id', 'name logoUrl')
    .lean();

  if (!player) {
    throw createHttpError(404, 'Player not found');
  }

  return player;
};
