import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "./auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

/** API route handler'larini o'rab, xatolarni bir xil formatga keltiradi */
export function handleError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Validatsiya xatosi", issues: err.flatten() },
      { status: 400 },
    );
  }
  console.error("API xatosi:", err);
  return NextResponse.json(
    { error: "Serverda xatolik yuz berdi" },
    { status: 500 },
  );
}
