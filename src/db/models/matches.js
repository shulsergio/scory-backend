import { model, Schema } from 'mongoose';

const matchesSchema = new Schema(
  {
    matchNumber: {
      type: Number,
      required: true,
    },

    homeTeam: {
      type: Schema.Types.ObjectId,
      ref: 'teams',
      required: true,
    },
    awayTeam: {
      type: Schema.Types.ObjectId,
      ref: 'teams',
      required: true,
    },

    kickoffTime: {
      type: Date,
      required: true,
    },
    lockTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['scheduled', 'finished'],
      default: 'scheduled',
    },

    score: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 },
    },

    group: {
      type: String,
      required: true,
    },
    league: {
      type: String,
      required: true,
      default: 'WC2026',
    },

    stadium: {
      type: String,
    },

    isCalculated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

matchesSchema.index({ league: 1, status: 1 });
export const MatchesCollection = model('matches', matchesSchema);
