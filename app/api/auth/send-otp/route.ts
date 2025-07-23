import { NextResponse } from "next/server";
import { EmailVerification } from "@/lib/models/EmailVerification";
import { connectDB } from "@/lib/mongoose";
import crypto from "crypto";
import sendEmail from "@/lib/sendEmail"; // We’ll build this

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const otp = crypto.randomInt(100000, 999999).toString();

    // Upsert OTP (create or update if it exists)
    await EmailVerification.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );

    // Send OTP to user email
    await sendEmail({
      to: email,
      subject: "Your SoccerHub Verification Code",
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
