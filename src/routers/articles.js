import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getAllArticlesBySlug,
  getArticleBySlugController,
} from '../controllers/articles.js';

const articlesRouter = Router();

articlesRouter.get('/:slug', ctrlWrapper(getArticleBySlugController));
articlesRouter.get('/league/:slug?', ctrlWrapper(getAllArticlesBySlug));

export default articlesRouter;
