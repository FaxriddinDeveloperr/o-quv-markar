"use client";

// Telegram WebApp global obyekti ustidan ishonchli, tipli wrapper.
// (telegram-web-app.js skripti layout'da ulanadi.)

type HapticStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "error" | "success" | "warning";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
  };
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  switchInlineQuery?: (query: string, chats?: string[]) => void;
  HapticFeedback?: {
    impactOccurred: (style: HapticStyle) => void;
    notificationOccurred: (type: NotificationType) => void;
    selectionChanged: () => void;
  };
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  MainButton?: {
    setText: (t: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
  };
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function getTelegramUser() {
  return getWebApp()?.initDataUnsafe?.user ?? null;
}

export function getInitData(): string {
  return getWebApp()?.initData ?? "";
}

export function getColorScheme(): "light" | "dark" {
  return getWebApp()?.colorScheme ?? "light";
}

/** Tugmalar uchun haptic feedback */
export function haptic(style: HapticStyle = "light") {
  try {
    getWebApp()?.HapticFeedback?.impactOccurred(style);
  } catch {
    /* noop — brauzerda ishlamaydi */
  }
}

export function hapticNotify(type: NotificationType) {
  try {
    getWebApp()?.HapticFeedback?.notificationOccurred(type);
  } catch {
    /* noop */
  }
}

export function hapticSelection() {
  try {
    getWebApp()?.HapticFeedback?.selectionChanged();
  } catch {
    /* noop */
  }
}

/** Tashqi havolani Telegram orqali ochish */
export function openLink(url: string) {
  const wa = getWebApp();
  if (wa) wa.openLink(url);
  else if (typeof window !== "undefined") window.open(url, "_blank");
}

export function openTelegramLink(url: string) {
  const wa = getWebApp();
  if (wa) wa.openTelegramLink(url);
  else if (typeof window !== "undefined") window.open(url, "_blank");
}

/** Markazni do'stga ulashish (Telegram share) */
export function shareUrl(url: string, text: string) {
  const shareLink = `https://t.me/share/url?url=${encodeURIComponent(
    url,
  )}&text=${encodeURIComponent(text)}`;
  openTelegramLink(shareLink);
}
