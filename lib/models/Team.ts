import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  accepted: boolean;
  paid: boolean;
}

export interface ITeam extends Document {
  event: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  name: string;
  members: ITeamMember[];
  confirmed: boolean;
  side: 'A' | 'B'; // ✅ Add this line
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    accepted: { type: Boolean, default: false },
    paid: { type: Boolean, default: false },
  },
  { _id: false }
);

const TeamSchema = new Schema<ITeam>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    side: { type: String, enum: ['A', 'B'], required: true },
    members: [TeamMemberSchema],
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TeamSchema.set("strict", false);

const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
