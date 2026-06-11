"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CenterDetailDTO,
  CenterListItemDTO,
  DistrictDTO,
  RegionDTO,
  SortOption,
  SubjectDTO,
} from "@/lib/types";

export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: () => api.get<RegionDTO[]>("/api/regions"),
  });
}

export function useDistricts(regionId: string | null) {
  return useQuery({
    queryKey: ["districts", regionId],
    queryFn: () =>
      api.get<DistrictDTO[]>(`/api/regions/${regionId}/districts`),
    enabled: !!regionId,
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => api.get<SubjectDTO[]>("/api/subjects"),
  });
}

export interface CentersQuery {
  districtId?: string;
  search?: string;
  subject?: string;
  sort?: SortOption;
  lat?: number;
  lng?: number;
  favorite?: boolean;
  popular?: boolean;
}

function centersPath(q: CentersQuery): string {
  const p = new URLSearchParams();
  if (q.districtId) p.set("districtId", q.districtId);
  if (q.search) p.set("search", q.search);
  if (q.subject) p.set("subject", q.subject);
  if (q.sort) p.set("sort", q.sort);
  if (q.lat != null && q.lng != null) {
    p.set("lat", String(q.lat));
    p.set("lng", String(q.lng));
  }
  if (q.favorite) p.set("favorite", "1");
  if (q.popular) p.set("popular", "1");
  const qs = p.toString();
  return `/api/centers${qs ? `?${qs}` : ""}`;
}

export function useCenters(q: CentersQuery, enabled = true) {
  return useQuery({
    queryKey: ["centers", q],
    queryFn: () => api.get<CenterListItemDTO[]>(centersPath(q)),
    enabled,
  });
}

export function useCenter(id: string | null) {
  return useQuery({
    queryKey: ["center", id],
    queryFn: () => api.get<CenterDetailDTO>(`/api/centers/${id}`),
    enabled: !!id,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { centerId: string; isFavorite: boolean }) =>
      vars.isFavorite
        ? api.delete(`/api/favorites/${vars.centerId}`)
        : api.post(`/api/favorites/${vars.centerId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["centers"] });
      qc.invalidateQueries({ queryKey: ["center"] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useCreateLead() {
  return useMutation({
    mutationFn: (vars: {
      centerId: string;
      name: string;
      phone: string;
      note?: string;
    }) => api.post("/api/leads", vars),
  });
}
