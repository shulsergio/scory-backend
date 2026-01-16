import { model, Schema } from 'mongoose';

const wctablesSchema = new Schema(
  {
    //     userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  },
  { timestamps: true, versionKey: false },
);

export const WCTablesCollection = model('wctables', wctablesSchema);
