"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/components/providers";
import { useSubjects } from "@/lib/hooks";
import { hapticSelection } from "@/lib/telegram-client";
import type { SortOption } from "@/lib/types";

const ALL = "__all__";

export function FilterSortBar({
  subject,
  onSubjectChange,
  sort,
  onSortChange,
  showDistanceSort = false,
}: {
  subject: string | undefined;
  onSubjectChange: (v: string | undefined) => void;
  sort: SortOption | undefined;
  onSortChange: (v: SortOption) => void;
  showDistanceSort?: boolean;
}) {
  const { t, locale } = useApp();
  const subjects = useSubjects();

  return (
    <div className="flex gap-2">
      <Select
        value={subject ?? ALL}
        onValueChange={(v) => {
          hapticSelection();
          onSubjectChange(v === ALL ? undefined : v);
        }}
      >
        <SelectTrigger className="h-10 flex-1">
          <SelectValue placeholder={t.filterSubject} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t.allSubjects}</SelectItem>
          {subjects.data?.map((s) => (
            <SelectItem key={s.name} value={s.name}>
              {locale === "uz" ? s.name : s.nameRu}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sort ?? "rating"}
        onValueChange={(v) => {
          hapticSelection();
          onSortChange(v as SortOption);
        }}
      >
        <SelectTrigger className="h-10 flex-1">
          <SelectValue placeholder={t.sortBy} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">{t.sortRating}</SelectItem>
          <SelectItem value="priceAsc">{t.sortPriceAsc}</SelectItem>
          <SelectItem value="priceDesc">{t.sortPriceDesc}</SelectItem>
          {showDistanceSort && (
            <SelectItem value="distance">{t.distance}</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
