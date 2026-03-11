"use client";

import { useCallback, useEffect, useState } from "react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
}

function readConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("analytics_consent") === "true";
}

export function useAnalytics() {
  const [consent, setConsent] = useState(readConsent);

  useEffect(() => {
    const handler = () => setConsent(readConsent());
    window.addEventListener("analytics-consent-change", handler);
    return () =>
      window.removeEventListener("analytics-consent-change", handler);
  }, []);

  const trackEvent = useCallback(
    async (
      eventType: string,
      locationId?: string,
      metadata?: Record<string, unknown>,
    ) => {
      if (!consent) return;
      try {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType,
            locationId,
            sessionId: getSessionId(),
            metadata,
          }),
        });
      } catch {
        // silently fail
      }
    },
    [consent],
  );

  return { trackEvent };
}
