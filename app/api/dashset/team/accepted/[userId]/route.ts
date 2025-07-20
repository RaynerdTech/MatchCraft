import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Team from "@/lib/models/Team";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  await connectDB();
  const { userId } = await params;

  try {
    const teams = await Team.find({
      members: {
        $elemMatch: {
          userId,
          accepted: true,
        },
      },
    }).select("_id");

    return NextResponse.json({ count: teams.length });
  } catch (err) {
    console.error("Error fetching accepted teams:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
