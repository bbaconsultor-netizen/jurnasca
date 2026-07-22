import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rutaPermitida } from "@/lib/route-guard";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = (token?.role as "STAFF" | "REGANTE" | undefined) ?? null;

  if (!rutaPermitida(req.nextUrl.pathname, role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/regante/:path*"],
};
