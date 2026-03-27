import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getAllMatchesController } from '../controllers/matches.js';
import { finishAndCalculateMatch } from '../controllers/matchController.js';

const matchesRouter = Router();

matchesRouter.get('/', ctrlWrapper(getAllMatchesController));
// matchesRouter.post('/', ctrlWrapper());

matchesRouter.post('/calculate/:matchId', finishAndCalculateMatch);

export default matchesRouter;
