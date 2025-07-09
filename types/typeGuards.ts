import mongoose from "mongoose";
import { IEvent } from "../lib/models/Event";
import { IUser } from "../lib/models/User";

export function isPopulatedEvent(event: any): event is IEvent {
  return event && typeof event === "object" && !(event instanceof mongoose.Types.ObjectId);
}

export function isPopulatedUser(user: any): user is IUser {
  return user && typeof user === "object" && !(user instanceof mongoose.Types.ObjectId);
}
