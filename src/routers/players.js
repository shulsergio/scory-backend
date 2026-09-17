import { Router } from 'express';
import { getPlayerByIdController } from '../controllers/players.js';

const playersRouter = Router();

playersRouter.get('/:id', getPlayerByIdController);

export default playersRouter;
