import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Required for dynamic API routes in app dir

type Params = Promise<{ id: string }>;

export async function GET(request: Request, context: { params: Params }) {
  await connectDB();

  const { id } = await context.params; // ✅ Properly await the params

  try {
    const user = await User.findById(id).select("-password"); // Exclude password

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
