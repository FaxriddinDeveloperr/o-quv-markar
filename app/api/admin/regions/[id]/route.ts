import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(1).optional(),
  nameRu: z.string().trim().min(1).optional(),
  order: z.coerce.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = schema.parse(await req.json());
    const region = await prisma.region.update({
      where: { id: params.id },
      data,
    });
    return ok(region);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.region.delete({ where: { id: params.id } });
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
