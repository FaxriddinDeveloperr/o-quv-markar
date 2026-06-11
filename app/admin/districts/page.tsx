"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/components/ui/use-toast";

interface RegionOpt { id: string; name: string }
interface District {
  id: string;
  name: string;
  nameRu: string;
  order: number;
  regionId: string;
  regionName: string;
  centersCount: number;
}

const ALL = "__all__";

export default function AdminDistrictsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filterRegion, setFilterRegion] = useState<string>(ALL);
  const [editing, setEditing] = useState<Partial<District> | null>(null);

  const regions = useQuery({
    queryKey: ["admin", "regions"],
    queryFn: () => adminApi.get<RegionOpt[]>("/api/admin/regions"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "districts", filterRegion],
    queryFn: () =>
      adminApi.get<District[]>(
        `/api/admin/districts${filterRegion !== ALL ? `?regionId=${filterRegion}` : ""}`,
      ),
  });

  const save = useMutation({
    mutationFn: (d: Partial<District>) =>
      d.id
        ? adminApi.patch(`/api/admin/districts/${d.id}`, d)
        : adminApi.post("/api/admin/districts", d),
    onSuccess: () => {
      toast({ variant: "success", title: "Saqlandi" });
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "districts"] });
    },
    onError: (e) =>
      toast({ variant: "destructive", title: "Xatolik", description: String(e) }),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/api/admin/districts/${id}`),
    onSuccess: () => {
      toast({ variant: "success", title: "O'chirildi" });
      qc.invalidateQueries({ queryKey: ["admin", "districts"] });
    },
    onError: (e) =>
      toast({ variant: "destructive", title: "Xatolik", description: String(e) }),
  });

  return (
    <AdminShell title="Tumanlar">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-64">
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Viloyat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Barcha viloyatlar</SelectItem>
              {regions.data?.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() =>
            setEditing({
              name: "",
              nameRu: "",
              order: 0,
              regionId: filterRegion !== ALL ? filterRegion : "",
            })
          }
        >
          <Plus className="h-4 w-4" />
          Yangi tuman
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi</TableHead>
                <TableHead className="hidden sm:table-cell">Viloyat</TableHead>
                <TableHead>Markazlar</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {d.regionName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{d.centersCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(d)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`"${d.name}" o'chirilsinmi?`))
                            del.mutate(d.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    Tuman topilmadi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Tahrirlash" : "Yangi tuman"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editing.regionId) {
                  toast({ variant: "destructive", title: "Viloyat tanlang" });
                  return;
                }
                save.mutate(editing);
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label>Viloyat</Label>
                <Select
                  value={editing.regionId ?? ""}
                  onValueChange={(v) =>
                    setEditing({ ...editing, regionId: v })
                  }
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
              </div>
              <div className="space-y-1.5">
                <Label>Nomi (UZ)</Label>
                <Input
                  value={editing.name ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nomi (RU)</Label>
                <Input
                  value={editing.nameRu ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, nameRu: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tartib</Label>
                <Input
                  type="number"
                  value={editing.order ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, order: Number(e.target.value) })
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={save.isPending}>
                Saqlash
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
