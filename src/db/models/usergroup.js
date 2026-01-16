import { model, Schema } from 'mongoose';

const usergroupSchema = new Schema(
  {
    groupName: { type: String, required: true, unique: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    userPoints: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const UserGroupCollection = model('usergroup', usergroupSchema);
