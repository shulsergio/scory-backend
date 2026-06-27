import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getAllMatchesController,
  getMatchByIdController,
} from '../controllers/matches.js';
import {
  finishAndCalculateMatch,
  getPredictionMatchStatsController,
} from '../controllers/matchController.js';
import { getPlayoffMatchesController } from '../controllers/playoffController.js';

const matchesRouter = Router();

matchesRouter.get('/', ctrlWrapper(getAllMatchesController));
matchesRouter.get(
  '/tournament/:tournamentTag/playoff',
  ctrlWrapper(getPlayoffMatchesController),
);
matchesRouter.get('/:matchId', ctrlWrapper(getMatchByIdController));

matchesRouter.post('/calculate/:matchId', finishAndCalculateMatch);
matchesRouter.get(
  '/:matchId/prediction-stats',
  ctrlWrapper(getPredictionMatchStatsController),
);
export default matchesRouter;
