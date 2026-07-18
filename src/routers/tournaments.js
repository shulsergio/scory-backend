import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getTournamentsController,
  getTournamentsNameList,
} from '../controllers/tournaments.js';

const tournamentsRouter = Router();

tournamentsRouter.get('/', ctrlWrapper(getTournamentsController));
tournamentsRouter.get('/list', ctrlWrapper(getTournamentsNameList));

export default tournamentsRouter;
