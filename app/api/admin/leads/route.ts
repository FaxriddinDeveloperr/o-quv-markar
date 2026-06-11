import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import type { Prisma, LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(5, Number(sp.get("pageSize") ?? 15)));
    const status = sp.get("status") as LeadStatus | null;

    const where: Prisma.LeadWhereInput = status ? { status } : {};

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { center: { select: { name: true } } },
      }),
      prisma.lead.count({ where }),
    ]);

    return ok({
      items: items.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        note: l.note,
        status: l.status,
        centerName: l.center.name,
        createdAt: l.createdAt,
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
