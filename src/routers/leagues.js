import { Router } from 'express';
import {
  createLeagueController,
  getAvailableMatchesForAdminController,
  getLeagueResultsController,
  getListOfAllLeaguesController,
  getUserLeaguesController,
  joinLeagueController,
  leaveLeagueController,
  updateLeagueDescriptionController,
  updateSelectedMatchesController,
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
// Получение списка всех лиг
leaguesRouter.get('/', ctrlWrapper(getListOfAllLeaguesController));

// Получение списока лиг конкретного юзера
leaguesRouter.get(
  '/user-leagues',
  authenticate,
  ctrlWrapper(getUserLeaguesController),
);

// Получение результатов лиги
leaguesRouter.get('/:leagueId', ctrlWrapper(getLeagueResultsController));

leaguesRouter.post(
  '/:leagueId/join',
  authenticate,
  ctrlWrapper(joinLeagueController),
);

leaguesRouter.delete(
  '/:leagueId/leave',
  authenticate,
  ctrlWrapper(leaveLeagueController),
);

leaguesRouter.patch(
  '/:leagueId',
  authenticate,
  ctrlWrapper(updateLeagueDescriptionController),
);

leaguesRouter.get(
  '/:leagueId/admin/available-matches',
  authenticate,
  ctrlWrapper(getAvailableMatchesForAdminController),
);

leaguesRouter.post(
  '/:leagueId/select-matches',
  authenticate,
  ctrlWrapper(updateSelectedMatchesController),
);

export default leaguesRouter;
