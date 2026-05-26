import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getUserProfileController,
  updateUserSettingsController,
} from '../controllers/users.js';
import { authenticate } from '../middleware/authenticate.js';

const usersRouter = Router();

usersRouter.get('/:userId', ctrlWrapper(getUserProfileController));
usersRouter.patch(
  '/settings',
  authenticate,
  ctrlWrapper(updateUserSettingsController),
);
export default usersRouter;
