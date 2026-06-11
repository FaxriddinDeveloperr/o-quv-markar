import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["NEW", "CONTACTED", "DONE"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { status } = schema.parse(await req.json());
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: { status },
    });
    return ok(lead);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.lead.delete({ where: { id: params.id } });
    return ok({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
