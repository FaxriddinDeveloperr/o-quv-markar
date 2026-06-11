import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Narxni o'zbekcha formatda ko'rsatadi: 600000 -> "600 000 so'm" */
export function formatPrice(price: number, locale: "uz" | "ru" = "uz"): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(price);
  return locale === "uz" ? `${formatted} so'm` : `${formatted} сум`;
}

/** Masofani odam o'qiy oladigan ko'rinishga keltiradi */
export function formatDistance(km: number, locale: "uz" | "ru" = "uz"): string {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return locale === "uz" ? `${m} m` : `${m} м`;
  }
  return locale === "uz" ? `${km.toFixed(1)} km` : `${km.toFixed(1)} км`;
}

/**
 * Haversine formula — ikki geo-nuqta orasidagi masofa (km).
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Yer radiusi (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Ismdan initsiallar (avatar fallback uchun) */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
