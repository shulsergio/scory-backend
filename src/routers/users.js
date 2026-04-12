import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getUserProfileController } from '../controllers/users.js';

const usersRouter = Router();

usersRouter.get('/:userId', ctrlWrapper(getUserProfileController));

export default usersRouter;
