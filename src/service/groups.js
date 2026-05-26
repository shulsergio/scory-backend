import { GroupsCollection } from '../db/models/groups.js';

export const getAllGroupsData = async (tournamentTag) => {
  const standings = await GroupsCollection.find({ tournament: tournamentTag })
    .populate('team', 'name code flagCode')
    .lean();

  const grouped = standings.reduce((acc, curr) => {
    const letter = curr.group.toUpperCase();
    if (!acc[letter]) acc[letter] = [];

    acc[letter].push({
      ...curr,
      goalDifference: curr.goalsFor - curr.goalsAgainst,
    });
    return acc;
  }, {});

  Object.keys(grouped).forEach((letter) => {
    grouped[letter].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.goalsFor - a.goalsAgainst;
      const diffB = b.goalsFor - b.goalsAgainst;
      if (diffB !== diffA) return diffB - diffA;
      return b.goalsFor - a.goalsFor;
    });
  });

  return Object.keys(grouped)
    .sort()
    .map((letter) => ({
      letter,
      teams: grouped[letter],
    }));
};
