// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

import geoip from 'geoip-lite';
import * as parser from 'ua-parser-js';

import { REFRESH_TOKEN_TIME } from '../constants/index.js';
import { LoginHistoryStatsCollection } from '../db/models/loginHistoryStats.js';
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
    const rawIp = req.ip;
    const rawUserAgent = req.get('User-Agent');

    // 1. Парсим User-Agent (устройство, ОС, браузер)
    const { UAParser } = parser;
    const ua = UAParser(rawUserAgent);

    // 2. Определяем геопозицию по IP

    const geo = geoip.lookup(rawIp);

    const metadata = {
      ip: rawIp,
      userAgent: rawUserAgent,
    };

    const session = await loginUser(req.body, metadata);

    const updatedUser = await UsersCollection.findByIdAndUpdate(
      session.userId,
      { lastVisit: new Date() },
      { new: true },
    );

    await LoginHistoryStatsCollection.create({
      userId: updatedUser._id,
      userNickname: updatedUser.userNickname,
      ip: rawIp,
      country: geo?.country || 'Unknown',
      city: geo?.city || 'Unknown',
      deviceType: ua.device.type || 'desktop', // если девайс пустой, ua-parser считает это ПК
      os: ua.os.name || 'Unknown',
      browser: ua.browser.name || 'Unknown',
    });

    // Твой стандартный код кук
    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + REFRESH_TOKEN_TIME),
    });

    res.cookie('sessionId', session._id, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + REFRESH_TOKEN_TIME),
    });

    // Отправляем ответ на фронтенд
    res.status(200).json({
      status: 200,
      message: 'Successfully logged in!',
      data: {
        accessToken: session.accessToken,
        user: {
          id: updatedUser._id,
          nickname: updatedUser.userNickname,
          userName: updatedUser.userName,
          country: updatedUser.country || '',
          points: updatedUser.points || 0,
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
