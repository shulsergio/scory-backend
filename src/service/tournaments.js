import { TournamentsCollection } from '../db/models/tournaments.js';

export const getAllTournaments = async (filter = {}) => {
  return await TournamentsCollection.find(filter).lean();
};
