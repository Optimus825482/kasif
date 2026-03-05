"use client";

import { useCallback, useRef } from "react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
}

export function useAnalytics() {
  const consentRef = useRef<boolean>(
    typeof window !== "undefined"
      ? localStorage.getItem("analytics_consent") === "true"
      : false,
  );

  const trackEvent = useCallback(
    async (
      eventType: string,
      locationId?: string,
      metadata?: Record<string, unknown>,
    ) => {
      if (!consentRef.current) return;
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
    [],
  );

  return { trackEvent };
}
