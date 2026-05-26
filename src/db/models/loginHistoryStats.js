import { Schema, model } from 'mongoose';

const loginHistoryStatsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    userNickname: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    // Геолокация по IP
    country: {
      type: String,
      default: 'Unknown',
    },
    city: {
      type: String,
      default: 'Unknown',
    },

    deviceType: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

export const LoginHistoryStatsCollection = model(
  'login_history_stats',
  loginHistoryStatsSchema,
);
