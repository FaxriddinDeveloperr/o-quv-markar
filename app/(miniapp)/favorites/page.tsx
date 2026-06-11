"use client";

import { Heart } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { CenterCard, CenterCardSkeleton } from "@/components/center-card";
import { useApp } from "@/components/providers";
import { useCenters } from "@/lib/hooks";

export default function FavoritesPage() {
  const { t } = useApp();
  const { data, isLoading, isError, refetch } = useCenters({ favorite: true });

  return (
    <div>
      <PageHeader title={t.favorites} />
      <div className="space-y-3 p-4">
        {isError && <ErrorState onRetry={() => refetch()} />}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CenterCardSkeleton key={i} />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <EmptyState
            icon={Heart}
            title={t.emptyFavorites}
            description={
              t.addFavorite + " — " + t.popular.toLowerCase()
            }
          />
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
