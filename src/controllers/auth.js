// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

import geoip from 'geoip-lite';
import * as parser from 'ua-parser-js';

import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';

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
    const rawUserAgent = req.get('User-Agent'); // доставем браузер или мобайл ос
    // console.log('rawUserAgent:', rawUserAgent);
    const { UAParser } = parser;
    const ua = UAParser(rawUserAgent);
    console.log('Parser ua:', ua);

    const geo = geoip.lookup(rawIp); // доставем браузер или мобайл ос
    // { range: [ 3479298048, 3479300095 ],
    //   country: 'US',
    //   region: 'TX',
    //   eu: '0',
    //   timezone: 'America/Chicago',
    //   city: 'San Antonio',
    //   ll: [ 29.4969, -98.4032 ],
    //   metro: 641,
    //   area: 1000 }
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
      range: geo?.range || [],
      ll: geo?.range || [],
      country: geo?.country || 'Unknown',
      city: geo?.city || 'Unknown',
      area: geo?.area || 'Unknown',
      deviceType: ua.device.type || 'Unknown',
      os: ua.os.name || 'Unknown',
      browser: ua.browser.name || 'Unknown',
    });

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

const resend = new Resend(process.env.RESEND_API_KEY);
console.log(
  '🔥 ПРОВЕРКА КЛЮЧА RESEND:',
  process.env.RESEND_API_KEY ? 'КЛЮЧ ЕСТЬ' : 'КЛЮЧА НЕТ (UNDEFINED!)',
);

export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UsersCollection.findOne({ email });
    if (!user) {
      // Ради безопасности говорим, что всё ок, даже если юзера нет
      return res
        .status(200)
        .json({ message: 'Если email существует, письмо отправлено.' });
    }

    const resetToken = randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 час в мс
    await user.save();

    const resetUrl = `https://your-nextjs-front.com/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Восстановление пароля',
      html: `<p>Вы запросили сброс пароля. Перейдите по <a href="${resetUrl}">этой ссылке</a>, чтобы задать новый пароль. Ссылка действительна 1 час.</p>`,
    });

    res.status(200).json({ message: 'Письмо успешно отправлено.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
};

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await UsersCollection.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message:
          'Ссылка для сброса пароля недействительна или её срок действия истек.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res
      .status(200)
      .json({ message: 'Пароль успешно изменен. Теперь вы можете войти.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res
      .status(500)
      .json({ message: 'Ошибка на сервере при изменении пароля.' });
  }
};
