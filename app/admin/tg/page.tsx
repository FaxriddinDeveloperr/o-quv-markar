"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Loader2, ShieldX, ShieldCheck } from "lucide-react";

type Status = "loading" | "ok" | "error";

export default function AdminTgAuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Tekshirilmoqda…");
  const [scriptReady, setScriptReady] = useState(
    typeof window !== "undefined" && !!window.Telegram?.WebApp,
  );

  useEffect(() => {
    if (!scriptReady) return;

    const wa = window.Telegram?.WebApp;
    wa?.ready();
    const initData = wa?.initData ?? "";

    if (!initData) {
      setStatus("error");
      setMessage(
        "Telegram ma'lumoti topilmadi. Bu sahifani bot ichidagi tugma orqali oching.",
      );
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/tg-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ initData }),
        });
        if (cancelled) return;
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          setStatus("error");
          setMessage(err?.error ?? "Kirishda xatolik");
          return;
        }
        setStatus("ok");
        setMessage("Admin panel ochilmoqda…");
        router.replace("/admin");
        router.refresh();
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Tarmoq xatosi. Qayta urinib ko'ring.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scriptReady, router]);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-muted/40 p-6 text-center">
        {status === "loading" && (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        )}
        {status === "ok" && (
          <ShieldCheck className="h-8 w-8 text-green-600" />
        )}
        {status === "error" && <ShieldX className="h-8 w-8 text-destructive" />}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </>
  );
}
