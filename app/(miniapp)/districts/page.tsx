"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, ChevronRight, Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useApp } from "@/components/providers";
import { useRegions } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { haptic } from "@/lib/telegram-client";

export default function RegionsPage() {
  const { t, locale } = useApp();
  const { data, isLoading, isError, refetch } = useRegions();
  const reduce = useReducedMotion();

  return (
    <div>
      <PageHeader title={locale === "uz" ? "Hududlar" : "Регионы"} />
      <div className="p-4">
        {isError && <ErrorState onRetry={() => refetch()} />}

        {isLoading && (
          <div className="space-y-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && <EmptyState title={t.empty} />}

        {data && (
          <div className="space-y-2.5">
            {data.map((r, i) => (
              <motion.div
                key={r.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                  delay: Math.min(i * 0.03, 0.3),
                }}
              >
                <Link
                  href={`/districts/${r.id}`}
                  onClick={() => haptic("light")}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-colors active:bg-muted"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">
                      {locale === "uz" ? r.name : r.nameRu}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {r.centersCount} {t.centersCount} · {r.districtsCount}{" "}
                      {locale === "uz" ? "tuman" : "р-н"}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
