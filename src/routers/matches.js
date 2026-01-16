import { Router } from 'express';
import ctrlWrapper from '../utils/ctrlWrapper';
import { getAllMatchesController } from '../controllers/matches';

const matchesRouter = Router();

matchesRouter.post('/allmatches', ctrlWrapper(getAllMatchesController));
// matchesRouter.post('/', ctrlWrapper());
export default matchesRouter;
