import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getTournamentsController,
  getTournamentsNameList,
} from '../controllers/tournaments.js';

const tournamentsRouter = Router();
tournamentsRouter.get('/list', ctrlWrapper(getTournamentsNameList));

tournamentsRouter.get('/:tournamentTag', ctrlWrapper(getTournamentsController));

export default tournamentsRouter;
