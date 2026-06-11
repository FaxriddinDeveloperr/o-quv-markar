import type { Prisma } from "@prisma/client";
import type { CenterListItemDTO } from "@/lib/types";
import { haversineKm } from "@/lib/utils";

// Markaz ro'yxati uchun kerakli relationlar bilan tip
export type CenterWithRels = Prisma.CenterGetPayload<{
  include: {
    district: true;
    courses: { select: { price: true } };
    _count: { select: { courses: true } };
  };
}>;

export const centerListInclude = {
  district: true,
  courses: { select: { price: true } },
  _count: { select: { courses: true } },
} satisfies Prisma.CenterInclude;

export function toCenterListItem(
  c: CenterWithRels,
  opts: {
    favoriteIds?: Set<string>;
    userLat?: number;
    userLng?: number;
  } = {},
): CenterListItemDTO {
  const prices = c.courses.map((x) => x.price).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const distanceKm =
    opts.userLat != null && opts.userLng != null
      ? haversineKm(opts.userLat, opts.userLng, c.latitude, c.longitude)
      : null;

  return {
    id: c.id,
    name: c.name,
    logoUrl: c.logoUrl,
    rating: c.rating,
    address: c.address,
    districtId: c.districtId,
    districtName: c.district.name,
    latitude: c.latitude,
    longitude: c.longitude,
    minPrice,
    coursesCount: c._count.courses,
    isFavorite: opts.favoriteIds?.has(c.id) ?? false,
    distanceKm,
  };
}
