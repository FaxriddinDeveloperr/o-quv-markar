"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { FilterSortBar } from "@/components/filter-sort-bar";
import { CenterCard, CenterCardSkeleton } from "@/components/center-card";
import { useApp } from "@/components/providers";
import { useCenters } from "@/lib/hooks";
import type { SortOption } from "@/lib/types";

export default function CentersByDistrictPage({
  params,
}: {
  params: { districtId: string };
}) {
  const { districtId } = params;
  const { t, locale } = useApp();
  const [subject, setSubject] = useState<string | undefined>();
  const [sort, setSort] = useState<SortOption | undefined>("rating");

  const { data, isLoading, isError, refetch } = useCenters({
    districtId,
    subject,
    sort,
  });

  const districtName = data?.[0]?.districtName;

  return (
    <div>
      <PageHeader
        title={districtName ?? (locale === "uz" ? "Markazlar" : "Центры")}
        subtitle={data ? `${data.length} ${t.centersCount}` : undefined}
      />
      <div className="space-y-3 p-4">
        <FilterSortBar
          subject={subject}
          onSubjectChange={setSubject}
          sort={sort}
          onSortChange={setSort}
        />

        {isError && <ErrorState onRetry={() => refetch()} />}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CenterCardSkeleton key={i} />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <EmptyState icon={Building2} title={t.emptyCenters} />
        )}

        {data && data.length > 0 && (
          <div className="space-y-3">
            {data.map((c) => (
              <CenterCard key={c.id} center={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
