// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { REFRESH_TOKEN_TIME } from '../constants';
import { UsersCollection } from '../db/models/users';
import { loginUser, logoutUser } from '../service/auth';

//// LOGIN
export const loginUserController = async (req, res) => {
  const { userNickname } = req.body;
  const metadata = {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  };
  const user = await UsersCollection.findOne({ userNickname });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const session = await loginUser(req.bodу, metadata);
  console.log('!!!!!! session', session);

  const updatedUser = await UsersCollection.findByIdAndUpdate(
    user._id,
    { lastVisit: new Date() },
    { new: true },
  );

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + REFRESH_TOKEN_TIME),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + REFRESH_TOKEN_TIME),
  });

  res.json({
    status: 200,
    message: 'Successfully logged in!',
    data: {
      accessToken: session.accessToken,
      user: {
        id: updatedUser._id,
        nickname: updatedUser.userNickname,
        points: updatedUser.points,
      },
    },
  });
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
