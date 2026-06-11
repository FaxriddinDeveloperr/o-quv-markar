"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { FilterSortBar } from "@/components/filter-sort-bar";
import { CenterCard, CenterCardSkeleton } from "@/components/center-card";
import { useApp } from "@/components/providers";
import { useCenters } from "@/lib/hooks";
import type { SortOption } from "@/lib/types";

function SearchContent() {
  const sp = useSearchParams();
  const { t } = useApp();
  const [search, setSearch] = useState(sp.get("q") ?? "");
  const [subject, setSubject] = useState<string | undefined>();
  const [sort, setSort] = useState<SortOption | undefined>("rating");

  const { data, isLoading, isError, refetch } = useCenters({
    search: search.trim() || undefined,
    subject,
    sort,
  });

  return (
    <div>
      <PageHeader title={t.search} />
      <div className="space-y-3 p-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t.searchPlaceholder}
          autoFocus={!search}
        />
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
          <EmptyState icon={SearchX} title={t.emptySearch} />
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4" />}>
      <SearchContent />
    </Suspense>
  );
}
