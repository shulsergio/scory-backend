import { Router } from 'express';
import authRouter from './auth.js';
import teamsRouter from './teams.js';
import groupsRouter from './groups.js';
import matchesRouter from './matches.js';
import leaguesRouter from './leagues.js';
import predictorsRouter from './predictors.js';
import rankingRouter from './ranking.js';
import usersRouter from './users.js';
import tournamentsRouter from './tournaments.js';

const indexRouter = Router();
console.log('***** CONSOLE - index - IS OK');

indexRouter.use('/auth', authRouter);
indexRouter.use('/teams', teamsRouter);
indexRouter.use('/groups', groupsRouter);
indexRouter.use('/matches', matchesRouter);
indexRouter.use('/leagues', leaguesRouter);
indexRouter.use('/predictors', predictorsRouter);
indexRouter.use('/ranking', rankingRouter);
indexRouter.use('/users', usersRouter);
indexRouter.use('/tournaments', tournamentsRouter);
export default indexRouter;
