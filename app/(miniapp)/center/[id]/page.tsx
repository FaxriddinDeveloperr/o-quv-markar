"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  Share2,
  Phone,
  Navigation,
  MapPin,
  Eye,
  Clock,
  Send,
  PhoneCall,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/star-rating";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { LeadDialog } from "@/components/lead-dialog";
import { DynamicMap } from "@/components/dynamic-map";
import { useApp } from "@/components/providers";
import { useCenter, useToggleFavorite } from "@/lib/hooks";
import {
  haptic,
  hapticNotify,
  openLink,
  openTelegramLink,
  shareUrl,
} from "@/lib/telegram-client";
import { cn, formatPrice, initials } from "@/lib/utils";

export default function CenterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { t, locale } = useApp();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { data: c, isLoading, isError, refetch } = useCenter(id);
  const toggle = useToggleFavorite();

  if (isError) {
    return (
      <div className="p-4">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading || !c) {
    return (
      <div>
        <Skeleton className="h-60 w-full rounded-none" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const gallery = c.photos.length > 0 ? c.photos : c.logoUrl ? [c.logoUrl] : [];
  const appUrl =
    typeof window !== "undefined" ? window.location.href : "";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`;

  const onFav = () => {
    haptic("light");
    hapticNotify(c.isFavorite ? "warning" : "success");
    toggle.mutate({ centerId: c.id, isFavorite: c.isFavorite });
  };

  const desc = locale === "uz" ? c.description : c.descriptionRu;

  return (
    <div className="pb-6">
      {/* Galereya */}
      <div className="relative h-60 w-full bg-secondary">
        {gallery.length > 0 ? (
          <div className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto">
            {gallery.map((src, i) => (
              <div key={i} className="relative h-full w-full shrink-0 snap-center">
                <Image
                  src={src}
                  alt={`${c.name} ${i + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-bold text-primary">
            {initials(c.name)}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />

        {/* Top controls */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <IconBtn onClick={() => router.back()} aria-label={t.back}>
            <ChevronLeft className="h-6 w-6" />
          </IconBtn>
          <div className="flex gap-2">
            <IconBtn
              onClick={() => {
                haptic("light");
                shareUrl(appUrl, `${c.name} — ${t.appName}`);
              }}
              aria-label={t.share}
            >
              <Share2 className="h-5 w-5" />
            </IconBtn>
            <IconBtn onClick={onFav} aria-label={t.addFavorite}>
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  c.isFavorite && "fill-rose-500 text-rose-500",
                )}
              />
            </IconBtn>
          </div>
        </div>
      </div>

      {/* Asosiy ma'lumot */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="px-4 pt-4"
      >
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold leading-tight">{c.name}</h1>
          <StarRating rating={c.rating} className="mt-1 shrink-0" />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {c.districtName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {c.viewsCount} {t.views}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{c.address}</p>

        {/* Tezkor amallar */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            onClick={() => {
              haptic("medium");
              openLink(`tel:${c.phone}`);
            }}
          >
            <Phone className="h-4 w-4" />
            {t.call}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              haptic("medium");
              openLink(mapsUrl);
            }}
          >
            <Navigation className="h-4 w-4" />
            {t.route}
          </Button>
        </div>
        <LeadDialog
          centerId={c.id}
          trigger={
            <Button variant="outline" className="mt-2 w-full">
              <PhoneCall className="h-4 w-4" />
              {t.requestCall}
            </Button>
          }
        />
      </motion.div>

      {/* Tablar */}
      <div className="px-4 pt-5">
        <Tabs defaultValue="courses">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">{t.courses}</TabsTrigger>
            <TabsTrigger value="location">{t.location}</TabsTrigger>
            <TabsTrigger value="contact">{t.contact}</TabsTrigger>
            <TabsTrigger value="results">{t.results}</TabsTrigger>
          </TabsList>

          {/* Fanlar */}
          <TabsContent value="courses">
            {desc && (
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            )}
            <div className="space-y-2">
              {c.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-2xl border bg-card p-3.5"
                >
                  <div className="min-w-0">
                    <h4 className="truncate font-medium">
                      {locale === "uz" ? course.name : course.nameRu}
                    </h4>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {course.durationMonths} {t.months}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-primary">
                    {formatPrice(course.price, locale)}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Lokatsiya */}
          <TabsContent value="location">
            <div className="overflow-hidden rounded-2xl border">
              <div className="h-56 w-full">
                <DynamicMap
                  markers={[
                    {
                      id: c.id,
                      lat: c.latitude,
                      lng: c.longitude,
                      title: c.name,
                      subtitle: c.address,
                    },
                  ]}
                  zoom={15}
                  fit={false}
                  center={[c.latitude, c.longitude]}
                />
              </div>
            </div>
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => {
                haptic("medium");
                openLink(mapsUrl);
              }}
            >
              <Navigation className="h-4 w-4" />
              {t.openInMaps}
            </Button>
          </TabsContent>

          {/* Bog'lanish */}
          <TabsContent value="contact">
            <div className="space-y-2">
              <button
                onClick={() => {
                  haptic("medium");
                  openLink(`tel:${c.phone}`);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left active:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.call}</p>
                  <p className="font-medium">{c.phone}</p>
                </div>
              </button>

              {c.telegramUrl && (
                <button
                  onClick={() => {
                    haptic("medium");
                    openTelegramLink(c.telegramUrl!);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left active:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/15">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telegram</p>
                    <p className="font-medium">
                      {c.telegramUrl.replace("https://t.me/", "@")}
                    </p>
                  </div>
                </button>
              )}
            </div>
          </TabsContent>

          {/* Natijalar */}
          <TabsContent value="results">
            {c.results.length === 0 ? (
              <EmptyState title={t.empty} />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {c.results.map((rslt) => (
                  <div
                    key={rslt.id}
                    className="overflow-hidden rounded-2xl border bg-card"
                  >
                    <div className="relative h-28 w-full bg-secondary">
                      <Image
                        src={rslt.imageUrl}
                        alt={rslt.title}
                        fill
                        sizes="50vw"
                        className="object-cover"
                      />
                    </div>
                    <p className="truncate p-2 text-xs font-medium">
                      {rslt.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-transform active:scale-90"
      {...rest}
    >
      {children}
    </button>
  );
}
