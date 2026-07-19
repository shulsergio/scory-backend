import { TournamentsCollection } from '../db/models/tournaments.js';
import { getAllTournaments } from '../service/tournaments.js';

export const getTournamentsController = async (req, res) => {
  try {
    const { tournamentTag } = req.params;

    const filter = { slug: tournamentTag };

    const tournaments = await getAllTournaments(filter);

    if (!tournaments || tournaments.length === 0) {
      return res.status(404).json({ message: 'Турнир не найден' });
    }

    // Возвращаем один найденный турнир
    return res.status(200).json(tournaments[0]);
  } catch (error) {
    console.error('Ошибка при получении турнира:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
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
