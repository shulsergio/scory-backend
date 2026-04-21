import { model, Schema } from 'mongoose';

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
  },
  { timestamps: true },
);
export const TournamentsCollection = model('tournaments', tournamentsSchema);
