"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/locale-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function ConsentBanner() {
  const { t } = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("analytics_consent");
    if (consent === null) setShow(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("analytics_consent", "true");
    window.dispatchEvent(new Event("analytics-consent-change"));
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("analytics_consent", "false");
    window.dispatchEvent(new Event("analytics-consent-change"));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4">
      <Card className="mx-auto max-w-lg p-4 shadow-lg border bg-background">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">{t("consent.title")}</p>
            <p className="text-xs text-muted-foreground mb-3">
              {t("consent.message")}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAccept}
                className="bg-teal-600 hover:bg-teal-700 text-xs h-7"
              >
                {t("consent.accept")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecline}
                className="text-xs h-7"
              >
                {t("consent.decline")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
