import { getAllTournaments } from '../service/tournaments.js';

export const getTournamentsController = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const tournaments = await getAllTournaments(filter);

  res.json({
    status: 200,
    message: 'Турниры успешно получены',
    data: tournaments,
  });
};
