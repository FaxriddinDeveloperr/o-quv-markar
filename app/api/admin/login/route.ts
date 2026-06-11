import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/server/response";
import { ADMIN_COOKIE, signAdminToken } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = schema.parse(body);

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return NextResponse.json(
        { error: "Login yoki parol noto'g'ri" },
        { status: 401 },
      );
    }

    const token = await signAdminToken({
      sub: admin.id,
      username: admin.username,
      role: admin.role,
    });

    const res = NextResponse.json({
      success: true,
      admin: { username: admin.username, role: admin.role },
    });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    return handleError(err);
  }
}
