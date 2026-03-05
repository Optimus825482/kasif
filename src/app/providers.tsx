"use client";

import { LocaleProvider } from "@/context/locale-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConsentBanner } from "@/components/layout/consent-banner";
import { ServiceWorkerRegister } from "@/components/layout/sw-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <TooltipProvider>
        {children}
        <ConsentBanner />
        <ServiceWorkerRegister />
      </TooltipProvider>
    </LocaleProvider>
  );
}
