import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getTournamentsController } from '../controllers/tournaments.js';

const tournamentsRouter = Router();

tournamentsRouter.get('/', ctrlWrapper(getTournamentsController));

export default tournamentsRouter;
