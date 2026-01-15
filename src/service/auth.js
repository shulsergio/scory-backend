import { SessionsCollection } from '../db/models/session';

/// LOGOUT
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};
