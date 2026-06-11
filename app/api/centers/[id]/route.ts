import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import { getUserFromRequest, ApiError } from "@/lib/server/auth";
import type { CenterDetailDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/centers/[id] — markaz to'liq ma'lumoti (+ ko'rishlar soni)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const center = await prisma.center.update({
      where: { id: params.id },
      data: { viewsCount: { increment: 1 } },
      include: {
        district: true,
        courses: { orderBy: { price: "asc" } },
        results: true,
        _count: { select: { courses: true } },
      },
    });

    if (!center.isActive) throw new ApiError(404, "Markaz topilmadi");

    const user = await getUserFromRequest(req);
    let isFavorite = false;
    if (user) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_centerId: { userId: user.id, centerId: center.id } },
      });
      isFavorite = !!fav;
    }

    const prices = center.courses.map((c) => c.price).filter((p) => p > 0);

    const data: CenterDetailDTO = {
      id: center.id,
      name: center.name,
      logoUrl: center.logoUrl,
      rating: center.rating,
      address: center.address,
      districtId: center.districtId,
      districtName: center.district.name,
      latitude: center.latitude,
      longitude: center.longitude,
      minPrice: prices.length ? Math.min(...prices) : null,
      coursesCount: center._count.courses,
      isFavorite,
      description: center.description,
      descriptionRu: center.descriptionRu,
      phone: center.phone,
      telegramUrl: center.telegramUrl,
      photos: center.photos,
      viewsCount: center.viewsCount,
      courses: center.courses.map((c) => ({
        id: c.id,
        name: c.name,
        nameRu: c.nameRu,
        price: c.price,
        durationMonths: c.durationMonths,
        description: c.description,
      })),
      results: center.results.map((r) => ({
        id: r.id,
        title: r.title,
        imageUrl: r.imageUrl,
      })),
    };

    return ok(data);
  } catch (err) {
    // Prisma P2025 -> topilmadi
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2025"
    ) {
      return handleError(new ApiError(404, "Markaz topilmadi"));
    }
    return handleError(err);
  }
}
