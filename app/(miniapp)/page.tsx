"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Map, LayoutGrid, ChevronRight, Sparkles, Search } from "lucide-react";
import { useApp } from "@/components/providers";
import { useCenters } from "@/lib/hooks";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  CenterCard,
  CenterCardSkeleton,
} from "@/components/center-card";
import { haptic } from "@/lib/telegram-client";

export default function HomePage() {
  const { t, user } = useApp();
  const reduce = useReducedMotion();
  const popular = useCenters({ popular: true });

  const ease = [0.16, 1, 0.3, 1] as const;
  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease, delay },
        };

  return (
    <div className="px-4 pt-5">
      {/* Header */}
      <motion.header
        {...fade(0)}
        className="flex items-start justify-between gap-3"
      >
        <div>
          <p className="text-sm text-muted-foreground">{t.greeting} 👋</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {user?.first_name ?? t.appName}
          </h1>
        </div>
        <LanguageSwitcher />
      </motion.header>

      {/* Search — bosilganda qidiruv sahifasi ochiladi (u yerda jonli qidiruv) */}
      <motion.div {...fade(0.05)} className="mt-4">
        <Link
          href="/search"
          onClick={() => haptic("light")}
          className="relative flex h-12 w-full items-center rounded-2xl border border-input bg-card pl-12 pr-4 text-base text-muted-foreground shadow-sm transition-shadow active:bg-muted"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          {t.searchPlaceholder}
        </Link>
      </motion.div>

      {/* Big action cards */}
      <motion.div {...fade(0.1)} className="mt-5 grid grid-cols-2 gap-3">
        <BigCard
          href="/map"
          icon={<Map className="h-7 w-7" />}
          title={t.searchByMap}
          desc={t.searchByMapDesc}
          gradient="gradient-primary"
        />
        <BigCard
          href="/districts"
          icon={<LayoutGrid className="h-7 w-7" />}
          title={t.searchByDistrict}
          desc={t.searchByDistrictDesc}
          gradient="bg-gradient-to-br from-rose-500 to-orange-400"
        />
      </motion.div>

      {/* Popular centers */}
      <motion.section {...fade(0.15)} className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            {t.popular}
          </h2>
          <Link
            href="/search"
            onClick={() => haptic("light")}
            className="flex items-center text-sm font-medium text-primary"
          >
            {t.seeAll}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {popular.isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <CenterCardSkeleton key={i} variant="compact" />
            ))}
          {popular.data?.map((c) => (
            <CenterCard key={c.id} center={c} variant="compact" />
          ))}
        </div>
      </motion.section>
    </div>
  );
}

function BigCard({
  href,
  icon,
  title,
  desc,
  gradient,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div whileTap={reduce ? {} : { scale: 0.97 }}>
      <Link
        href={href}
        onClick={() => haptic("medium")}
        className={`flex h-40 flex-col justify-between rounded-3xl p-4 text-white shadow-soft ${gradient}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold leading-tight">{title}</h3>
          <p className="mt-0.5 text-xs text-white/85">{desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}
