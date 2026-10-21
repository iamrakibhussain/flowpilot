import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware for Route Authorization
 * Enforces authentication boundary on /dashboard and redirects authenticated users from /login and /register
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("flowpilot_session")?.value;

  const isAuthenticated = Boolean(sessionCookie && sessionCookie.trim().length > 0);

  const isExplicitLogout = request.nextUrl.searchParams.get("logged_out") === "true";

  // If user arrives with ?logged_out=true from clicking the Logout button, purge cookie and allow /login
  if (isExplicitLogout && pathname === "/login") {
    const response = NextResponse.next();
    response.cookies.delete("flowpilot_session");
    return response;
  }

  // 1. Protect tenant workspace and dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Prevent authenticated users from accessing login or register (unless explicitly logging out)
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated && !isExplicitLogout) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
