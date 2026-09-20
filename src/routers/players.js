import { Router } from 'express';
import {
  getPlayerByIdController,
  getPlayersSitemapController,
} from '../controllers/players.js';

const playersRouter = Router();

playersRouter.get('/sitemap', getPlayersSitemapController);
playersRouter.get('/:id', getPlayerByIdController);

export default playersRouter;
