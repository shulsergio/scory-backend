import { Router } from 'express';
import { getRankingController } from '../controllers/ranking';

const rankingRouter = Router();

rankingRouter.get('/ttlrank', getRankingController);
export default rankingRouter;
