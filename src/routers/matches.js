import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getAllMatchesController } from '../controllers/matches.js';
import {
  finishAndCalculateMatch,
  getPredictionMatchStatsController,
} from '../controllers/matchController.js';

const matchesRouter = Router();

matchesRouter.get('/', ctrlWrapper(getAllMatchesController));
// matchesRouter.post('/', ctrlWrapper());

matchesRouter.post('/calculate/:matchId', finishAndCalculateMatch);
matchesRouter.get(
  '/:matchId/prediction-stats',
  ctrlWrapper(getPredictionMatchStatsController),
);
export default matchesRouter;
