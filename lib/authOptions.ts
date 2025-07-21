import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./db";
import { connectDB } from "./mongoose";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials?.email }).select(
          "+password"
        );
        if (!user) throw new Error("No user found with this email");
        if (!user.password) throw new Error("Please sign in using Google");

        const isValid = await bcrypt.compare(
          credentials!.password,
          user.password
        );
        if (!isValid) throw new Error("Incorrect password");

        return {
          ...user.toObject(),
          id: user._id.toString(),
          _id: user._id.toString(),
          onboardingComplete: user.onboardingComplete ?? false,
          role: user.role || "player",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/signin",
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
     if (user) {
  token._id = user._id?.toString() || user.id;
  token.name = user.name;
  token.email = user.email;
  token.image = user.image;
  token.onboardingComplete = user.onboardingComplete ?? false;
  token.role = user.role || "player"; // ✅ Add this
}

      // Update logic stays same
      if (trigger === "update" || token._id) {
        await connectDB();
        const dbUser = await User.findById(token._id).select(
          "onboardingComplete"
        );
        if (dbUser) {
          token.onboardingComplete = dbUser.onboardingComplete ?? false;
        }
      }

      return token;
    },

    async session({ session, token }) {
     if (session.user) {
  session.user._id = token._id;
  session.user.name = token.name;
  session.user.email = token.email;
  session.user.image = token.image;
  session.user.onboardingComplete = token.onboardingComplete;
  session.user.role = token.role; // ✅ Add this
}

      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) return true;
        return true;
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account, profile }) {
      // console.log("🧠 Google Sign In Debug:", { user, account, profile });
    },
  },
};
