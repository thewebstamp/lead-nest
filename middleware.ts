// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Define public and auth routes
const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/error",
  "/form",
  "/api/auth",
  "/api/webhooks",
  "/api/public",
];

const AUTH_ROUTES = ["/auth/signin", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/form/") // Public forms
  ) {
    return NextResponse.next();
  }

  // Get token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to signin if not authenticated
  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check onboarding status for dashboard routes
  if (pathname.startsWith("/dashboard") && !token.onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Redirect to dashboard if onboarding is completed but user is on onboarding page
  if (pathname.startsWith("/onboarding") && token.onboardingCompleted) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Add tenant context to headers
  const requestHeaders = new Headers(request.headers);
  if (token.businessId) {
    requestHeaders.set("x-business-id", token.businessId as string);
  }
  if (token.businessSlug) {
    requestHeaders.set("x-business-slug", token.businessSlug as string);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
