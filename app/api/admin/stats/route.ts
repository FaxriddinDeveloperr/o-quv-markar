import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";

export const dynamic = "force-dynamic";

// GET /api/admin/stats — dashboard statistikasi
export async function GET() {
  try {
    const [
      usersCount,
      centersCount,
      districtsCount,
      regionsCount,
      coursesCount,
      leadsCount,
      newLeadsCount,
      topCenters,
      recentLeads,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.center.count(),
      prisma.district.count(),
      prisma.region.count(),
      prisma.course.count(),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.center.findMany({
        orderBy: { viewsCount: "desc" },
        take: 5,
        select: { id: true, name: true, viewsCount: true, rating: true },
      }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { center: { select: { name: true } } },
      }),
    ]);

    return ok({
      usersCount,
      centersCount,
      districtsCount,
      regionsCount,
      coursesCount,
      leadsCount,
      newLeadsCount,
      topCenters,
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        centerName: l.center.name,
        status: l.status,
        createdAt: l.createdAt,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}
