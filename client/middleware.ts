import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/",
    "/pricing",
    "/faq",
  ];

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/analytics",
    "/properties",
    "/clients",
    "/settings",
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // If user is trying to access a protected route without a token
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has a token and tries to access auth pages, redirect to dashboard
  if (
    accessToken &&
    (pathname === "/auth/login" || pathname === "/auth/register")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user has a token and tries to access public pages (like homepage), allow but could redirect to dashboard
  if (accessToken && isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
