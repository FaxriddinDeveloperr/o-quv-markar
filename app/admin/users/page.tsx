"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Phone, Heart, Eye, Copy, Check } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserDetailModal } from "@/components/admin/user-detail-modal";
import { Pagination } from "@/components/admin/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

interface UserRow {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  languageCode: string | null;
  favoritesCount: number;
  leadsCount: number;
  createdAt: string;
}

interface Resp {
  items: UserRow[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page, q],
    queryFn: () =>
      adminApi.get<Resp>(
        `/api/admin/users?page=${page}&search=${encodeURIComponent(q)}`,
      ),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQ(search);
  };

  const handleViewUser = (user: UserRow) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  const copyToClipboard = (text: string, userId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminShell title="Foydalanuvchilar">
      {/* Searchva info */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              Jami foydalanuvchilar
            </h2>
            <p className="text-2xl font-bold">{data?.totalCount ?? 0}</p>
          </div>
          <form
            onSubmit={handleSearch}
            className="relative w-full sm:max-w-xs"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, username, telefon..."
              className="pl-9"
            />
          </form>
        </div>
      </div>

      {/* Jadval */}
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-base">Foydalanuvchilar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Eye className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-muted-foreground">Foydalanuvchi topilmadi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/30">
                    <TableHead className="font-semibold">Foydalanuvchi</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">
                      Telefon
                    </TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">
                      Telegram ID
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Sevimli
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      So'rovlar
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Harakatlar
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium leading-none">
                            {u.firstName} {u.lastName || ""}
                          </div>
                          <div className="mt-1.5 text-xs text-muted-foreground">
                            {u.username ? `@${u.username}` : `ID: ${u.telegramId}`}
                          </div>
                          {u.languageCode && (
                            <Badge variant="outline" className="mt-1.5">
                              {u.languageCode.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {u.phone ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {u.phone}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs">
                        <button
                          onClick={() => copyToClipboard(u.telegramId, u.id)}
                          className="flex items-center gap-1 rounded px-2 py-1 hover:bg-muted"
                        >
                          {copiedId === u.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-600" />
                              Nusxa
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              {u.telegramId}
                            </>
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Heart className="h-4 w-4 text-rose-500" />
                          <span className="font-medium">{u.favoritesCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{u.leadsCount}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(u)}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={setPage}
          />
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        open={openModal}
        onOpenChange={setOpenModal}
        user={
          selectedUser
            ? {
                ...selectedUser,
                favoritesCount: selectedUser.favoritesCount,
                leadsCount: selectedUser.leadsCount,
              }
            : undefined
        }
      />
    </AdminShell>
  );
}
