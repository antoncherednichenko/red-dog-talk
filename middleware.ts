import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  PUBLIC_ROUTES,
} from "@/lib/constants/routes";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = Object.values(PROTECTED_ROUTES).some((route) =>
    pathname.startsWith(route),
  );

  const isAuthRoute = Object.values(AUTH_ROUTES).some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !token) {
    const url = new URL(PUBLIC_ROUTES.Login, request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(PROTECTED_ROUTES.Rooms, request.url));
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
