import { getPlayerByIdService } from '../service/players';

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
