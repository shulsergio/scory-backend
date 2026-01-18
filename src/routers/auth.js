import { Router } from 'express';
import {
  loginUserController,
  logoutUserController,
  registerUserController,
} from '../controllers/auth';
import ctrlWrapper from '../utils/ctrlWrapper';
import { authenticate } from '../middleware/authenticate';

const authRouter = Router();

authRouter.post('/register', ctrlWrapper(registerUserController));
authRouter.post('/login', ctrlWrapper(loginUserController));
authRouter.post('/logout', authenticate, ctrlWrapper(logoutUserController));
export default authRouter;
