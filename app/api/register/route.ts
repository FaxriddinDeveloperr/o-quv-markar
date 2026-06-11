import { type NextRequest } from "next/server";
import { ok, handleError } from "@/lib/server/response";
import { getUserFromRequest } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

// POST /api/register — initData asosida foydalanuvchini ro'yxatga olish/yangilash
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return ok({ authenticated: false }, { status: 200 });
    }
    return ok({
      authenticated: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phone: user.phone,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
