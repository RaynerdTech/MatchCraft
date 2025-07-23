import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { EmailVerification } from "@/lib/models/EmailVerification";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const verification = await EmailVerification.findOne({ email });

    if (!verification || verification.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    // Update user's emailVerified field
    await User.findOneAndUpdate(
      { email },
      { emailVerified: new Date() }
    );

    // Delete OTP record (optional but clean)
    await EmailVerification.deleteOne({ email });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}
