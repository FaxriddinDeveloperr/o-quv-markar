import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import { requireUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

// POST /api/favorites/[centerId] — saqlash
export async function POST(
  req: NextRequest,
  { params }: { params: { centerId: string } },
) {
  try {
    const user = await requireUser(req);
    await prisma.favorite.upsert({
      where: {
        userId_centerId: { userId: user.id, centerId: params.centerId },
      },
      update: {},
      create: { userId: user.id, centerId: params.centerId },
    });
    return ok({ success: true, isFavorite: true });
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/favorites/[centerId] — o'chirish
export async function DELETE(
  req: NextRequest,
  { params }: { params: { centerId: string } },
) {
  try {
    const user = await requireUser(req);
    await prisma.favorite.deleteMany({
      where: { userId: user.id, centerId: params.centerId },
    });
    return ok({ success: true, isFavorite: false });
  } catch (err) {
    return handleError(err);
  }
}
