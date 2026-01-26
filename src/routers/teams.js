import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getTeamByIdController } from '../controllers/teams.js';

const teamsRouter = Router();

teamsRouter.get('/:teamId', ctrlWrapper(getTeamByIdController));

export default teamsRouter;
