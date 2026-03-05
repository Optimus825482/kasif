"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Module-level state shared across all hook instances
let globalPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
let snapshotVersion = 0;

function notify() {
  snapshotVersion++;
  listeners.forEach((fn) => fn());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return snapshotVersion;
}

function getServerSnapshot() {
  return 0;
}

// Global listeners — safe because of typeof window check
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalPrompt = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    globalPrompt = null;
    notify();
  });
}

export function usePwaInstall() {
  // Re-render whenever globalPrompt changes
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsInstalled(mq.matches || (navigator as any).standalone === true);

    const handler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const canInstall = globalPrompt !== null && !isInstalled;

  const install = useCallback(async () => {
    if (!globalPrompt) return false;
    await globalPrompt.prompt();
    const { outcome } = await globalPrompt.userChoice;
    if (outcome === "accepted") {
      globalPrompt = null;
      notify();
      return true;
    }
    return false;
  }, []);

  return { canInstall, isInstalled, install };
}
