import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { getTeamByIdController } from '../controllers/teams';

const teamsRouter = Router();

teamsRouter.get('/:teamId', ctrlWrapper(getTeamByIdController));

export default teamsRouter;
