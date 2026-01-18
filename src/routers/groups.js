import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import {
  createGroupController,
  getGroupResultsController,
} from '../controllers/groups';

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
