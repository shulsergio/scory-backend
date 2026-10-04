import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getArticleBySlugController } from '../controllers/articles.js';

const articlesRouter = Router();

articlesRouter.get('/:slug', ctrlWrapper(getArticleBySlugController));

export default articlesRouter;
