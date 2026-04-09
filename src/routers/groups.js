import { getAllGroupsController } from '../controllers/groups.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { Router } from 'express';

const groupsRouter = Router();

groupsRouter.get('/:tournamentTag', ctrlWrapper(getAllGroupsController));

export default groupsRouter;
