"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneCall, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/components/providers";
import { useCreateLead } from "@/lib/hooks";
import { useToast } from "@/components/ui/use-toast";
import { hapticNotify } from "@/lib/telegram-client";

export function LeadDialog({
  centerId,
  trigger,
}: {
  centerId: string;
  trigger: React.ReactNode;
}) {
  const { t, user } = useApp();
  const { toast } = useToast();
  const createLead = useCreateLead();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [name, setName] = useState(user?.first_name ?? "");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError(t.yourName);
      return;
    }
    if (!/^[+0-9\s()-]{7,20}$/.test(phone.trim())) {
      setError(t.yourPhone);
      return;
    }
    createLead.mutate(
      { centerId, name: name.trim(), phone: phone.trim(), note: note.trim() || undefined },
      {
        onSuccess: () => {
          hapticNotify("success");
          setDone(true);
          toast({ variant: "success", title: t.sent, description: t.leadSuccess });
          setTimeout(() => {
            setOpen(false);
            setTimeout(() => setDone(false), 300);
          }, 1400);
        },
        onError: () => {
          hapticNotify("error");
          setError(t.error);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"
            >
              <Check className="h-8 w-8" />
            </motion.div>
            <h3 className="text-lg font-semibold">{t.sent}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.leadSuccess}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-primary" />
                {t.requestCall}
              </DialogTitle>
              <DialogDescription>{t.requestCallDesc}</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="lead-name">{t.yourName}</Label>
                <Input
                  id="lead-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.yourName}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-phone">{t.yourPhone}</Label>
                <Input
                  id="lead-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-note">{t.note}</Label>
                <Textarea
                  id="lead-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={createLead.isPending}
              >
                {createLead.isPending ? t.loading : t.send}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
