import { TournamentsCollection } from '../db/models/tournaments.js';
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

export const getTournamentsNameList = async (req, res) => {
  try {
    const tournaments = await TournamentsCollection.find({
      status: { $in: ['upcoming', 'active'] },
    })
      .select('name slug logoUrl')
      .lean();

    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
