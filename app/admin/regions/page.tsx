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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/components/ui/use-toast";

interface Region {
  id: string;
  name: string;
  nameRu: string;
  order: number;
  districtsCount: number;
}

export default function AdminRegionsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Partial<Region> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "regions", "full"],
    queryFn: () => adminApi.get<Region[]>("/api/admin/regions"),
  });

  const save = useMutation({
    mutationFn: (r: Partial<Region>) =>
      r.id
        ? adminApi.patch(`/api/admin/regions/${r.id}`, r)
        : adminApi.post("/api/admin/regions", r),
    onSuccess: () => {
      toast({ variant: "success", title: "Saqlandi" });
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "regions"] });
    },
    onError: (e) =>
      toast({ variant: "destructive", title: "Xatolik", description: String(e) }),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/api/admin/regions/${id}`),
    onSuccess: () => {
      toast({ variant: "success", title: "O'chirildi" });
      qc.invalidateQueries({ queryKey: ["admin", "regions"] });
    },
    onError: (e) =>
      toast({ variant: "destructive", title: "Xatolik", description: String(e) }),
  });

  return (
    <AdminShell title="Viloyatlar">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing({ name: "", nameRu: "", order: 0 })}>
          <Plus className="h-4 w-4" />
          Yangi viloyat
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi (UZ)</TableHead>
                <TableHead className="hidden sm:table-cell">Nomi (RU)</TableHead>
                <TableHead>Tumanlar</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {r.nameRu}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.districtsCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(r)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`"${r.name}" o'chirilsinmi? Barcha tumanlari ham o'chadi!`))
                            del.mutate(r.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Tahrirlash" : "Yangi viloyat"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
              className="space-y-3"
            >
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
