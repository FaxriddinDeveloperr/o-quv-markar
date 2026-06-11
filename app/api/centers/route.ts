import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import { getUserFromRequest } from "@/lib/server/auth";
import {
  centerListInclude,
  toCenterListItem,
  type CenterWithRels,
} from "@/lib/server/mappers";
import type { CenterListItemDTO } from "@/lib/types";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  districtId: z.string().optional(),
  search: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  sort: z.enum(["priceAsc", "priceDesc", "rating", "distance"]).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  favorite: z.coerce.boolean().optional(),
  popular: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

// GET /api/centers — qidiruv, filtr, saralash, geolokatsiya
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = querySchema.parse(Object.fromEntries(sp.entries()));

    const user = await getUserFromRequest(req);

    let favoriteCenterIds: string[] | null = null;
    if (q.favorite) {
      if (!user) return ok([]);
      const favs = await prisma.favorite.findMany({
        where: { userId: user.id },
        select: { centerId: true },
      });
      favoriteCenterIds = favs.map((f) => f.centerId);
    }

    const where: Prisma.CenterWhereInput = {
      isActive: true,
      ...(q.districtId ? { districtId: q.districtId } : {}),
      ...(favoriteCenterIds ? { id: { in: favoriteCenterIds } } : {}),
      ...(q.search
        ? {
            OR: [
              { name: { contains: q.search, mode: "insensitive" } },
              { address: { contains: q.search, mode: "insensitive" } },
              {
                courses: {
                  some: {
                    OR: [
                      { name: { contains: q.search, mode: "insensitive" } },
                      { nameRu: { contains: q.search, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
      ...(q.subject
        ? {
            courses: {
              some: {
                OR: [
                  { name: { contains: q.subject, mode: "insensitive" } },
                  { nameRu: { contains: q.subject, mode: "insensitive" } },
                ],
              },
            },
          }
        : {}),
    };

    // DB darajasida saralash (masofa va narx keyin xotirada)
    const orderBy: Prisma.CenterOrderByWithRelationInput =
      q.sort === "rating" ? { rating: "desc" } : { rating: "desc" };

    const centers = (await prisma.center.findMany({
      where,
      include: centerListInclude,
      orderBy,
      take: q.limit ?? (q.popular ? 10 : 100),
    })) as CenterWithRels[];

    const favIds = new Set(
      favoriteCenterIds ??
        (user
          ? (
              await prisma.favorite.findMany({
                where: {
                  userId: user.id,
                  centerId: { in: centers.map((c) => c.id) },
                },
                select: { centerId: true },
              })
            ).map((f) => f.centerId)
          : []),
    );

    let data: CenterListItemDTO[] = centers.map((c) =>
      toCenterListItem(c, {
        favoriteIds: favIds,
        userLat: q.lat,
        userLng: q.lng,
      }),
    );

    // Xotirada saralash
    if (q.sort === "priceAsc") {
      data.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
    } else if (q.sort === "priceDesc") {
      data.sort((a, b) => (b.minPrice ?? -1) - (a.minPrice ?? -1));
    } else if (q.sort === "distance" && q.lat != null && q.lng != null) {
      data.sort(
        (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
      );
    } else if (q.popular) {
      data = data.slice(0, 10);
    }

    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}
