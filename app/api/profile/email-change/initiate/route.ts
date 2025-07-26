import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newEmail } = await req.json();
    if (!newEmail) {
      return NextResponse.json({ error: "New email is required" }, { status: 400 });
    }

    const existing = await User.findOne({ email: newEmail });
    if (existing) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
    }

    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    return NextResponse.json({ message: "OTP sent to new email" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
