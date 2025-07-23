// models/EmailVerification.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

interface IEmailVerification extends Document {
  email: string;
  otp: string;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    email: { type: String, required: true, lowercase: true },
    otp: { type: String, required: true },
  },
  { timestamps: true }
);

export const EmailVerification: Model<IEmailVerification> =
  mongoose.models.EmailVerification ||
  mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema);
