// Telegram ID bo'yicha admin ro'yxati.
// `ADMIN_TELEGRAM_IDS` env (vergul bilan ajratilgan) dan o'qiydi.
// Env bo'sh bo'lsa quyidagi standart ro'yxat ishlatiladi.

const DEFAULT_ADMIN_IDS = ["5944670152"];

export function getAdminTelegramIds(): string[] {
  const raw = process.env.ADMIN_TELEGRAM_IDS ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length > 0 ? ids : DEFAULT_ADMIN_IDS;
}

export function isAdminTelegramId(id: number | string | bigint): boolean {
  return getAdminTelegramIds().includes(String(id));
}
