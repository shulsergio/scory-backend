import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { upsertPredictionController } from '../controllers/predictors';

const predictorsRouter = Router();

predictorsRouter.post(
  '/',
  authenticate,
  ctrlWrapper(upsertPredictionController),
);

export default predictorsRouter;
