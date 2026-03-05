"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function PwaInstallPrompt() {
  const { canInstall, install } = usePwaInstall();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (canInstall && !localStorage.getItem("pwa-dismissed")) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall]);

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  if (!showBanner || !canInstall) return null;

  return (
    <div
      className="fixed z-[9999] animate-in slide-in-from-bottom-4"
      style={{
        bottom: 80,
        left: 12,
        right: 12,
        maxWidth: 320,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 p-3 flex items-center gap-3">
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Download className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900">
            Uygulamayı Yükle
          </p>
          <p className="text-[10px] text-gray-500 leading-tight">
            Ana ekranına ekle
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Yükle
        </button>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
