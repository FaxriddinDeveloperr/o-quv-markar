"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Heart, LayoutGrid } from "lucide-react";
import { useApp } from "@/components/providers";
import { haptic } from "@/lib/telegram-client";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useApp();

  const items = [
    { href: "/", label: t.appName.split(" ")[0], icon: Home, exact: true },
    { href: "/districts", label: t.districts, icon: LayoutGrid },
    { href: "/map", label: t.searchByMap.split(" ")[0], icon: Map },
    { href: "/favorites", label: t.favorites, icon: Heart },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-background/90 backdrop-blur-lg">
      <div className="safe-bottom flex items-stretch justify-around pt-1.5">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => haptic("light")}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-1.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon
                className={cn("h-5 w-5", active && "fill-primary/15")}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
