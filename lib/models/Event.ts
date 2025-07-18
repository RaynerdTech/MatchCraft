import mongoose, { Schema, Document, Model } from 'mongoose';

interface IParticipant {
  userId: mongoose.Types.ObjectId;
  paid: boolean;
  reference: string;
}

export interface IEvent extends Document {
  title: string;
  description?: string;
  date: Date;
  time: string;
  endTime: string;
  image?: string;
  location: string;
  createdBy: mongoose.Types.ObjectId;
  participants: IParticipant[];
  pricePerPlayer: number;
  slots: number;

  // 🆕 Team-related fields
  teamOnly: boolean;
  allowFreePlayersIfTeamIncomplete: boolean;
  teams: {
    teamA?: mongoose.Types.ObjectId;
    teamB?: mongoose.Types.ObjectId;
  };
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paid: { type: Boolean, default: false },
    reference: { type: String, default: '' },
  },
  { _id: false }
);

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    endTime: { type: String, required: true },
    time: { type: String, required: true },
    image: { type: String },
    location: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [ParticipantSchema],
    pricePerPlayer: { type: Number, default: 0 },
    slots: { type: Number, required: true },

    // 🆕 Team setup
    teamOnly: { type: Boolean, default: false, index: true },
    allowFreePlayersIfTeamIncomplete: { type: Boolean, default: false, index: true },
    teams: {
      teamA: { type: Schema.Types.ObjectId, ref: 'Team' },
      teamB: { type: Schema.Types.ObjectId, ref: 'Team' },
    },
  },
  { timestamps: true }
);

// Prevent model overwrite
EventSchema.set('strict', false);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
