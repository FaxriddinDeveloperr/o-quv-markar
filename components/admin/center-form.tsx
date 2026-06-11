"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Plus, Trash2, Upload, Loader2, X, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicMapPicker } from "@/components/admin/dynamic-map-picker";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/components/ui/use-toast";

interface Course {
  name: string;
  nameRu: string;
  price: number;
  durationMonths: number;
  description?: string | null;
}
interface Result {
  title: string;
  imageUrl: string;
}
export interface CenterFormValues {
  name: string;
  description?: string | null;
  descriptionRu?: string | null;
  districtId: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  telegramUrl?: string | null;
  logoUrl?: string | null;
  photos: string[];
  rating: number;
  isActive: boolean;
  courses: Course[];
  results: Result[];
}

interface RegionOpt { id: string; name: string }
interface DistrictOpt { id: string; name: string; regionId: string; regionName: string }

const empty: CenterFormValues = {
  name: "",
  description: "",
  descriptionRu: "",
  districtId: "",
  address: "",
  latitude: 41.3111,
  longitude: 69.2797,
  phone: "",
  telegramUrl: "",
  logoUrl: "",
  photos: [],
  rating: 0,
  isActive: true,
  courses: [],
  results: [],
};

export function CenterForm({
  initial,
  centerId,
  initialRegionId,
}: {
  initial?: CenterFormValues;
  centerId?: string;
  initialRegionId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [v, setV] = useState<CenterFormValues>(initial ?? empty);
  const [regionId, setRegionId] = useState(initialRegionId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regions = useQuery({
    queryKey: ["admin", "regions"],
    queryFn: () => adminApi.get<RegionOpt[]>("/api/admin/regions"),
  });
  const districts = useQuery({
    queryKey: ["admin", "districts", regionId],
    queryFn: () =>
      adminApi.get<DistrictOpt[]>(
        `/api/admin/districts${regionId ? `?regionId=${regionId}` : ""}`,
      ),
    enabled: !!regionId,
  });

  // Tahrirlashda mavjud tuman -> region'ni aniqlash
  const allDistricts = useQuery({
    queryKey: ["admin", "districts", "all"],
    queryFn: () => adminApi.get<DistrictOpt[]>("/api/admin/districts"),
    enabled: !!initial && !initialRegionId,
  });
  useEffect(() => {
    if (initial && !regionId && allDistricts.data) {
      const d = allDistricts.data.find((x) => x.id === initial.districtId);
      if (d) setRegionId(d.regionId);
    }
  }, [initial, regionId, allDistricts.data]);

  const set = <K extends keyof CenterFormValues>(
    k: K,
    val: CenterFormValues[K],
  ) => setV((p) => ({ ...p, [k]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!v.name || !v.districtId || !v.address || !v.phone) {
      setError("Nom, tuman, manzil va telefon to'ldirilishi shart");
      return;
    }
    setSaving(true);
    try {
      if (centerId) {
        await adminApi.patch(`/api/admin/centers/${centerId}`, v);
      } else {
        await adminApi.post("/api/admin/centers", v);
      }
      toast({ variant: "success", title: "Saqlandi" });
      router.push("/admin/centers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 pb-10">
      {/* Asosiy ma'lumot */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-semibold">Asosiy ma'lumot</h2>
          <Field label="Markaz nomi *">
            <Input value={v.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefon *">
              <Input
                value={v.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+998..."
              />
            </Field>
            <Field label="Telegram (URL)">
              <Input
                value={v.telegramUrl ?? ""}
                onChange={(e) => set("telegramUrl", e.target.value)}
                placeholder="https://t.me/..."
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Viloyat *">
              <Select
                value={regionId}
                onValueChange={(val) => {
                  setRegionId(val);
                  set("districtId", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {regions.data?.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tuman *">
              <Select
                value={v.districtId}
                onValueChange={(val) => set("districtId", val)}
                disabled={!regionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {districts.data?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Manzil *">
            <Input
              value={v.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tavsif (UZ)">
              <Textarea
                value={v.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label="Tavsif (RU)">
              <Textarea
                value={v.descriptionRu ?? ""}
                onChange={(e) => set("descriptionRu", e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reyting (0-5)">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={v.rating}
                onChange={(e) => set("rating", Number(e.target.value))}
              />
            </Field>
            <Field label="Holat">
              <label className="flex h-11 items-center gap-2 rounded-xl border px-4">
                <input
                  type="checkbox"
                  checked={v.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="h-4 w-4 accent-violet-600"
                />
                <span className="text-sm">Faol (foydalanuvchilarga ko'rinadi)</span>
              </label>
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Rasmlar */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-semibold">Rasmlar</h2>
          <Field label="Logo">
            <ImageUpload
              value={v.logoUrl ?? ""}
              onChange={(url) => set("logoUrl", url)}
            />
          </Field>
          <Field label="Foto galereya">
            <MultiImageUpload
              values={v.photos}
              onChange={(photos) => set("photos", photos)}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Lokatsiya */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <MapPinned className="h-4 w-4 text-primary" />
            Lokatsiya (xaritadan nuqta tanlang)
          </h2>
          <div className="h-64 overflow-hidden rounded-xl border">
            <DynamicMapPicker
              lat={v.latitude}
              lng={v.longitude}
              onChange={(lat, lng) => {
                set("latitude", lat);
                set("longitude", lng);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <Input
                type="number"
                step="any"
                value={v.latitude}
                onChange={(e) => set("latitude", Number(e.target.value))}
              />
            </Field>
            <Field label="Longitude">
              <Input
                type="number"
                step="any"
                value={v.longitude}
                onChange={(e) => set("longitude", Number(e.target.value))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Kurslar */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Kurslar / Fanlar</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                set("courses", [
                  ...v.courses,
                  { name: "", nameRu: "", price: 0, durationMonths: 1 },
                ])
              }
            >
              <Plus className="h-4 w-4" />
              Qo'shish
            </Button>
          </div>
          {v.courses.map((c, i) => (
            <div key={i} className="rounded-xl border p-3">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    set("courses", v.courses.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Nom (UZ)"
                  value={c.name}
                  onChange={(e) =>
                    updateItem("courses", i, { name: e.target.value })
                  }
                />
                <Input
                  placeholder="Nom (RU)"
                  value={c.nameRu}
                  onChange={(e) =>
                    updateItem("courses", i, { nameRu: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Narx (so'm)"
                  value={c.price}
                  onChange={(e) =>
                    updateItem("courses", i, { price: Number(e.target.value) })
                  }
                />
                <Input
                  type="number"
                  placeholder="Davomiyligi (oy)"
                  value={c.durationMonths}
                  onChange={(e) =>
                    updateItem("courses", i, {
                      durationMonths: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          ))}
          {v.courses.length === 0 && (
            <p className="text-sm text-muted-foreground">Kurs qo'shilmagan</p>
          )}
        </CardContent>
      </Card>

      {/* Natijalar */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Natijalar / Sertifikatlar</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                set("results", [...v.results, { title: "", imageUrl: "" }])
              }
            >
              <Plus className="h-4 w-4" />
              Qo'shish
            </Button>
          </div>
          {v.results.map((r, i) => (
            <div key={i} className="flex gap-3 rounded-xl border p-3">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Sarlavha"
                  value={r.title}
                  onChange={(e) =>
                    updateItem("results", i, { title: e.target.value })
                  }
                />
                <ImageUpload
                  value={r.imageUrl}
                  onChange={(url) => updateItem("results", i, { imageUrl: url })}
                  compact
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  set("results", v.results.filter((_, j) => j !== i))
                }
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ))}
          {v.results.length === 0 && (
            <p className="text-sm text-muted-foreground">Natija qo'shilmagan</p>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="sticky bottom-0 flex gap-2 border-t bg-background/95 py-3 backdrop-blur">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Saqlash
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Bekor qilish
        </Button>
      </div>
    </form>
  );

  function updateItem(
    key: "courses" | "results",
    index: number,
    patch: Partial<Course & Result>,
  ) {
    setV((p) => ({
      ...p,
      [key]: (p[key] as (Course | Result)[]).map((it, j) =>
        j === index ? { ...it, ...patch } : it,
      ),
    }));
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ImageUpload({
  value,
  onChange,
  compact,
}: {
  value: string;
  onChange: (url: string) => void;
  compact?: boolean;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { url } = await adminApi.upload(file);
      onChange(url);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Yuklashda xato",
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative h-16 w-16 overflow-hidden rounded-xl border">
          <Image src={value} alt="" fill className="object-cover" sizes="64px" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-0 top-0 bg-black/50 p-0.5"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-xl border border-dashed ${
            compact ? "h-12 w-12" : "h-16 w-16"
          }`}
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <label className="cursor-pointer">
        <span className="inline-flex h-9 items-center rounded-lg border px-3 text-sm">
          {loading ? "Yuklanmoqda..." : "Rasm tanlash"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
      </label>
    </div>
  );
}

function MultiImageUpload({
  values,
  onChange,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setLoading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const { url } = await adminApi.upload(f);
        urls.push(url);
      }
      onChange([...values, ...urls]);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Yuklashda xato",
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((url, i) => (
          <div
            key={i}
            className="relative h-16 w-16 overflow-hidden rounded-xl border"
          >
            <Image src={url} alt="" fill className="object-cover" sizes="64px" />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="absolute right-0 top-0 bg-black/50 p-0.5"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border border-dashed">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Plus className="h-5 w-5 text-muted-foreground" />
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFiles}
          />
        </label>
      </div>
    </div>
  );
}
