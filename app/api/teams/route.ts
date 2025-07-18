import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Team from "@/lib/models/Team";

export async function GET(req: NextRequest) {
  await connectDB();

  const eventId = req.nextUrl.searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { error: "Missing eventId in query." },
      { status: 400 }
    );
  }

  try {
    const teams = await Team.find({ event: eventId })
      .populate({
        path: "members.userId",
        select: "name image email",
      })
      .sort({ createdAt: 1 });

    return NextResponse.json({ teams });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong while fetching teams." },
      { status: 500 }
    );
  }
}
