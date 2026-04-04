import { Router } from 'express';
import { getRankingController } from '../controllers/ranking';

const rankingRouter = Router();

rankingRouter.get('/:tournamentTag', getRankingController);
export default rankingRouter;
