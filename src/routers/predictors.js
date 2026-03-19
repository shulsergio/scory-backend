import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import {
  getMatchesWithPredictionsController,
  upsertPredictionController,
} from '../controllers/predictors';

const predictorsRouter = Router();

predictorsRouter.post(
  '/',
  authenticate,
  ctrlWrapper(upsertPredictionController),
);

predictorsRouter.get(
  '/my-predictions',
  authenticate,
  ctrlWrapper(getMatchesWithPredictionsController),
);

export default predictorsRouter;
