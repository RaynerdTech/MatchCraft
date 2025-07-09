import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Add a small delay to ensure token is fresh
    await new Promise(resolve => setTimeout(resolve, 100));

    if (pathname === "/onboarding" && token?.onboardingComplete) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (pathname === "/dashboard" && !token?.onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/onboarding"],
};