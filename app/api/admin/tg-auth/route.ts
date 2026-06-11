import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateInitData } from "@/lib/telegram-auth";
import { isAdminTelegramId } from "@/lib/admin-telegram";
import { ADMIN_COOKIE, signAdminToken } from "@/lib/server/admin-auth";
import { handleError } from "@/lib/server/response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  initData: z.string().min(1),
});

// Telegram Mini App initData orqali admin avtorizatsiyasi.
// Faqat ADMIN_TELEGRAM_IDS ro'yxatidagi foydalanuvchi admin cookie oladi.
export async function POST(req: NextRequest) {
  try {
    const { initData } = schema.parse(await req.json());

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: "BOT_TOKEN sozlanmagan" },
        { status: 500 },
      );
    }

    const validated = validateInitData(initData, botToken);
    if (!validated) {
      return NextResponse.json(
        { error: "Telegram ma'lumoti yaroqsiz" },
        { status: 401 },
      );
    }

    if (!isAdminTelegramId(validated.user.id)) {
      return NextResponse.json(
        { error: "Sizda admin huquqi yo'q" },
        { status: 403 },
      );
    }

    const username =
      validated.user.username ?? `tg_${validated.user.id}`;
    const token = await signAdminToken({
      sub: `tg:${validated.user.id}`,
      username,
      role: "ADMIN",
    });

    const res = NextResponse.json({ success: true });
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
