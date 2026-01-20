import { model, Schema } from 'mongoose';

const teamsSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    logoUrl: { type: String },
    league: {
      type: String,
      enum: ['WC2026'],
      required: true,
    },
    country: { type: String },
  },
  { timestamps: true, versionKey: false },
);

export const TeamsCollection = model('teams', teamsSchema);
