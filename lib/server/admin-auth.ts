import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_token";
const ALG = "HS256";

export interface AdminTokenPayload {
  sub: string; // admin id
  username: string;
  role: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET o'rnatilmagan");
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(
  payload: AdminTokenPayload,
): Promise<string> {
  return new SignJWT({ username: payload.username, role: payload.role })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: String(payload.sub),
      username: String(payload.username ?? ""),
      role: String(payload.role ?? "ADMIN"),
    };
  } catch {
    return null;
  }
}

/** Route handler / server component'da joriy adminni olish */
export async function getAdmin(): Promise<AdminTokenPayload | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/** Admin API'lari uchun — admin yo'q bo'lsa xato */
export async function requireAdmin(): Promise<AdminTokenPayload> {
  const admin = await getAdmin();
  if (!admin) {
    const { ApiError } = await import("./auth");
    throw new ApiError(401, "Avtorizatsiya talab qilinadi");
  }
  return admin;
}
