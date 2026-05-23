import { getRankingService } from '../service/ranking.js';

export const getRankingController = async (req, res) => {
  const { tournamentTag } = req.params;

  //  ?page=1&limit=15)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;

  try {
    const result = await getRankingService(tournamentTag, page, limit);

    if (!result || result.data.length === 0) {
      return res.status(200).json({
        pagination: {
          totalPlayers: 0,
          totalPages: 1,
          currentPage: page,
          limit,
        },
        data: [],
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
