import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Transaction from "@/lib/models/Transaction";
import Event from "@/lib/models/Event";
import Team from "@/lib/models/Team"; // ✅ added
import crypto from "crypto";
import { isPopulatedUser } from "@/types/typeGuards";
import mongoose from "mongoose";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.arrayBuffer();
    const sig = req.headers.get("x-paystack-signature") || "";

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(Buffer.from(rawBody))
      .digest("hex");

    if (hash !== sig) {
      console.warn("❌ Invalid signature");
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(Buffer.from(rawBody).toString("utf8"));
    if (body.event !== "charge.success") {
      return new NextResponse("Ignored non-payment event", { status: 200 });
    }

    await connectDB();

    const reference = body.data.reference;
    const transaction = await Transaction.findOne({ reference }).populate("user");

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 });
    }

    if (transaction.status === "success") {
      return new NextResponse("Already handled", { status: 200 });
    }

    // ✅ Update transaction
    transaction.status = "success";

    const qrPayload = {
      userId: isPopulatedUser(transaction.user)
        ? transaction.user._id.toString()
        : transaction.user.toString(),
      eventId: transaction.event.toString(),
      reference: transaction.reference,
      type: "event_pass",
    };

    transaction.qrCodeData = JSON.stringify(qrPayload);
    await transaction.save();

    // ✅ Update event participants
    const event = await Event.findById(transaction.event);
    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    const userId = isPopulatedUser(transaction.user)
      ? transaction.user._id
      : transaction.user;

    const existing = event.participants.find(
      (p: any) => p.userId.toString() === userId.toString()
    );

    if (existing) {
      existing.paid = true;
      existing.reference = transaction.reference;
    } else {
      event.participants.push({
        userId: new mongoose.Types.ObjectId(userId as string),
        paid: true,
        reference: transaction.reference,
      });
    }

    await event.save();

    // ✅ Check if user is in a team for that event
    const team = await Team.findOne({
      event: transaction.event,
      members: {
        $elemMatch: {
          userId: userId,
        },
      },
    });

    if (team) {
      const member = team.members.find(
        (m: any) => m.userId.toString() === userId.toString()
      );
      if (member) {
        member.paid = true;
      }
      await team.save();
    }

    return new NextResponse("Payment processed", { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return new NextResponse("Webhook server error", { status: 500 });
  }
}
