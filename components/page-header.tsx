"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getWebApp, haptic } from "@/lib/telegram-client";

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();

  // Telegram BackButton bilan integratsiya
  useEffect(() => {
    const wa = getWebApp();
    const back = wa?.BackButton;
    if (!back) return;
    const handler = () => {
      haptic("light");
      router.back();
    };
    back.show();
    back.onClick(handler);
    return () => {
      back.offClick(handler);
      back.hide();
    };
  }, [router]);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/90 px-2 py-2.5 backdrop-blur-lg">
      <button
        onClick={() => {
          haptic("light");
          router.back();
        }}
        aria-label="Orqaga"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted active:scale-90"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-bold leading-tight">{title}</h1>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0 pr-1">{right}</div>}
    </header>
  );
}
