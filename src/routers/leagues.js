import { Router } from 'express';
import {
  createLeagueController,
  getLeagueResultsController,
  getListOfAllLeaguesController,
  getUserLeaguesController,
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

// Получение списока лиг конкретного юзера
leaguesRouter.get(
  '/user-leagues',
  authenticate,
  ctrlWrapper(getUserLeaguesController),
);

// Получение результатов лиги
leaguesRouter.get(
  '/:leagueId',
  authenticate,
  ctrlWrapper(getLeagueResultsController),
);

// Получение списка всех лиг
leaguesRouter.get('/', ctrlWrapper(getListOfAllLeaguesController));

export default leaguesRouter;
