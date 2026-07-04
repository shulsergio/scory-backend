import { model, Schema } from 'mongoose';

const matchOverviewSchema = new Schema(
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
      Attendance: {
        value: Number,
      },
    },

    weather: {
      temperature: Number,
      description: String,
      windSpeed: Number,
    },

    content: {
      playerOfTheMatch: {
        id: Number,
        name: String,
        team: String,
        role: String,
        rating: String,
      },
      stats: [
        {
          title: { type: String },
          key: { type: String },

          stats: { type: [Schema.Types.Mixed] },

          format: String,
          type: { type: String },
          highlighted: { type: String },
        },
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

matchOverviewSchema.index({ fotmobId: 1 });

export const matchOverviewCollection = model(
  'matchoverviews',
  matchOverviewSchema,
);
