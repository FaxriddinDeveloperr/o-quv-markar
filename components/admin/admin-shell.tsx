"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Map,
  PhoneCall,
  Users,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/centers", label: "Markazlar", icon: Building2 },
  { href: "/admin/districts", label: "Tumanlar", icon: MapPin },
  { href: "/admin/regions", label: "Viloyatlar", icon: Map },
  { href: "/admin/leads", label: "So'rovlar", icon: PhoneCall },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
];

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await adminApi.post("/api/admin/logout");
    router.push("/admin/login");
    router.refresh();
  };

  const NavLinks = () => (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-background p-4 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold">O'quv Admin</span>
        </div>
        <NavLinks />
        <Button
          variant="ghost"
          onClick={logout}
          className="mt-auto justify-start gap-3 text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
          Chiqish
        </Button>
      </aside>

      {/* Mobil sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r bg-background p-4">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="font-bold">O'quv Admin</span>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks />
            <Button
              variant="ghost"
              onClick={logout}
              className="mt-auto justify-start gap-3 text-muted-foreground"
            >
              <LogOut className="h-5 w-5" />
              Chiqish
            </Button>
          </aside>
        </div>
      )}

      {/* Asosiy qism */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur-lg">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menyu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">{title}</h1>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
