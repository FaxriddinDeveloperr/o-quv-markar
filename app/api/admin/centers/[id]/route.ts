import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import { centerInputSchema } from "@/lib/server/center-schema";

export const dynamic = "force-dynamic";

// GET — to'liq markaz (tahrirlash uchun)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const center = await prisma.center.findUnique({
      where: { id: params.id },
      include: {
        courses: { orderBy: { price: "asc" } },
        results: true,
      },
    });
    if (!center) return ok({ error: "Topilmadi" }, { status: 404 });
    return ok(center);
  } catch (err) {
    return handleError(err);
  }
}

// PATCH — markazni yangilash (kurslar/natijalarni qayta yaratish)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = centerInputSchema.parse(await req.json());
    const center = await prisma.$transaction(async (tx) => {
      await tx.course.deleteMany({ where: { centerId: params.id } });
      await tx.centerResult.deleteMany({ where: { centerId: params.id } });
      return tx.center.update({
        where: { id: params.id },
        data: {
          name: data.name,
          description: data.description ?? null,
          descriptionRu: data.descriptionRu ?? null,
          districtId: data.districtId,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          phone: data.phone,
          telegramUrl: data.telegramUrl ?? null,
          logoUrl: data.logoUrl ?? null,
          photos: data.photos,
          rating: data.rating,
          isActive: data.isActive,
          courses: { create: data.courses },
          results: { create: data.results },
        },
      });
    });
    return ok(center);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.center.delete({ where: { id: params.id } });
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
