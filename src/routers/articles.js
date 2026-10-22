import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getAllArticlesBySlug,
  getArticleBySlugController,
  getArticlesByTeamController,
} from '../controllers/articles.js';

const articlesRouter = Router();

articlesRouter.get('/:slug', ctrlWrapper(getArticleBySlugController));
articlesRouter.get('/league/:slug', ctrlWrapper(getAllArticlesBySlug));
articlesRouter.get('/team/:teamId', ctrlWrapper(getArticlesByTeamController));
export default articlesRouter;
