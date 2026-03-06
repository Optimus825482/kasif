"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useLocale } from "@/context/locale-context";

interface ErrorRetryProps {
  message?: string;
  onRetry: () => void;
  className?: string;
}

export function ErrorRetry({
  message,
  onRetry,
  className = "",
}: ErrorRetryProps) {
  const { t } = useLocale();
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center ${className}`}
      role="alert"
    >
      <AlertCircle className="h-10 w-10 text-destructive/80" aria-hidden />
      <p className="text-sm text-muted-foreground">
        {message ?? t("common.error")}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} aria-label={t("common.retry")}>
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        {t("common.retry")}
      </Button>
    </div>
  );
}
