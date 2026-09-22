import mongoose from 'mongoose';
const { model, Schema } = mongoose;

// Обновленная схема события
const matchEventSchema = new Schema(
  {
    timeStr: Schema.Types.Mixed,
    name: String, // Имя игрока
    type: String, // Goal / Card
    card: String, // YellowRed / Red / null
    overloadTime: Schema.Types.Mixed,
    id: Number, // ID игрока
    slug: String, // Slug игрока (gabriel-veiga-1116734)
    newScore: [Number],
    ownGoal: Boolean,
    penShootoutScore: Schema.Types.Mixed,
    assistPlayerId: Number,
  },
  { _id: false },
);

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

    events: {
      home: { type: [matchEventSchema], default: [] },
      away: { type: [matchEventSchema], default: [] },
    },

    content: {
      playerOfTheMatch: {
        id: Number,
        name: String,
        slug: String,
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
      h2h: {
        summary: {
          type: [Number],
          default: [],
        },
      },
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
