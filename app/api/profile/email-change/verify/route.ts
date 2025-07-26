import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions"; // make sure this path is correct
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { EmailVerification } from "@/lib/models/EmailVerification";
import User from "@/lib/models/User";
import { encode } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verification = await EmailVerification.findOne({ email });
    if (!verification || verification.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user._id,
      { email },
      { new: true }
    );

    await EmailVerification.deleteOne({ email });

    const newToken = await encode({
      token: {
        _id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        role: updatedUser.role,
      },
      secret: process.env.NEXTAUTH_SECRET!,
    });

    const response = NextResponse.json({ message: "Email updated successfully" });

    response.cookies.set("next-auth.session-token", newToken, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 });
  }
}
