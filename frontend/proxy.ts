import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const protectedRoutes = [
  "/user/dashboard",
  "/escrow",
  "/profile",
];

const authRoutes = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  const isProtected = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.redirect(new URL("/user/dashboard", req.url));
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user/dashboard/:path*",
    "/escrow/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};