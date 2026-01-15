//// LOGIN

import { UsersCollection } from '../db/models/users';
import { logoutUser } from '../service/auth';

export const loginUserController = async (req, res) => {
  const user = await UsersCollection.findOne({ userName: req.body.userName });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
};

//// LOGOUT

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
  res.status(204).send();
};
