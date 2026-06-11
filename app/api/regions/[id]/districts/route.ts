import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import type { DistrictDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/regions/[id]/districts — viloyatdagi tumanlar (markazlar soni bilan)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const districts = await prisma.district.findMany({
      where: { regionId: params.id },
      orderBy: { order: "asc" },
      include: { _count: { select: { centers: true } } },
    });

    const data: DistrictDTO[] = districts.map((d) => ({
      id: d.id,
      name: d.name,
      nameRu: d.nameRu,
      order: d.order,
      regionId: d.regionId,
      centersCount: d._count.centers,
    }));

    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}
