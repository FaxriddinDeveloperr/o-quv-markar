"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  AtSign,
  Calendar,
  Heart,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    telegramId: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
    phone: string | null;
    languageCode: string | null;
    createdAt: string;
    favoritesCount?: number;
    leadsCount?: number;
  };
}

export function UserDetailModal({
  open,
  onOpenChange,
  user,
}: UserDetailModalProps) {
  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName || ""}`.trim();
  const telegramLink = `https://t.me/${user.username}`;
  const createdDate = new Date(user.createdAt).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Foydalanuvchi ma'lumoti</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profil qismi */}
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-2xl font-bold text-white">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="text-sm text-muted-foreground">ID: {user.telegramId}</p>
              {user.username && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto p-0"
                  asChild
                >
                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    @{user.username}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Asosiy ma'lumotlar */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Telefon</p>
                    <p className="truncate font-medium">
                      {user.phone || "Qo'shilmagan"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AtSign className="h-5 w-5 text-purple-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="truncate font-medium">
                      {user.username ? `@${user.username}` : "Yo'q"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Ro'yxatdan o'tgan</p>
                    <p className="truncate text-sm font-medium">{createdDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-orange-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Til</p>
                    <p className="truncate font-medium">
                      {user.languageCode ? user.languageCode.toUpperCase() : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistika */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-rose-600" />
                    <span className="text-sm font-medium">Sevimli markazlar</span>
                  </div>
                  <span className="text-2xl font-bold">{user.favoritesCount || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">So'rovlar</span>
                  </div>
                  <span className="text-2xl font-bold">{user.leadsCount || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Telegram profili */}
          {user.username && (
            <Card>
              <CardContent className="pt-6">
                <p className="mb-3 text-sm font-medium">Telegram profili</p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    Telegram'da ko'rish
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
