import { Schema } from 'mongoose';

export const leagueTableRowSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, ref: 'Team' },
    fotmobId: { type: Number },
    name: { type: String, required: true },
    shortName: { type: String },
    pageUrl: { type: String },
    deduction: { type: Number, default: null },
    ongoing: { type: String, default: null },
    played: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    scoresStr: { type: String, default: '0-0' },
    goalConDiff: { type: Number, default: 0 },
    pts: { type: Number, default: 0 },
    idx: { type: Number, required: true },
    qualColor: { type: String },
  },
  { _id: false },
);
