import { getRankingService } from '../service/ranking';

export const getRankingController = async (req, res) => {
  const { tournamentTag } = req.params;

  try {
    const top50 = await getRankingService(tournamentTag);

    if (!top50 || top50.length === 0) {
      return res.status(200).json({ message: 'Рейтинг пока пуст', data: [] });
    }

    res.status(200).json(top50);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
