import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";
import { encode } from "next-auth/jwt"; // Using encode instead of getToken

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phone, skillLevel, position, role, imageBase64 } = body;

    // Validate required fields
    if (!phone || !skillLevel || !position || !imageBase64 || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Upload image
    const imageUrl = await uploadImageToCloudinary(imageBase64, userId);

    // Update user
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

    // Create new token payload matching your jwt callback
    const token = await encode({
      token: {
        ...session.user, // Preserve existing session data
        _id: updatedUser._id.toString(),
        id: updatedUser._id.toString(),
        image: imageUrl,
        onboardingComplete: true,
        // Include all other fields your jwt callback expects:
        name: updatedUser.name,
        email: updatedUser.email,
      },
      secret: process.env.NEXTAUTH_SECRET!,
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        onboardingComplete: true,
      },
      redirectTo: "/dashboard",
    });

    // Set session cookie
    response.cookies.set({
      name: "next-auth.session-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Onboarding failed" },
      { status: 500 }
    );
  }
}
