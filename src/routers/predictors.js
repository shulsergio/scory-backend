import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getMatchesWithPredictionsController,
  upsertPredictionController,
} from '../controllers/predictors.js';

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
