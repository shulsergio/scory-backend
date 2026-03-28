import { model, Schema } from 'mongoose';

const LeagueSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    tournament: {
      type: String,
      default: 'WC2026',
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    avatarUrl: {
      type: String,
      // default: 'league-avatar.png',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const LeaguesCollection = model('leagues', LeagueSchema);
