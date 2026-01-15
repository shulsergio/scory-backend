import { model, Schema } from 'mongoose';

const matchesSchema = new Schema(
  {
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    homeTeamFlag: { type: String, required: true },
    awayTeamFlag: { type: String, required: true },
    dataAt: { type: Date, required: true },
    stadion: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'finished'],
      default: 'scheduled',
    },
    resultHomeGoals: { type: Number, default: 0 },
    resultAwayGoals: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export const MatchesCollection = model('matches', matchesSchema);
