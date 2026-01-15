import { Router } from 'express';
import { loginUserController, logoutUserController } from '../controllers/auth';
import ctrlWrapper from '../utils/ctrlWrapper';

const authRouter = Router();

authRouter.post('/login', ctrlWrapper(loginUserController));
authRouter.post('/logout', ctrlWrapper(logoutUserController));
export default authRouter;
