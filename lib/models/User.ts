import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  password?: string;
  provider: 'google' | 'credentials';
  phone?: string;
  skillLevel?: string;
  position?: string;
  onboardingComplete: boolean;
  role: 'player' | 'organizer' | 'admin';
  isVerified?: boolean;
  // teams?: mongoose.Types.ObjectId[];
  subaccountCode?: string | null;
  bankSetupComplete: boolean;
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    name: String,
    image: String,
    password: {
      type: String,
      select: false,
    },
    provider: {
      type: String,
      enum: ['google', 'credentials'],
      required: true,
      default: 'credentials',
    },
    phone: String,
    skillLevel: String,
    position: String,
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['player', 'organizer', 'admin'],
      default: 'player',
    },
    isVerified: {
  type: Boolean,
  default: false, // so new users aren’t verified by default
},
    subaccountCode: {
      type: String,
      default: null,
    },
    bankSetupComplete: {
      type: Boolean,
      default: false,
    },
    bankName: {
      type: String,
      default: null,
    },
    bankCode: {
      type: String,
      default: null,
    },
    accountNumber: {
      type: String,
      default: null,
    },
    accountName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

UserSchema.set('strict', false);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
