import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const articlesRouter = Router();

articlesRouter.get('/:articleId', ctrlWrapper(getArticleByIdController));

export default articlesRouter;
