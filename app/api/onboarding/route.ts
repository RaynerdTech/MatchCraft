import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";
import { encode } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phone, skillLevel, position, role, imageBase64 } = body;

    if (!phone || !skillLevel || !position || !imageBase64 || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const imageUrl = await uploadImageToCloudinary(imageBase64, userId);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        phone,
        skillLevel,
        position,
        role,
        image: imageUrl,
        onboardingComplete: true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = await encode({
      token: {
        _id: updatedUser._id.toString(),
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role,
        onboardingComplete: true,
      },
      secret: process.env.NEXTAUTH_SECRET!,
    });

    console.log("🧠 Refreshed token role:", updatedUser.role);

    const response = NextResponse.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        onboardingComplete: true,
      },
      redirectTo: "/dashboard",
    });

    response.cookies.set(
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      }
    );

    return response;
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Onboarding failed" },
      { status: 500 }
    );
  }
}
