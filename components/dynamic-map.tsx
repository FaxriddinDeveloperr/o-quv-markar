"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Leaflet faqat brauzerda ishlaydi — SSR o'chirilgan
export const DynamicMap = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});
