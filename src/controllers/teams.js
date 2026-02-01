//

import { MatchesCollection } from '../db/models/matches.js';
import { TeamsCollection } from '../db/models/teams.js';

//
export const getTeamByIdController = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await TeamsCollection.findById(teamId);

    if (!team) {
      return res.status(404).json({
        status: 404,
        message: 'Team not found',
      });
    }

    const matches = await MatchesCollection.find({
      $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
    })
      .populate('homeTeam awayTeam')
      .sort({ kickoffTime: 1 });

    const teamWithMatches = {
      ...team.toObject(),
      matches: matches,
    };

    res.status(200).json({
      status: 200,
      message: `Successfully found team: ${team.name} with ${matches.length} matches!`,
      data: teamWithMatches,
    });
  } catch (error) {
    next(error);
  }
};
