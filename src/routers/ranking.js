import { Router } from 'express';
import { getRankingController } from '../controllers/ranking.js';

const rankingRouter = Router();

rankingRouter.get('/:tournamentTag', getRankingController);
export default rankingRouter;
