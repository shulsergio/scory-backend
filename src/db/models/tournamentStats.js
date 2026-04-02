import { model, Schema } from 'mongoose';

const TournamentStatsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    tournament: {
      type: String, // Например, 'WC2026'
      required: true,
      index: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    // Поля для будущих "фишек"
    prevRank: {
      type: Number,
      default: 0,
    },
    matchesPredicted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TournamentStatsSchema.index({ tournament: 1, points: -1 });

TournamentStatsSchema.index({ userId: 1, tournament: 1 }, { unique: true });

export const TournamentStatsCollection = model(
  'tournamentStats',
  TournamentStatsSchema,
);
