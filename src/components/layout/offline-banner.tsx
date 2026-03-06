"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { useLocale } from "@/context/locale-context";

export function OfflineBanner() {
  const { t } = useLocale();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    setIsOffline(!navigator.onLine);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="bg-amber-500/90 text-amber-950 text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      {t("offline.message")}
    </div>
  );
}
