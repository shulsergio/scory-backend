import { model, Schema } from 'mongoose';

const matchPreviewsSchema = new Schema(
  {
    fotmobId: { type: String, required: true, unique: true },
    matchName: String,
    leagueName: String,
    leagueRoundName: String,

    infoBox: {
      Stadium: {
        name: String,
        city: String,
        country: String,
        capacity: Number,
      },
      Referee: {
        name: String,
        country: String,
      },
    },

    weather: {
      temperature: Number,
      description: String,
      windSpeed: Number,
    },

    headToHead: {
      summary: [Number], // Массив типа [1, 1, 0]
      matches: [
        {
          date: String,
          home: String,
          away: String,
          score: String,
        },
      ],
    },
  },
  { timestamps: true },
);
export const matchPreviewsCollection = model(
  'matchpreviews',
  matchPreviewsSchema,
);
