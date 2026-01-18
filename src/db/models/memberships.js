const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'groups',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

MembershipSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export const MembershipCollection = mongoose.model(
  'memberships',
  MembershipSchema,
);
