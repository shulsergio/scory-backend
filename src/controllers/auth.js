// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { REFRESH_TOKEN_TIME } from '../constants.js';
import { UsersCollection } from '../db/models/users.js';
import { loginUser, logoutUser, registerUser } from '../service/auth.js';

/**
 * --контроллер для регистрации пользователя--
 * payload - приходящие данные для регистрации пользователя
 * registerUser - сервис для регистрации пользователя
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @export
 * @return {*}
 */
export const registerUserController = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      status: 201,
      message: 'User created!',
      data: {
        id: user._id,
        nickname: user.userNickname,
        email: user.email,
        points: user.points,
      },
    });
  } catch (error) {
    console.error('Error in registerUserController:', error);
    next(error);
  }
};

/**
 * --контроллер для логина пользователя--
 * userNickname - никнейм пользователя
 * metadata - информация о запросе (ip, userAgent)
 * loginUser - сервис для логина пользователя
 * @param {*} req
 * @param {*} res
 * @export
 * @return {*}
 */
export const loginUserController = async (req, res, next) => {
  try {
    const { userNickname } = req.body;  

    const metadata = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };
 
    const user = await UsersCollection.findOne({ userNickname });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
      });
    }
  const session = await loginUser(req.body, metadata);
 
    const updatedUser = await UsersCollection.findByIdAndUpdate(
      user._id,
      { lastVisit: new Date() },
      { new: true },
    );

 
    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  
      expires: new Date(Date.now() + REFRESH_TOKEN_TIME),
    });

    res.cookie('sessionId', session._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + REFRESH_TOKEN_TIME),
    });
 
    res.status(200).json({
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
  } catch (error) { 
    console.error('Login error:', error.message);
    next(error);
  }
};

/**
 * --контроллер для логаута пользователя--
 * получает из куки id сессии пользователя и идет в logoutUser
 * sessionId - id сессии пользователя из куки
 * logoutUser - сервис для логаута пользователя
 * @param {*} req
 * @param {*} res
 */
export const logoutUserController = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await logoutUser(sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};
