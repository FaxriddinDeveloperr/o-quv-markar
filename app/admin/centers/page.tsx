"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Eye, Star } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/admin/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

interface CenterRow {
  id: string;
  name: string;
  districtName: string;
  regionName: string;
  phone: string;
  rating: number;
  viewsCount: number;
  coursesCount: number;
  isActive: boolean;
}
interface ListResp {
  items: CenterRow[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminCentersPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "centers", page, q],
    queryFn: () =>
      adminApi.get<ListResp>(
        `/api/admin/centers?page=${page}&search=${encodeURIComponent(q)}`,
      ),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/api/admin/centers/${id}`),
    onSuccess: () => {
      toast({ variant: "success", title: "O'chirildi" });
      qc.invalidateQueries({ queryKey: ["admin", "centers"] });
    },
    onError: (e) =>
      toast({ variant: "destructive", title: "Xatolik", description: String(e) }),
  });

  return (
    <AdminShell title="Markazlar">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQ(search);
          }}
          className="relative flex-1 sm:max-w-xs"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="pl-9"
          />
        </form>
        <Button asChild>
          <Link href="/admin/centers/new">
            <Plus className="h-4 w-4" />
            Yangi markaz
          </Link>
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi</TableHead>
                <TableHead className="hidden md:table-cell">Hudud</TableHead>
                <TableHead className="hidden sm:table-cell">Reyting</TableHead>
                <TableHead className="hidden lg:table-cell">Ko'rishlar</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.coursesCount} kurs · {c.phone}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">{c.districtName}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.regionName}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {c.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      {c.viewsCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    {c.isActive ? (
                      <Badge variant="success">Faol</Badge>
                    ) : (
                      <Badge variant="muted">Nofaol</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/centers/${c.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`"${c.name}" o'chirilsinmi?`))
                            del.mutate(c.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Markaz topilmadi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onChange={setPage}
        />
      )}
    </AdminShell>
  );
}
