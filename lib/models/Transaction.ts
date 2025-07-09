import mongoose, { Schema, Document, Model } from 'mongoose';
import { IEvent } from './Event';
import { IUser } from './User';

export interface ITransaction extends Document {
  event: mongoose.Types.ObjectId | IEvent;
  user: mongoose.Types.ObjectId | IUser;
  reference: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  usedAt?: Date | null;
  split?: {
    platform: number;
    organizer: number;
  };
  qrCodeData?: string;
}


const TransactionSchema = new Schema<ITransaction>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reference: { type: String, unique: true, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    usedAt: { type: Date, default: null },
    split: {
      platform: Number,
      organizer: Number,
    },
    qrCodeData: String,
  },
  { timestamps: true }
);

TransactionSchema.set('strict', false);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
