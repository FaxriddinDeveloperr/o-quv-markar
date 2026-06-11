"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/providers";

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useApp();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-9 w-9 text-destructive" />
      </div>
      <h3 className="text-base font-semibold">{t.error}</h3>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-5">
          {t.retry}
        </Button>
      )}
    </div>
  );
}
