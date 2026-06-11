import { type NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { handleError } from "@/lib/server/response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/admin/upload — rasm yuklash (multipart/form-data, field: "file")
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Faqat rasm fayllari (jpg, png, webp, gif)" },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fayl hajmi 5MB dan oshmasligi kerak" },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safe), bytes);

    return NextResponse.json({ url: `/uploads/${safe}` }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
