import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value?: number | null;
  icon: LucideIcon;
  color: string;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
  trend,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="mt-2">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold">{value ?? 0}</p>
              )}
            </div>
            {trend && !loading && (
              <p
                className={cn(
                  "mt-2 text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600",
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}% o'zgarish
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              color,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
