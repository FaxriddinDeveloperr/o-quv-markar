import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import { centerInputSchema } from "@/lib/server/center-schema";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/admin/centers — pagination, qidiruv, saralash
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(5, Number(sp.get("pageSize") ?? 10)));
    const search = sp.get("search")?.trim();
    const districtId = sp.get("districtId") ?? undefined;
    const sort = sp.get("sort") ?? "createdAt";

    const where: Prisma.CenterWhereInput = {
      ...(districtId ? { districtId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.CenterOrderByWithRelationInput =
      sort === "name"
        ? { name: "asc" }
        : sort === "rating"
          ? { rating: "desc" }
          : sort === "views"
            ? { viewsCount: "desc" }
            : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.center.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          district: { select: { name: true, region: { select: { name: true } } } },
          _count: { select: { courses: true } },
        },
      }),
      prisma.center.count({ where }),
    ]);

    return ok({
      items: items.map((c) => ({
        id: c.id,
        name: c.name,
        districtName: c.district.name,
        regionName: c.district.region.name,
        phone: c.phone,
        rating: c.rating,
        viewsCount: c.viewsCount,
        coursesCount: c._count.courses,
        isActive: c.isActive,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/admin/centers — yangi markaz (kurslar/natijalar bilan)
export async function POST(req: NextRequest) {
  try {
    const data = centerInputSchema.parse(await req.json());
    const center = await prisma.center.create({
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
    return ok(center, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
