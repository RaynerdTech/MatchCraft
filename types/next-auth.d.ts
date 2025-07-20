// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      onboardingComplete?: boolean;
      skillLevel?: string;
      position?: string;
      provider?: "google" | "credentials";
      role?: "player" | "organizer" | "admin"; // ✅ added here
    };
  }

  interface User {
    _id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    onboardingComplete?: boolean;
    skillLevel?: string;
    position?: string;
    provider?: "google" | "credentials";
    role?: "player" | "organizer" | "admin"; // ✅ added here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    onboardingComplete?: boolean;
    skillLevel?: string;
    position?: string;
    provider?: "google" | "credentials";
    role?: "player" | "organizer" | "admin"; // ✅ added here
  }
}
