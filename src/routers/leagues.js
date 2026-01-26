import { Router } from 'express';
import {
  createLeagueController,
  getLeagueResultsController,
} from '../controllers/leagues.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middleware/authenticate.js';

const leaguesRouter = Router();
// Создание лиги
leaguesRouter.post(
  '/createleague/',
  authenticate,
  ctrlWrapper(createLeagueController),
);
// Получение результатов лиги
leaguesRouter.get(
  '/:leagueId',
  authenticate,
  ctrlWrapper(getLeagueResultsController),
);

export default leaguesRouter;
