import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { districts: true } } },
    });
    return ok(
      regions.map((r) => ({
        id: r.id,
        name: r.name,
        nameRu: r.nameRu,
        order: r.order,
        districtsCount: r._count.districts,
      })),
    );
  } catch (err) {
    return handleError(err);
  }
}

const schema = z.object({
  name: z.string().trim().min(1),
  nameRu: z.string().trim().min(1),
  order: z.coerce.number().int().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const region = await prisma.region.create({ data });
    return ok(region, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
