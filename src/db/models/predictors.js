import { model, Schema } from 'mongoose';

const predictorsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'matches', required: true },

    homeGoals: { type: Number, required: true },
    awayGoals: { type: Number, required: true },
    predictedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

export const PredictorsCollection = model('predictors', predictorsSchema);
