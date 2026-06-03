import { Router } from 'express';
import {
  forgotPasswordController,
  loginUserController,
  logoutUserController,
  registerUserController,
  resetPasswordController,
} from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middleware/authenticate.js';

const authRouter = Router();

authRouter.post('/register', ctrlWrapper(registerUserController));
authRouter.post('/login', ctrlWrapper(loginUserController));
authRouter.post('/logout', authenticate, ctrlWrapper(logoutUserController));
authRouter.post('/forgot-password', ctrlWrapper(forgotPasswordController));
authRouter.post('/reset-password', ctrlWrapper(resetPasswordController));

export default authRouter;
