"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useApp } from "@/components/providers";
import { useDistricts, useRegions } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { haptic } from "@/lib/telegram-client";

export default function DistrictsPage({
  params,
}: {
  params: { regionId: string };
}) {
  const { regionId } = params;
  const { t, locale } = useApp();
  const { data, isLoading, isError, refetch } = useDistricts(regionId);
  const regions = useRegions();
  const reduce = useReducedMotion();

  const region = regions.data?.find((r) => r.id === regionId);
  const regionName = region
    ? locale === "uz"
      ? region.name
      : region.nameRu
    : "";

  return (
    <div>
      <PageHeader
        title={regionName || (locale === "uz" ? "Tumanlar" : "Районы")}
        subtitle={t.searchByDistrictDesc}
      />
      <div className="p-4">
        {isError && <ErrorState onRetry={() => refetch()} />}

        {isLoading && (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && <EmptyState title={t.empty} />}

        {data && (
          <div className="grid grid-cols-2 gap-2.5">
            {data.map((d, i) => (
              <motion.div
                key={d.id}
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.28,
                  ease: [0.16, 1, 0.3, 1],
                  delay: Math.min(i * 0.025, 0.3),
                }}
              >
                <Link
                  href={`/centers/${d.id}`}
                  onClick={() => haptic("light")}
                  className="flex h-full flex-col justify-between rounded-2xl border bg-card p-3.5 shadow-sm transition-colors active:bg-muted"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold leading-snug">
                      {locale === "uz" ? d.name : d.nameRu}
                    </h3>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    {d.centersCount > 0 ? (
                      <Badge variant="secondary" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {d.centersCount} {t.centersCount}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {locale === "uz" ? "markaz yo'q" : "нет центров"}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
