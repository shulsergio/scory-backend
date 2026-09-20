import createHttpError from 'http-errors';
import { PlayersCollection } from '../db/models/players.js';
import mongoose from 'mongoose';

export const getPlayersSitemapService = async () => {
  return await PlayersCollection.find(
    {},
    { slug: 1, fotmobId: 1, updatedAt: 1 },
  ).lean();
};

export const getPlayerByIdService = async (id) => {
  const isMongoId = mongoose.Types.ObjectId.isValid(id);
  const numericId = Number(id);

  const filter = isMongoId
    ? { _id: id }
    : { fotmobId: !isNaN(numericId) ? numericId : 0 };
  const player = await PlayersCollection.findOne(filter).lean();

  if (!player) {
    throw createHttpError(404, 'Player not found');
  }
  return player;
};
