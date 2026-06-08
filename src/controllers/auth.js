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
const resend = new Resend(process.env.RESEND_API_KEY);
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
    // 1. Регистрируем пользователя в MongoDB
    const user = await registerUser(req.body);

    try {
      await resend.emails.send({
        from: 'Welcome <info@scory.com.ua>', // МОЯ ПОЧТА
        to: user.email,
        subject: 'Welcome to Scory!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
            <h2 style="color: #333;">Hello, ${user.userNickname}! </h2>
            <p style="font-size: 16px; color: #555; line-height: 1.5;">
              Your account has been created successfully. Login: <strong>${user.userNickname}</strong><br/>
            </p>
            <p style="font-size: 14px; color: #777;">
              If you did not register on our project, please ignore this email.
            </p>

            <p style="font-size: 12px; color: #999; text-align: center;">
              Best regards, The Scory Team.
            </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 16px; color: #555; line-height: 1.5;">
              Привіт, <strong> ${user.userNickname}!</strong>
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.5;">
              Твій аккаунт успішно створено. Твій логін на сайті: ${user.userNickname}
            </p>
            <p style="font-size: 14px; color: #777;">
              Якщо ти не реєструвався на нашому проекті, просто проігноруй цей лист.
            </p>

            <p style="font-size: 12px; color: #999; text-align: center;">
              Best regards, The Scory Team.
            </p>

          </div>
        `,
      });
      // console.log(`отправлено на ${user.email}`);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    // 3. Возвращаем успешный ответ фронтенду
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

    if (error.status === 409 || error.statusCode === 409) {
      return res.status(409).json({
        status: 409,
        message: error.message,
      });
    }

    if (error.code === 11000 && error.keyValue) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const isEmail = duplicateField === 'email';

      return res.status(409).json({
        status: 409,
        message: isEmail ? 'Email already in use' : 'Nickname already in use',
      });
    }

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

export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UsersCollection.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: 'Если email существует, письмо отправлено.' });
    }

    const resetToken = randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    //  ЛОКАЛЛЛЛ

    const resetUrl = `https://scory.com.ua/reset-password?token=${resetToken}`;

    //  ЛОКАЛЛЛЛ

    await resend.emails.send({
      from: 'info@scory.com.ua',
      to: user.email,
      subject: 'Password recovery',
      html: `
       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
         
      
      <p>Password reset procedure. Click <a href="${resetUrl}">here</a> to set a new password. The link is valid for 1 hour.<br/> Перейдіть за <a href="${resetUrl}">цим посиланням</a>, щоб задати новий пароль. Посилання дійсне 1 годину. </p>
      </div>`,
    });

    res.status(200).json({ message: 'OK.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
};

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await UsersCollection.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'The password reset link is invalid or has expired.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: 'DONE' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'ERROR' });
  }
};
