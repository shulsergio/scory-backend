import { Router } from 'express';
import authRouter from './auth';

const indexRouter = Router();
console.log('***** CONSOLE - index - IS OK');

indexRouter.use('/auth', authRouter);
export default indexRouter;
