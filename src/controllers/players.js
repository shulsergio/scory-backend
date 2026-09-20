import {
  getPlayerByIdService,
  getPlayersSitemapService,
} from '../service/players.js';

export const getPlayersSitemapController = async (req, res) => {
  try {
    const players = await getPlayersSitemapService();
    res.status(200).json({ status: 200, data: players });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlayerByIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const player = await getPlayerByIdService(id);

    res.status(200).json({
      status: 200,
      message: 'Player fetched successfully',
      data: player,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ message: error.message });
  }
};
