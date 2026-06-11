import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  className,
  showValue = true,
}: {
  rating: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        className,
      )}
    >
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      {showValue && <span>{rating.toFixed(1)}</span>}
    </span>
  );
}
