import { getAllGroupsData } from '../service/groups.js';

export const getAllGroupsController = async (req, res) => {
  const { tournamentTag } = req.params;

  try {
    const data = await getAllGroupsData(tournamentTag);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Данные групп не найдены' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
