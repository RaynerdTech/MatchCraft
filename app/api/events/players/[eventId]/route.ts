import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import Event  from "@/lib/models/Event";
import Transaction from "@/lib/models/Transaction";
import  User from "@/lib/models/User";

export const dynamic = "force-dynamic";

type Params = Promise<{ eventId: string }>; // ✅ promise

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const { eventId } = await params; // ✅ await the params
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user || user.role !== "player") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const transaction = await Transaction.findOne({
      user: userId,
      event: eventId,
      status: "success",
    })
      .select("reference amount status qrCodeData")
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { error: "No successful payment found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      event,
      transaction,
    });
  } catch (err: any) {
    console.error("[GET_PLAYER_EVENT_ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
