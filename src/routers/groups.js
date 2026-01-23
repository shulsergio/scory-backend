import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  createGroupController,
  getGroupResultsController,
} from '../controllers/groups.js';

const groupRouter = Router();

// Создание группы
groupRouter.post(
  '/creategroup/',
  authenticate,
  ctrlWrapper(createGroupController),
);
// Получение результатов группы
groupRouter.get(
  '/:groupId',
  authenticate,
  ctrlWrapper(getGroupResultsController),
);

export default groupRouter;
