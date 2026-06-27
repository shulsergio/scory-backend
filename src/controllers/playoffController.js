import createError from 'http-errors';
import { getPlayoffMatchesService } from '../service/playoffs.js';

export const getPlayoffMatchesController = async (req, res) => {
  const { tournamentTag } = req.params;

  const playoffMatches = await getPlayoffMatchesService(tournamentTag);

  if (playoffMatches === null) {
    throw createError(404, `Tournament with tag "${tournamentTag}" not found`);
  }

  res.status(200).json({
    status: 200,
    message: 'Playoff matches retrieved successfully',
    data: playoffMatches,
  });
};
