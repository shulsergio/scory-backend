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
      type: Schema.Types.ObjectId,
      ref: 'tournaments',
      required: true,
      index: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    // Позволит рисовать стрелочки ↑ ↓ (поднялся/упал в рейтинге)
    prevRank: {
      type: Number,
      default: 0,
    },
    matchesPredicted: {
      type: Number,
      default: 0,
    },
    exactScores: {
      type: Number,
      default: 0, // Сколько раз угадал ТОЧНЫЙ счет
    },
    correctOutcomes: {
      type: Number,
      default: 0, // Сколько раз угадал только исход (П1, Х, П2)
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
