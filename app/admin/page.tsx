"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Users,
  Building2,
  PhoneCall,
  Eye,
  GraduationCap,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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

const STATUS_COLOR: Record<string, string> = {
  NEW: "destructive",
  CONTACTED: "default",
  DONE: "secondary",
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.get<Stats>("/api/admin/stats"),
  });

  const statCards = [
    {
      label: "Foydalanuvchilar",
      value: data?.usersCount,
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-950/40",
    },
    {
      label: "Markazlar",
      value: data?.centersCount,
      icon: Building2,
      color: "text-violet-600 bg-violet-100 dark:bg-violet-950/40",
    },
    {
      label: "Kurslar",
      value: data?.coursesCount,
      icon: GraduationCap,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      label: "So'rovlar",
      value: data?.leadsCount,
      icon: PhoneCall,
      color: "text-orange-600 bg-orange-100 dark:bg-orange-950/40",
    },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="space-y-6">
        {/* Statistika kartalar */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Asosiy statistika
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                color={card.color}
                loading={isLoading}
              />
            ))}
          </div>
        </div>

        {/* Ma'lumotlar va so'rovlar */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Eng ko'p ko'rilgan markazlar */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-5 w-5" />
                  Eng ko'p ko'rilgan markazlar
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/centers">Hammasi</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-2 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : data?.topCenters.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Ma'lumot yo'q
                </div>
              ) : (
                <div className="divide-y">
                  {data?.topCenters.map((c, i) => (
                    <Link
                      key={c.id}
                      href={`/admin/centers/${c.id}`}
                      className="flex items-center justify-between border-b px-6 py-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {i + 1}
                        </div>
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        {c.viewsCount}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* So'nggi so'rovlar */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PhoneCall className="h-5 w-5" />
                  So'nggi so'rovlar
                  {data && data.newLeadsCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {data.newLeadsCount}
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/leads">Hammasi</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-2 p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : data?.recentLeads.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  So'rov yo'q
                </div>
              ) : (
                <div className="divide-y">
                  {data?.recentLeads.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between border-b px-6 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {l.phone} · {l.centerName}
                        </p>
                      </div>
                      <Badge
                        variant={STATUS_COLOR[l.status] as any}
                        className="shrink-0 ml-2"
                      >
                        {STATUS_LABEL[l.status] ?? l.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
