"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, Info, Download } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import { usePwaInstall } from "@/hooks/use-pwa-install";

const NAV_ITEMS = [
  {
    href: "/",
    icon: Map,
    labelKey: "nav.map",
    color: "text-teal-500",
    activeBg: "bg-teal-50",
    activeColor: "text-teal-600",
    activeLabelColor: "text-teal-700",
  },
  {
    href: "/explore",
    icon: Compass,
    labelKey: "nav.explore",
    color: "text-blue-500",
    activeBg: "bg-blue-50",
    activeColor: "text-blue-600",
    activeLabelColor: "text-blue-700",
  },
  {
    href: "/about",
    icon: Info,
    labelKey: "nav.about",
    color: "text-purple-500",
    activeBg: "bg-purple-50",
    activeColor: "text-purple-600",
    activeLabelColor: "text-purple-700",
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { canInstall, install } = usePwaInstall();

  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/80 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map(
            ({
              href,
              icon: Icon,
              labelKey,
              color,
              activeBg,
              activeColor,
              activeLabelColor,
            }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-200 ${
                    isActive ? activeColor : `${color} hover:opacity-80`
                  }`}
                >
                  <div
                    className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                      isActive ? activeBg : ""
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  </div>
                  <span
                    className={`text-[10px] leading-none font-medium ${isActive ? activeLabelColor : ""}`}
                  >
                    {t(labelKey)}
                  </span>
                </Link>
              );
            },
          )}

          {canInstall && (
            <button
              onClick={install}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-200 text-emerald-500 hover:opacity-80"
            >
              <div className="relative p-1.5 rounded-xl">
                <Download className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] leading-none font-medium">
                Yükle
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
