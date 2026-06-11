"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  CenterForm,
  type CenterFormValues,
} from "@/components/admin/center-form";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/admin-api";

interface CenterFull extends CenterFormValues {
  id: string;
}

export default function EditCenterPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "center", id],
    queryFn: () => adminApi.get<CenterFull>(`/api/admin/centers/${id}`),
  });

  return (
    <AdminShell title="Markazni tahrirlash">
      {isLoading || !data ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <CenterForm
          centerId={id}
          initial={{
            name: data.name,
            description: data.description ?? "",
            descriptionRu: data.descriptionRu ?? "",
            districtId: data.districtId,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            phone: data.phone,
            telegramUrl: data.telegramUrl ?? "",
            logoUrl: data.logoUrl ?? "",
            photos: data.photos ?? [],
            rating: data.rating,
            isActive: data.isActive,
            courses: data.courses ?? [],
            results: data.results ?? [],
          }}
        />
      )}
    </AdminShell>
  );
}
