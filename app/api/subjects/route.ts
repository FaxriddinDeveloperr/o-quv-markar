import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/server/response";
import type { SubjectDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/subjects — filtr uchun noyob fan nomlari
export async function GET(_req: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      select: { name: true, nameRu: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
    });

    const data: SubjectDTO[] = courses.map((c) => ({
      name: c.name,
      nameRu: c.nameRu,
    }));

    return ok(data);
  } catch (err) {
    return handleError(err);
  }
}
