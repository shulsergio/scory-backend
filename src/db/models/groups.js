const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    index: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const GroupCollection = mongoose.model('groups', GroupSchema);
