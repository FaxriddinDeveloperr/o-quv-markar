import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "admin_token";

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ADMIN_COOKIE)?.value;

  // Admin API: login va tg-auth'dan tashqari hammasi himoyalangan
  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/login") return NextResponse.next();
    if (pathname === "/api/admin/tg-auth") return NextResponse.next();
    if (!(await isValidToken(token))) {
      return NextResponse.json(
        { error: "Avtorizatsiya talab qilinadi" },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // Admin sahifalari
  if (pathname.startsWith("/admin")) {
    const valid = await isValidToken(token);
    // tg-auth sahifasi: Telegram initData orqali o'zi cookie oladi
    if (pathname === "/admin/tg") {
      return NextResponse.next();
    }
    if (pathname === "/admin/login") {
      // Login'da bo'lsa va token bor bo'lsa — dashboardga
      if (valid) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }
    if (!valid) {
      const url = new URL("/admin/login", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
