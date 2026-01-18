import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { createGroupController } from '../controllers/groups';

const authRouter = Router();

// Создание группы
authRouter.post(
  '/creategroup/',
  authenticate,
  ctrlWrapper(createGroupController),
);

export default authRouter;
