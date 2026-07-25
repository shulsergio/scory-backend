import { Schema, model } from 'mongoose';

const stadiumSchema = new Schema(
  {
    name: { type: String },
    city: { type: String },
    capacity: { type: Number },
    opened: { type: Number },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }, // Чтобы Mongoose не создавал лишние _id для вложенных объектов
);

const coachSchema = new Schema(
  {
    fotmobId: { type: Number },
    name: { type: String },
    age: { type: Number },
    dateOfBirth: { type: String },
    ccode: { type: String },
    cname: { type: String },
  },
  { _id: false },
);

const squadLineSchema = new Schema(
  {
    title: { type: String }, // 'keepers', 'defenders', etc.
    players: [{ type: Number }], // Массив Fotmob ID игроков
  },
  { _id: false },
);
const fixtureTeamSchema = new Schema(
  {
    id: Number,
    name: String,
  },
  { _id: false },
);

const fixtureSchema = new Schema(
  {
    id: Number, // fotmobId матча
    date: String, // строка с датой ISO
    status: String, // 'FT', 'NS' и т.д.
    scoreStr: String, // '2 - 2'
    home: fixtureTeamSchema,
    away: fixtureTeamSchema,
    tournament: String,
  },
  { _id: false },
);

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
    stadium: stadiumSchema,
    coach: coachSchema,
    squadLines: [squadLineSchema],
    fixtures: [fixtureSchema],
  },
  { timestamps: true, versionKey: false },
);

export const TeamsCollection = model('teams', teamsSchema);
