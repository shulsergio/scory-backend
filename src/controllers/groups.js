import NodeCache from 'node-cache';
import { getAllGroupsData } from '../service/groups.js';

const groupsCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

export const getAllGroupsController = async (req, res) => {
  const { tournamentTag } = req.params;

  const cacheKey = `groups_${tournamentTag}`;

  try {
    const cachedGroups = groupsCache.get(cacheKey);

    if (cachedGroups) {
      return res.status(200).json(cachedGroups);
    }

    const data = await getAllGroupsData(tournamentTag);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Данные групп не найдены' });
    }

    groupsCache.set(cacheKey, data);

    res.status(200).json(data);
  } catch (error) {
    console.error(
      `Ошибка в getAllGroupsController для турнира ${tournamentTag}:`,
      error,
    );
    res.status(500).json({ error: error.message });
  }
};
