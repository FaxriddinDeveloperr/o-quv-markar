import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface ValidatedInitData {
  user: TelegramUser;
  authDate: number;
  queryId?: string;
  raw: string;
}

/**
 * Telegram Mini App `initData` HMAC validatsiyasi.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * @param initData  Telegram.WebApp.initData (URL-encoded query string)
 * @param botToken  BOT_TOKEN
 * @param maxAgeSec initData yoshini cheklash (default 24 soat)
 * @returns Validatsiyadan o'tgan ma'lumot yoki null
 */
export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 86400,
): ValidatedInitData | null {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  // data_check_string: kalitlar alfavit bo'yicha, "key=value" \n bilan
  const dataCheckString = Array.from(params.entries())
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // Vaqtga bardoshli (timing-safe) taqqoslash
  const a = Buffer.from(computedHash, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const authDate = Number(params.get("auth_date") ?? 0);
  if (maxAgeSec > 0) {
    const ageSec = Math.floor(Date.now() / 1000) - authDate;
    if (ageSec > maxAgeSec) return null;
  }

  const userRaw = params.get("user");
  if (!userRaw) return null;

  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw) as TelegramUser;
  } catch {
    return null;
  }
  if (!user?.id) return null;

  return {
    user,
    authDate,
    queryId: params.get("query_id") ?? undefined,
    raw: initData,
  };
}
