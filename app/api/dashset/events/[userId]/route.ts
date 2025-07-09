import { connectDB } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import { NextResponse } from "next/server";

type Params = Promise<{ userId: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  await connectDB();
  const { userId } = await params;

  try {
    const events = await Event.find({
      "participants.userId": userId,
    }).select("_id title location date time");

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching joined events:", error);
    return NextResponse.json(
      { error: "Could not fetch joined events" },
      { status: 500 }
    );
  }
}
