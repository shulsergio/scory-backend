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
  { _id: false },
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

const playerSchema = new Schema(
  {
    id: { type: Number },
    name: { type: String },
  },
  { _id: false },
);

const squadLineSchema = new Schema(
  {
    title: { type: String },
    players: [playerSchema],
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
    id: Number,
    date: String,
    status: String,
    scoreStr: String,
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
    fotmobId: { type: Number, sparse: true },

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
