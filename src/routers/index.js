import { Router } from 'express';
import authRouter from './auth.js';
import teamsRouter from './teams.js';
import matchesRouter from './matches.js';
import leaguesRouter from './leagues.js';

const indexRouter = Router();
console.log('***** CONSOLE - index - IS OK');

indexRouter.use('/auth', authRouter);
indexRouter.use('/teams', teamsRouter);
indexRouter.use('/matches', matchesRouter);
indexRouter.use('/leagues', leaguesRouter);
export default indexRouter;
