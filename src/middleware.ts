import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define paths that require authentication
const protectedPaths = ["/stakes", "/play-with-friends"];

// Define paths that are accessible only for non-authenticated users
const authPaths = ["/auth/login", "/auth/create-account"];

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Check if the path is protected and user is not authenticated
  if (
    protectedPaths.some((protectedPath) => path.startsWith(protectedPath)) &&
    !token
  ) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (authPaths.some((authPath) => path === authPath) && token) {
    return NextResponse.redirect(new URL("/stakes", request.url));
  }

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
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
