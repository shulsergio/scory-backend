import { Schema, model } from 'mongoose';

const playerSchema = new Schema(
  {
    fotmobId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      default: 'male',
    },
    birthDate: {
      type: Date,
    },
    profile: {
      height_cm: Number,
      shirt_number: Number,
      age: Number,
      preferred_foot: String,
      country: String,
      country_code: String,
      market_value_eur: Number,
      contract_end: String,
    },
    team: {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'teams',
        default: null,
      },
      fotmobTeamId: {
        type: Number,
        index: true,
      },
      name: String,
      onLoan: Boolean,
      league_id: Number,
      league_name: String,
      season: String,
    },
    position: {
      main: String,
      full_label: String,
    },
    current_season_stats: {
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      started: { type: Number, default: 0 },
      matches_uppercase: { type: Number, default: 0 },
      minutes_played: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      yellow_cards: { type: Number, default: 0 },
      red_cards: { type: Number, default: 0 },
    },
    advanced_stats_per_90: Schema.Types.Mixed,
    trophies: [
      {
        team_name: String,
        tournament: String,
        seasons: [String],
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

playerSchema.index({ 'team.id': 1 });

export const PlayersCollection = model('players', playerSchema);
