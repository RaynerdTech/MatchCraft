import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import Transaction from "@/lib/models/Transaction";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import mongoose from "mongoose";
import { isPopulatedUser, isPopulatedEvent } from "@/types/typeGuards";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verifierId = session.user._id;
    const body = await req.json();
    const { userId, eventId, reference, type } = body;

    if (!eventId || !reference || !type) {
      return NextResponse.json(
        {
          error: "Missing required fields: eventId, reference, or type",
        },
        { status: 400 }
      );
    }

    if (type !== "event_pass") {
      return NextResponse.json({ error: "Invalid QR type" }, { status: 400 });
    }

    await connectDB();

    if (
      !mongoose.Types.ObjectId.isValid(eventId) ||
      !mongoose.Types.ObjectId.isValid(verifierId) ||
      (userId && !mongoose.Types.ObjectId.isValid(userId))
    ) {
      return NextResponse.json(
        { error: "One or more invalid IDs" },
        { status: 400 }
      );
    }

    const [event, verifier] = await Promise.all([
      Event.findById(eventId),
      User.findById(verifierId),
    ]);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!verifier) {
      return NextResponse.json({ error: "Verifier not found" }, { status: 404 });
    }

    const isCreator = event.createdBy.toString() === verifier._id.toString();
    const isAdmin = verifier.role === "admin";

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        {
          error: "You are not authorized to verify tickets for this event",
        },
        { status: 403 }
      );
    }

    if (userId) {
      const ticketUser = await User.findById(userId);
      if (!ticketUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    const transaction = await Transaction.findOne({
      reference,
      event: eventId,
      ...(userId && { user: userId }),
      status: "success",
    })
      .populate("user", "name email image")
      .populate("event", "title date time location image pricePerPlayer");

    if (!transaction) {
      return NextResponse.json(
        {
          valid: false,
          message: userId
            ? "No matching transaction for given user, event, and reference"
            : "No matching transaction for given event and reference",
          data: {
            eventId,
            reference,
          },
        },
        { status: 404 }
      );
    }

    const alreadyUsed = !!transaction.usedAt;

    if (!alreadyUsed) {
      transaction.usedAt = new Date();
      await transaction.save();
    }

    return NextResponse.json({
      valid: true,
      message: alreadyUsed ? "Ticket already used!" : "Ticket is valid",
      data: {
        userId: transaction.user._id.toString(),
        eventId: transaction.event._id.toString(),
        reference: transaction.reference,
        scannedAt: new Date().toISOString(),
        used: alreadyUsed,

        user: isPopulatedUser(transaction.user)
          ? {
              name: transaction.user.name,
              email: transaction.user.email,
              image: transaction.user.image,
            }
          : undefined,

        event: isPopulatedEvent(transaction.event)
          ? {
              title: transaction.event.title,
              date: transaction.event.date,
              time: transaction.event.time,
              location: transaction.event.location,
              image: transaction.event.image,
              pricePerPlayer: transaction.event.pricePerPlayer,
            }
          : undefined,
      },
    });
  } catch (err: any) {
    console.error("❌ QR Verify Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
