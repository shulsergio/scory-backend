//

import { TeamsCollection } from '../db/models/teams';

//
export const getTeamByIdController = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const team = await TeamsCollection.findById(teamId);

    // if (!team) {
    //   throw createHttpError(404, 'Team not found');
    // }

    res.status(200).json({
      status: 200,
      message: `Successfully found team: ${team.name}!`,
      data: team,
    });
  } catch (error) {
    next(error);
  }
};
