import { model, Schema } from 'mongoose';

const LeagueSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 25,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    leagueType: {
      type: String,
      enum: ['TOP_LEAGUES', 'EUROCUPS'],
      required: true,
      default: 'TOP_LEAGUES',
    },

    selectedMatches: [
      {
        type: Schema.Types.ObjectId,
        ref: 'matches',
      },
    ],

    tournament: {
      type: Schema.Types.ObjectId,
      ref: 'tournaments',
      required: false,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const LeaguesCollection = model('leagues', LeagueSchema);
