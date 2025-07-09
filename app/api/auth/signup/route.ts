import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    // Validation
    if (!email || !name || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    // Check existing user - now checks provider too
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.provider === "google"
              ? "This email is registered with Google. Please sign in with Google."
              : "Email already exists",
        },
        { status: 400 }
      );
    }

    // Create user with provider field
    const newUser = await User.create({
      email,
      name,
      password: await bcrypt.hash(password, 12),
      provider: "credentials", // Explicitly set provider
      onboardingComplete: false,
    });

    // Create token payload - now includes provider
    const token = await encode({
      token: {
        _id: newUser._id.toString(),
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        image: null,
        onboardingComplete: false,
        provider: "credentials", // Added provider to token
      },
      secret: process.env.NEXTAUTH_SECRET!,
    });

    // Set response - unchanged frontend structure
    const response = NextResponse.json({
      success: true,
      user: {
        _id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        onboardingComplete: false,
      },
    });

    // Set cookie - unchanged
    response.cookies.set({
      name: "next-auth.session-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error("🚨 SIGNUP ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signup failed" },
      { status: 500 }
    );
  }
}
