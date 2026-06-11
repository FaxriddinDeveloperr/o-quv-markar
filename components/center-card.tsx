"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, MapPin, Navigation } from "lucide-react";
import { StarRating } from "@/components/star-rating";
import { useApp } from "@/components/providers";
import { useToggleFavorite } from "@/lib/hooks";
import { haptic, hapticNotify } from "@/lib/telegram-client";
import { cn, formatDistance, formatPrice, initials } from "@/lib/utils";
import type { CenterListItemDTO } from "@/lib/types";

export function CenterCard({
  center,
  variant = "list",
}: {
  center: CenterListItemDTO;
  variant?: "list" | "compact";
}) {
  const { t, locale } = useApp();
  const toggle = useToggleFavorite();
  const reduce = useReducedMotion();

  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic("light");
    hapticNotify(center.isFavorite ? "warning" : "success");
    toggle.mutate({ centerId: center.id, isFavorite: center.isFavorite });
  };

  const tap = reduce ? {} : { scale: 0.98 };

  if (variant === "compact") {
    return (
      <motion.div whileTap={tap} className="shrink-0">
        <Link
          href={`/center/${center.id}`}
          className="block w-[220px] overflow-hidden rounded-2xl border bg-card shadow-card"
        >
          <div className="relative h-28 w-full bg-secondary">
            {center.logoUrl ? (
              <Image
                src={center.logoUrl}
                alt={center.name}
                fill
                sizes="220px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold text-primary">
                {initials(center.name)}
              </div>
            )}
            <FavButton active={center.isFavorite} onClick={onFav} />
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-semibold">{center.name}</h3>
              <StarRating rating={center.rating} className="shrink-0" />
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {center.districtName}
            </p>
            {center.minPrice != null && (
              <p className="mt-1.5 text-sm font-semibold text-primary">
                {t.from} {formatPrice(center.minPrice, locale)}
              </p>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileTap={tap}>
      <Link
        href={`/center/${center.id}`}
        className="flex gap-3 rounded-2xl border bg-card p-3 shadow-card"
      >
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-secondary">
          {center.logoUrl ? (
            <Image
              src={center.logoUrl}
              alt={center.name}
              fill
              sizes="88px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xl font-bold text-primary">
              {initials(center.name)}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold leading-tight">
              {center.name}
            </h3>
            <FavButton active={center.isFavorite} onClick={onFav} inline />
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <StarRating rating={center.rating} />
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-3.5 w-3.5" />
              {center.districtName}
            </span>
            {center.distanceKm != null && (
              <span className="inline-flex items-center gap-0.5 text-primary">
                <Navigation className="h-3.5 w-3.5" />
                {formatDistance(center.distanceKm, locale)}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            {center.minPrice != null ? (
              <span className="text-sm font-semibold text-primary">
                {t.from} {formatPrice(center.minPrice, locale)}
              </span>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground">
              {center.coursesCount} {t.coursesCount}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FavButton({
  active,
  onClick,
  inline,
}: {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  inline?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Saqlash"
      className={cn(
        "flex items-center justify-center rounded-full transition-transform active:scale-90",
        inline
          ? "h-7 w-7 shrink-0"
          : "absolute right-2 top-2 h-8 w-8 bg-black/30 backdrop-blur-sm",
      )}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          active
            ? "fill-rose-500 text-rose-500"
            : inline
              ? "text-muted-foreground"
              : "text-white",
        )}
      />
    </button>
  );
}

export function CenterCardSkeleton({
  variant = "list",
}: {
  variant?: "list" | "compact";
}) {
  if (variant === "compact") {
    return (
      <div className="w-[220px] shrink-0 overflow-hidden rounded-2xl border bg-card">
        <div className="skeleton h-28 w-full" />
        <div className="space-y-2 p-3">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 rounded-2xl border bg-card p-3">
      <div className="skeleton h-[88px] w-[88px] shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}
