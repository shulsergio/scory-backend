import { Schema, model } from 'mongoose';

// Схема игрока в составе с новыми деталями
const playerSchema = new Schema(
  {
    id: { type: Number },
    name: { type: String },
    shirtNumber: { type: Number },
    age: { type: Number },
    dateOfBirth: { type: String },
    ccode: { type: String },
    cname: { type: String },
  },
  { _id: false },
);

// Схема линии состава
const squadLineSchema = new Schema(
  {
    title: { type: String },
    players: [playerSchema],
  },
  { _id: false },
);

// Схема следующего матча
const nextMatchSchema = new Schema(
  {
    id: { type: String },
    kickoffTime: { type: String },
    tournament: { type: String },
    home: {
      id: { type: Number },
      name: { type: String },
    },
    away: {
      id: { type: Number },
      name: { type: String },
    },
  },
  { _id: false },
);

// Основная схема команды
const teamsSchema = new Schema(
  {
    name: { type: String, required: true },
    shortName: { type: String },
    code: { type: String },
    flagCode: { type: String },
    logoUrl: { type: String },
    country: { type: String },
    fotmobId: { type: Number, unique: true, sparse: true },

    league: { type: String },

    colors: {
      darkMode: { type: String },
      lightMode: { type: String },
    },
    stadium: Schema.Types.Mixed,
    coach: Schema.Types.Mixed,
    nextMatch: { type: nextMatchSchema, default: null },
    squadLines: [squadLineSchema],
    fixtures: [Schema.Types.Mixed],
  },
  { timestamps: true, versionKey: false },
);

export const TeamsCollection = model('teams', teamsSchema);
