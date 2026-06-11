import { type NextRequest } from "next/server";
import { validateInitData } from "@/lib/telegram-auth";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export const INIT_DATA_HEADER = "x-telegram-init-data";

/**
 * So'rovdan Telegram foydalanuvchisini ajratib oladi va DB'da yangilaydi.
 * initData header'idagi HMAC imzo BOT_TOKEN bilan tekshiriladi.
 *
 * Dev rejimida (NODE_ENV !== production) va header bo'sh bo'lsa — null qaytaradi
 * (ya'ni anonim), lekin BOT_TOKEN qo'yilgan bo'lsa har doim tekshiradi.
 */
export async function getUserFromRequest(
  req: NextRequest,
): Promise<User | null> {
  const initData = req.headers.get(INIT_DATA_HEADER) ?? "";
  const botToken = process.env.BOT_TOKEN ?? "";

  if (!initData) return null;

  // BOT_TOKEN o'rnatilmagan dev holatida — imzosiz parse (faqat lokal)
  const validated =
    botToken && botToken !== "PUT_YOUR_BOT_TOKEN_HERE"
      ? validateInitData(initData, botToken)
      : parseUnsafe(initData);

  if (!validated) return null;

  const u = validated.user;
  return prisma.user.upsert({
    where: { telegramId: BigInt(u.id) },
    update: {
      firstName: u.first_name,
      lastName: u.last_name ?? null,
      username: u.username ?? null,
      languageCode: u.language_code ?? "uz",
    },
    create: {
      telegramId: BigInt(u.id),
      firstName: u.first_name,
      lastName: u.last_name ?? null,
      username: u.username ?? null,
      languageCode: u.language_code ?? "uz",
    },
  });
}

/** Faqat lokal dev uchun — imzo tekshirmasdan user'ni o'qiydi */
function parseUnsafe(initData: string) {
  if (process.env.NODE_ENV === "production") return null;
  try {
    const params = new URLSearchParams(initData);
    const userRaw = params.get("user");
    if (!userRaw) return null;
    const user = JSON.parse(userRaw);
    if (!user?.id) return null;
    return { user, authDate: 0, raw: initData };
  } catch {
    return null;
  }
}

/** Auth talab qiladigan endpointlar uchun — user yo'q bo'lsa xato tashlaydi */
export async function requireUser(req: NextRequest): Promise<User> {
  const user = await getUserFromRequest(req);
  if (!user) {
    throw new ApiError(401, "Avtorizatsiya talab qilinadi");
  }
  return user;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
