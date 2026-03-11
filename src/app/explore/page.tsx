"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import type { Location, Category } from "@/types";
import { useLocale } from "@/context/locale-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useAnalytics } from "@/hooks/use-analytics";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorRetry } from "@/components/ui/error-retry";
import { Search, MapPin, Star, ChevronRight } from "lucide-react";

export default function ExplorePage() {
  const { locale, t } = useLocale();
  const { trackEvent } = useAnalytics();
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setError(null);
    setLoading(true);
    Promise.all([
      fetch("/api/locations/all").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([locRes, catRes]) => {
        if (locRes.success) setLocations(locRes.data ?? []);
        else setError(locRes.error ?? "Veriler yüklenemedi");
        if (catRes.success) setCategories(catRes.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Bağlantı hatası.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (debouncedSearch && trackEvent) {
      const filtered = locations.filter((loc) => {
        const name = locale === "en" ? loc.nameEn : loc.name;
        return name.toLowerCase().includes(debouncedSearch.toLowerCase());
      });
      trackEvent("search", undefined, {
        query: debouncedSearch,
        resultCount: filtered.length,
      });
    }
  }, [debouncedSearch, locale, locations, trackEvent]);

  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      const name = locale === "en" ? loc.nameEn : loc.name;
      const matchSearch =
        !debouncedSearch ||
        name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchCat = !activeCategory || loc.category.slug === activeCategory;
      return matchSearch && matchCat;
    });
  }, [locations, locale, debouncedSearch, activeCategory]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto p-4 pb-20 md:pb-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{t("nav.explore")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("app.description")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("map.searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
              className={
                activeCategory === null ? "bg-teal-600 hover:bg-teal-700" : ""
              }
            >
              {t("categories.all")}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={activeCategory === cat.slug ? "default" : "outline"}
                onClick={() =>
                  setActiveCategory(
                    activeCategory === cat.slug ? null : cat.slug,
                  )
                }
                style={
                  activeCategory === cat.slug
                    ? { backgroundColor: cat.color }
                    : {}
                }
              >
                {locale === "en" ? cat.nameEn : cat.name}
              </Button>
            ))}
          </div>
        </div>

        {error ? (
          <ErrorRetry message={error} onRetry={loadData} />
        ) : loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("map.noResults")}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((loc) => {
              const name = locale === "en" ? loc.nameEn : loc.name;
              const desc = locale === "en" ? loc.shortDescEn : loc.shortDesc;
              const catName =
                locale === "en" ? loc.category.nameEn : loc.category.name;

              return (
                <Link key={loc.id} href={`/locations/${loc.id}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          style={{
                            backgroundColor: loc.category.color,
                            color: "white",
                          }}
                          className="text-xs"
                        >
                          {catName}
                        </Badge>
                        {loc.isFeatured && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {desc}
                      </p>
                      <div className="flex items-center text-xs text-teal-600">
                        {t("explore.viewDetails")}
                        <ChevronRight className="h-3 w-3 ml-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
