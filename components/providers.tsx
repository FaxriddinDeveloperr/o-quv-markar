"use client";

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  getColorScheme,
  getInitData,
  getTelegramUser,
  getWebApp,
} from "@/lib/telegram-client";
import {
  DEFAULT_LOCALE,
  getDict,
  type Dict,
  type Locale,
} from "@/lib/i18n";
import { Toaster } from "@/components/ui/toaster";

interface TgUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface AppContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
  user: TgUser | null;
  initData: string;
  ready: boolean;
}

const AppContext = React.createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <Providers>");
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);
  const [user, setUser] = React.useState<TgUser | null>(null);
  const [initData, setInitData] = React.useState("");
  const [ready, setReady] = React.useState(false);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("locale", l);
    } catch {
      /* noop */
    }
  }, []);

  React.useEffect(() => {
    const wa = getWebApp();
    if (wa) {
      wa.ready();
      wa.expand();
      // Telegram theme'ga moslash
      const scheme = getColorScheme();
      document.documentElement.classList.toggle("dark", scheme === "dark");
      try {
        wa.setHeaderColor?.(scheme === "dark" ? "#14161f" : "#ffffff");
      } catch {
        /* noop */
      }
    }

    const tgUser = getTelegramUser();
    setUser(tgUser);
    setInitData(getInitData());

    // Til: localStorage > Telegram language_code > default
    let chosen: Locale = DEFAULT_LOCALE;
    try {
      const saved = localStorage.getItem("locale");
      if (saved === "uz" || saved === "ru") chosen = saved;
      else if (tgUser?.language_code?.startsWith("ru")) chosen = "ru";
    } catch {
      /* noop */
    }
    setLocaleState(chosen);
    setReady(true);
  }, []);

  const value = React.useMemo<AppContextValue>(
    () => ({ locale, setLocale, t: getDict(locale), user, initData, ready }),
    [locale, setLocale, user, initData, ready],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={value}>
        {children}
        <Toaster />
      </AppContext.Provider>
    </QueryClientProvider>
  );
}
