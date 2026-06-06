import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/videos", "/categories", "/users", "/assign"];

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const { pathname } = request.nextUrl;

  const hasAuthCookie = request.cookies.getAll().some((c) =>
    c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
  );

  if (pathname === "/login" && hasAuthCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected && !hasAuthCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/videos/:path*", "/categories/:path*", "/users/:path*", "/assign/:path*", "/login"],
};
