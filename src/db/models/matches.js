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
    },
    tournament: {
      type: Schema.Types.ObjectId,
      ref: 'tournaments',
      required: true,
    },

    stadium: {
      type: String,
    },

    isCalculated: {
      type: Boolean,
      default: false,
    },

    isPlayoff: { type: Boolean, default: false },
    stage: {
      type: String,
      enum: ['1/32', '1/16', '1/8', '1/4', '1/2', 'final', null],
      default: null,
    },
    penaltiesScore: {
      home: { type: Number },
      away: { type: Number },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

matchesSchema.index({ tournament: 1, status: 1 });
export const MatchesCollection = model('matches', matchesSchema);
