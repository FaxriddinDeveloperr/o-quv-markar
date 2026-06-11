"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Phone, Heart } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Pagination } from "@/components/admin/pagination";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface UserRow {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  favoritesCount: number;
  createdAt: string;
}
interface Resp {
  items: UserRow[];
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page, q],
    queryFn: () =>
      adminApi.get<Resp>(
        `/api/admin/users?page=${page}&search=${encodeURIComponent(q)}`,
      ),
  });

  return (
    <AdminShell title="Foydalanuvchilar">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQ(search);
        }}
        className="relative mb-4 sm:max-w-xs"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, username yoki telefon..."
          className="pl-9"
        />
      </form>

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foydalanuvchi</TableHead>
                <TableHead className="hidden sm:table-cell">Telefon</TableHead>
                <TableHead className="hidden md:table-cell">Username</TableHead>
                <TableHead>Saqlangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">
                      {u.firstName} {u.lastName ?? ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {u.telegramId}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {u.phone ? (
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Phone className="h-3.5 w-3.5" />
                        {u.phone}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {u.username ? `@${u.username}` : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      {u.favoritesCount}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    Foydalanuvchi topilmadi
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
