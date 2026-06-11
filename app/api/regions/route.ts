import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import type { RegionDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/regions — barcha viloyatlar, tuman va markazlar soni bilan
export async function GET(_req: NextRequest) {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { districts: true } },
        districts: {
          select: { _count: { select: { centers: true } } },
        },
      },
    });

    const data: RegionDTO[] = regions.map((r) => ({
      id: r.id,
      name: r.name,
      nameRu: r.nameRu,
      order: r.order,
      districtsCount: r._count.districts,
      centersCount: r.districts.reduce(
        (sum, d) => sum + d._count.centers,
        0,
      ),
    }));

    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}
