import createHttpError from 'http-errors';
import { PlayersCollection } from '../db/models/players.js';
import mongoose from 'mongoose';

export const getPlayersSitemapService = async () => {
  return await PlayersCollection.find(
    {},
    { slug: 1, fotmobId: 1, updatedAt: 1 },
  ).lean();
};

export const getPlayerByIdService = async (identifier) => {
  const isMongoId = mongoose.Types.ObjectId.isValid(identifier);
  const numericId = Number(identifier);

  const conditions = [
    { slug: identifier }, // 1. Ищем по слагу (lautaro-martinez-690230)
  ];

  if (isMongoId) {
    conditions.push({ _id: identifier }); // 2. Ищем по Mongo ObjectId
  }

  if (!isNaN(numericId)) {
    conditions.push({ fotmobId: numericId }); // 3. Ищем по  Id
  }

  const player = await PlayersCollection.findOne({ $or: conditions }).lean();

  if (!player) {
    throw createHttpError(404, 'Player not found');
  }

  return player;
};
