import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// --- List of all public routes that do not require authentication ---
const publicPaths = [
  "/", // Homepage
  "/signin",
  "/dashboard/browse-events",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the current path is in our list of public paths.
  // If so, the user can access it without any checks.
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // --- Protected Route Logic ---
  // If the path is not public, we need to check for a valid session token.
  // Note: You must have NEXTAUTH_SECRET set in your .env file for getToken to work.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 1. If there is no token, the user is not authenticated.
  //    Redirect them to the sign-in page.
  if (!token) {
    const signInUrl = new URL("/signin", req.url);
    // Add a callbackUrl so the user is redirected back to the page they
    // were trying to access after they successfully log in.
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 2. If a token exists, the user is authenticated.
  //    Now, we enforce the onboarding flow.
  const { onboardingComplete } = token;

  // If onboarding is complete and the user tries to visit the onboarding page,
  // redirect them to their main dashboard.
  if (onboardingComplete && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If onboarding is NOT complete and the user is on any protected page
  // OTHER THAN the onboarding page, force them to the onboarding page.
  if (!onboardingComplete && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // If all checks pass, allow the request to proceed.
  return NextResponse.next();
}

// This config defines which routes the middleware will run on.
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - images (files in the public/images folder) <-- ADDED THIS
   * - favicon.ico (favicon file)
   * This ensures the middleware runs on all pages and we handle the
   * public/private logic inside the function above.
   */
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
