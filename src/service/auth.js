import { SessionsCollection } from '../db/models/session';
import { UsersCollection } from '../db/models/users';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_TIME } from '../constants';

/**
 * --сервис для регистрации пользователя--
 * Проверяет наличие пользователя с таким же никнеймом или email
 * payload - данные для регистрации пользователя
 * @param {*} payload --данные для регистрации пользователя
 * @returns -- новый пользователь
 */
export const registerUser = async (payload) => {
  const existingUser = await UsersCollection.findOne({
    $or: [{ userNickname: payload.userNickname }, { email: payload.email }],
  });

  if (existingUser) {
    if (existingUser.userNickname === payload.userNickname) {
      throw createHttpError(409, 'Nickname already in use');
    }
    throw createHttpError(409, 'Email already in use');
  }
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const newUser = new UsersCollection({
    userName: payload.userName,
    userNickname: payload.userNickname,
    email: payload.email,
    password: hashedPassword,
  });
  return newUser;
};

/**
 * --сервис для логина пользователя--
 * @param {*} payload --данные для логина пользователя
 * @param {*} metadata -- информация о запросе (ip, userAgent)
 * @returns -- сессия пользователя
 */
export const loginUser = async (payload, metadata) => {
  const user = await UsersCollection.findOne({
    userNickname: payload.userNickname,
  });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_TIME),
    refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_TIME),
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  });
};

/**
 * --сервис для логаута пользователя--
 * @param {*} sessionId -- id сессии пользователя
 */
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};
