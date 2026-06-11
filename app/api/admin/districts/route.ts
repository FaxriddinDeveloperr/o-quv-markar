import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const regionId = req.nextUrl.searchParams.get("regionId") ?? undefined;
    const districts = await prisma.district.findMany({
      where: regionId ? { regionId } : undefined,
      orderBy: [{ regionId: "asc" }, { order: "asc" }],
      include: {
        _count: { select: { centers: true } },
        region: { select: { name: true } },
      },
    });
    return ok(
      districts.map((d) => ({
        id: d.id,
        name: d.name,
        nameRu: d.nameRu,
        order: d.order,
        regionId: d.regionId,
        regionName: d.region.name,
        centersCount: d._count.centers,
      })),
    );
  } catch (err) {
    return handleError(err);
  }
}

const schema = z.object({
  name: z.string().trim().min(1),
  nameRu: z.string().trim().min(1),
  regionId: z.string().min(1),
  order: z.coerce.number().int().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const district = await prisma.district.create({ data });
    return ok(district, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
