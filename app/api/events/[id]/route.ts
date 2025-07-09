// app/api/events/[id]/route.ts
import { connectDB } from "@/lib/mongoose";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise first
    const { id } = await params;

    await connectDB();

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { message: "Invalid event ID format" },
        { status: 400 }
      );
    }

    // Get server session and validate user
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists and has proper role
    const user = await User.findById(session.user._id).select("role");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const event = await Event.findById(id).populate("createdBy", "name");

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Add isOrganizer flag to response if user is admin or event creator
    const responseData = {
      ...event.toObject(),
      isOrganizer:
        user.role === "admin" ||
        event.createdBy._id.toString() === user._id.toString(),
      isAdmin: user.role === "admin",
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("[GET /api/events/[id]] Error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
