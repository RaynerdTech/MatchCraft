// app/api/auth/signup/route.ts
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

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

    // ✨ Create the user and assign default role (you can change this)
    const newUser = await User.create({
      email,
      name,
      password: await bcrypt.hash(password, 12),
      provider: "credentials",
      onboardingComplete: false,
      role: "player", // 👈 Add role explicitly here
    });

    // ✅ Create the JWT token including role
    const token = await encode({
      token: {
        _id: newUser._id.toString(),
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        image: null,
        onboardingComplete: false,
        provider: "credentials",
        role: newUser.role, // 👈 Include role in session token
      },
      secret: process.env.NEXTAUTH_SECRET!,
    });

    // 🌐 Set response JSON
    const response = NextResponse.json({
      success: true,
      user: {
        _id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        onboardingComplete: false,
        role: newUser.role,
      },
    });

    // 🍪 Set session cookie with JWT
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
