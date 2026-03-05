"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/locale-context";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function Header() {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Dijital Kaşif Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div>
            <span className="font-bold text-sm leading-none">
              Dijital Kaşif
            </span>
            <span className="block text-[10px] text-muted-foreground leading-none mt-0.5">
              Balıkesir
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">{t("nav.map")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explore">{t("nav.explore")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/about">{t("nav.about")}</Link>
          </Button>
        </nav>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
          className="h-8 gap-1.5"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {locale === "tr" ? "EN" : "TR"}
          </span>
        </Button>
      </div>
    </header>
  );
}
