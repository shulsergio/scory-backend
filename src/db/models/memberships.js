import { model, Schema } from 'mongoose';

 
const MembershipSchema = new Schema({
  leagueId: {
 
    type: Schema.Types.ObjectId,
    ref: 'leagues',  
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
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
 
MembershipSchema.index({ leagueId: 1, userId: 1 }, { unique: true });
export const MembershipCollection = model('memberships', MembershipSchema);
