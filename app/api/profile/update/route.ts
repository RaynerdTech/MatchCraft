import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import { uploadImageToCloudinary } from "@/utils/uploadImageToCloudinary";
import { encode } from "next-auth/jwt";

export async function PUT(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentUserEmail = session.user.email;
  const { imageBase64, name, phone, position, skillLevel } = await req.json();

  try {
    const user = await User.findOne({ email: currentUserEmail });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Upload image if base64 is provided
    if (imageBase64) {
      const imageUrl = await uploadImageToCloudinary(imageBase64, user._id.toString());
      user.image = imageUrl;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (position) user.position = position;
    if (skillLevel) user.skillLevel = skillLevel;

    await user.save();

    // Regenerate session token with updated info
    const newToken = await encode({
      token: {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
      secret: process.env.NEXTAUTH_SECRET!,
    });

    const response = NextResponse.json({ message: "Profile updated successfully" });

    response.cookies.set("next-auth.session-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
