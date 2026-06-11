"use client";

import { useApp } from "@/components/providers";
import { hapticSelection } from "@/lib/telegram-client";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useApp();
  const options: { value: Locale; label: string }[] = [
    { value: "uz", label: "UZ" },
    { value: "ru", label: "RU" },
  ];

  return (
    <div className="inline-flex rounded-full border bg-card p-0.5 text-xs font-semibold">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => {
            hapticSelection();
            setLocale(o.value);
          }}
          className={cn(
            "rounded-full px-3 py-1.5 transition-colors duration-150",
            locale === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
