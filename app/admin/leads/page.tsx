"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/admin/pagination";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

interface Lead {
  id: string;
  name: string;
  phone: string;
  note: string | null;
  status: "NEW" | "CONTACTED" | "DONE";
  centerName: string;
  createdAt: string;
}
interface Resp {
  items: Lead[];
  page: number;
  totalPages: number;
}

const STATUSES = [
  { value: "NEW", label: "Yangi" },
  { value: "CONTACTED", label: "Bog'lanildi" },
  { value: "DONE", label: "Yakunlandi" },
];
const ALL = "__all__";

export default function AdminLeadsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(ALL);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", page, status],
    queryFn: () =>
      adminApi.get<Resp>(
        `/api/admin/leads?page=${page}${status !== ALL ? `&status=${status}` : ""}`,
      ),
  });

  const update = useMutation({
    mutationFn: (v: { id: string; status: string }) =>
      adminApi.patch(`/api/admin/leads/${v.id}`, { status: v.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/api/admin/leads/${id}`),
    onSuccess: () => {
      toast({ variant: "success", title: "O'chirildi" });
      qc.invalidateQueries({ queryKey: ["admin", "leads"] });
    },
  });

  return (
    <AdminShell title="So'rovlar (Lead)">
      <div className="mb-4 sm:w-56">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Holat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Barchasi</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ism / Telefon</TableHead>
                <TableHead className="hidden md:table-cell">Markaz</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="font-medium">{l.name}</div>
                    <a
                      href={`tel:${l.phone}`}
                      className="inline-flex items-center gap-1 text-xs text-primary"
                    >
                      <Phone className="h-3 w-3" />
                      {l.phone}
                    </a>
                    {l.note && (
                      <div className="text-xs text-muted-foreground">
                        {l.note}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {l.centerName}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={l.status}
                      onValueChange={(v) =>
                        update.mutate({ id: l.id, status: v })
                      }
                    >
                      <SelectTrigger className="h-9 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("O'chirilsinmi?")) del.mutate(l.id);
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
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    So'rov yo'q
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {data && (
        <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
      )}
    </AdminShell>
  );
}
