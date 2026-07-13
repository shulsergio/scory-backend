import { model, Schema } from 'mongoose';
import { leagueTableRowSchema } from './leagueTableRows.js';

const tournamentsSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logoUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'finished'],
      default: 'upcoming',
    },
    startDate: Date,
    endDate: Date,
    fotmobId: { type: Number, unique: true, sparse: true },
    table: [leagueTableRowSchema],
  },
  { timestamps: true },
);
export const TournamentsCollection = model('tournaments', tournamentsSchema);
