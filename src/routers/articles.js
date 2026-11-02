import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getAllArticlesBySlug,
  getArticleBySlugController,
  getArticlesByPlayerController,
  getArticlesByTeamController,
  getArticlesByMatchController,
  getArticlesSitemapController,
} from '../controllers/articles.js';

const articlesRouter = Router();

articlesRouter.get('/sitemap', ctrlWrapper(getArticlesSitemapController));
articlesRouter.get('/:slug', ctrlWrapper(getArticleBySlugController));
articlesRouter.get('/league/:slug', ctrlWrapper(getAllArticlesBySlug));
articlesRouter.get('/team/:teamId', ctrlWrapper(getArticlesByTeamController));
articlesRouter.get(
  '/player/:playerId',
  ctrlWrapper(getArticlesByPlayerController),
);
articlesRouter.get(
  '/match/:matchID',
  ctrlWrapper(getArticlesByMatchController),
);

export default articlesRouter;
