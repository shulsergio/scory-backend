import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getAllMatchesController } from '../controllers/matches.js';

const matchesRouter = Router();

matchesRouter.get('/matches', ctrlWrapper(getAllMatchesController));
// matchesRouter.post('/', ctrlWrapper());
export default matchesRouter;
