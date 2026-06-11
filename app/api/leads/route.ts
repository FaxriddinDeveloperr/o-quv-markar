import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import { getUserFromRequest } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const leadSchema = z.object({
  centerId: z.string().min(1),
  name: z.string().trim().min(2, "Ism juda qisqa").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9\s()-]{7,20}$/, "Telefon raqami noto'g'ri"),
  note: z.string().trim().max(500).optional(),
});

// POST /api/leads — "Qo'ng'iroqqa buyurtma" (lead yig'ish)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = leadSchema.parse(body);

    // Markaz mavjudligini tekshirish
    const center = await prisma.center.findUnique({
      where: { id: data.centerId },
      select: { id: true },
    });
    if (!center) {
      return ok({ error: "Markaz topilmadi" }, { status: 404 });
    }

    const user = await getUserFromRequest(req);

    const lead = await prisma.lead.create({
      data: {
        centerId: data.centerId,
        userId: user?.id ?? null,
        name: data.name,
        phone: data.phone,
        note: data.note ?? null,
      },
    });

    return ok({ success: true, id: lead.id }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
