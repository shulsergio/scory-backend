import { model, Schema } from 'mongoose';

const LeagueSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

export const LeagueCollection = model('leagues', LeagueSchema);
