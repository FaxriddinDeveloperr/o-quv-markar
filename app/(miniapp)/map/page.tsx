"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navigation, MapPin, LocateFixed, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DynamicMap } from "@/components/dynamic-map";
import { CenterCard, CenterCardSkeleton } from "@/components/center-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers";
import { useCenters } from "@/lib/hooks";
import { haptic } from "@/lib/telegram-client";
import { formatDistance } from "@/lib/utils";

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied" };

export default function MapPage() {
  const { t, locale } = useApp();
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  const requestLocation = () => {
    haptic("medium");
    if (!("geolocation" in navigator)) {
      setGeo({ status: "denied" });
      return;
    }
    setGeo({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setGeo({
          status: "granted",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setGeo({ status: "denied" }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Sahifa ochilganda joylashuvni so'rash
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userLoc =
    geo.status === "granted"
      ? ([geo.lat, geo.lng] as [number, number])
      : null;

  const { data, isLoading } = useCenters({
    sort: userLoc ? "distance" : "rating",
    lat: userLoc?.[0],
    lng: userLoc?.[1],
  });

  const markers = useMemo(
    () =>
      (data ?? []).map((c) => ({
        id: c.id,
        lat: c.latitude,
        lng: c.longitude,
        title: c.name,
        subtitle:
          c.distanceKm != null
            ? `${t.distance} ${formatDistance(c.distanceKm, locale)}`
            : c.districtName,
      })),
    [data, t.distance, locale],
  );

  return (
    <div>
      <PageHeader
        title={t.searchByMap}
        right={
          <Button
            size="sm"
            variant="ghost"
            onClick={requestLocation}
            className="h-9 gap-1.5 px-2"
          >
            {geo.status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
          </Button>
        }
      />

      {/* Xarita */}
      <div className="relative h-[48vh] w-full">
        {(isLoading || geo.status === "loading") && markers.length === 0 ? (
          <div className="flex h-full items-center justify-center bg-secondary">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <DynamicMap
            markers={markers}
            userLocation={userLoc}
            renderPopup={(m) => (
              <div className="min-w-[150px]">
                <strong className="text-sm">{m.title}</strong>
                {m.subtitle && (
                  <div className="mb-1.5 mt-0.5 text-xs text-primary">
                    {m.subtitle}
                  </div>
                )}
                <Link
                  href={`/center/${m.id}`}
                  className="text-xs font-semibold text-primary underline"
                >
                  {t.detail} →
                </Link>
              </div>
            )}
          />
        )}
      </div>

      {/* Holatlar */}
      {geo.status === "denied" && (
        <div className="border-b bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          {t.locationDenied} · {t.allowLocation}
        </div>
      )}

      {/* Yaqin atrofdagilar */}
      <div className="p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-lg font-bold">
          <Navigation className="h-5 w-5 text-primary" />
          {userLoc ? t.nearby : t.centers}
        </h2>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CenterCardSkeleton key={i} />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <EmptyState icon={MapPin} title={t.emptyCenters} />
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
