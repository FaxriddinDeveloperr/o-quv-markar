"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Users,
  Building2,
  MapPin,
  PhoneCall,
  Eye,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/admin-api";

interface Stats {
  usersCount: number;
  centersCount: number;
  districtsCount: number;
  regionsCount: number;
  coursesCount: number;
  leadsCount: number;
  newLeadsCount: number;
  topCenters: { id: string; name: string; viewsCount: number; rating: number }[];
  recentLeads: {
    id: string;
    name: string;
    phone: string;
    centerName: string;
    status: string;
    createdAt: string;
  }[];
}

const STATUS_LABEL: Record<string, string> = {
  NEW: "Yangi",
  CONTACTED: "Bog'lanildi",
  DONE: "Yakunlandi",
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.get<Stats>("/api/admin/stats"),
  });

  const cards = [
    { label: "Foydalanuvchilar", value: data?.usersCount, icon: Users, color: "text-blue-600 bg-blue-100 dark:bg-blue-500/15" },
    { label: "Markazlar", value: data?.centersCount, icon: Building2, color: "text-violet-600 bg-violet-100 dark:bg-violet-500/15" },
    { label: "Kurslar", value: data?.coursesCount, icon: GraduationCap, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15" },
    { label: "So'rovlar", value: data?.leadsCount, icon: PhoneCall, color: "text-orange-600 bg-orange-100 dark:bg-orange-500/15" },
  ];

  return (
    <AdminShell title="Dashboard">
      {/* Statistik kartalar */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <p className="text-2xl font-bold leading-none">{c.value}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Eng ko'p ko'rilgan markazlar */}
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Eye className="h-4 w-4 text-primary" />
              Eng ko'p ko'rilgan markazlar
            </h2>
            <div className="space-y-2">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              {data?.topCenters.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/admin/centers/${c.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    {c.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    {c.viewsCount}
                  </span>
                </Link>
              ))}
              {data && data.topCenters.length === 0 && (
                <p className="text-sm text-muted-foreground">Ma'lumot yo'q</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* So'nggi so'rovlar */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <PhoneCall className="h-4 w-4 text-primary" />
                So'nggi so'rovlar
                {data && data.newLeadsCount > 0 && (
                  <Badge variant="destructive">{data.newLeadsCount}</Badge>
                )}
              </h2>
              <Link
                href="/admin/leads"
                className="flex items-center gap-1 text-xs font-medium text-primary"
              >
                Hammasi <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              {data?.recentLeads.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.phone} · {l.centerName}
                    </p>
                  </div>
                  <Badge
                    variant={l.status === "NEW" ? "default" : "muted"}
                    className="shrink-0"
                  >
                    {STATUS_LABEL[l.status] ?? l.status}
                  </Badge>
                </div>
              ))}
              {data && data.recentLeads.length === 0 && (
                <p className="text-sm text-muted-foreground">So'rov yo'q</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
