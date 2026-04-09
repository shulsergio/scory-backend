import { model, Schema } from 'mongoose';

const groupsSchema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: 'teams',
      required: true,
    },
    tournament: {
      type: String,
      required: true,
      index: true,
    },
    group: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    goalsFor: {
      type: Number,
      default: 0,
    },
    goalsAgainst: {
      type: Number,
      default: 0,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

groupsSchema.index({ team: 1, tournament: 1, group: 1 }, { unique: true });

export const GroupsCollection = model('groups', groupsSchema);
