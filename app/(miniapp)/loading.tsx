import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 px-4 pt-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-40" />
        </div>
        <Skeleton className="h-9 w-16 rounded-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-3">
        <Skeleton className="h-44 w-[220px] rounded-2xl" />
        <Skeleton className="h-44 w-[220px] rounded-2xl" />
      </div>
    </div>
  );
}
