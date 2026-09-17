import { Router } from 'express';
import { getPlayerByIdController } from '../controllers/players';

const playersRouter = Router();

playersRouter.get('/:id', getPlayerByIdController);
