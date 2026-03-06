"use client";

import { useState, useMemo } from "react";
import type { Location } from "@/types";
import { useLocale } from "@/context/locale-context";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  locations: Location[];
  onSelect: (location: Location) => void;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
}

export function SearchBar({
  locations,
  onSelect,
  searchQuery: controlledQuery,
  onSearchQueryChange,
}: SearchBarProps) {
  const { locale, t } = useLocale();
  const [internalQuery, setInternalQuery] = useState("");
  const query = controlledQuery ?? internalQuery;
  const setQuery = onSearchQueryChange ?? setInternalQuery;
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return locations
      .filter((l) => {
        const name = locale === "en" ? l.nameEn : l.name;
        return name.toLowerCase().includes(q);
      })
      .slice(0, 5);
  }, [query, locations, locale]);

  return (
    <div className="absolute top-16 left-4 z-[1000] w-72">
      <div className="relative">
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={t("map.searchPlaceholder")}
          className="pl-8 pr-8 h-8 text-xs bg-background/95 backdrop-blur"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-2"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      {focused && results.length > 0 && (
        <div className="mt-1 rounded-lg border bg-background/95 backdrop-blur shadow-lg overflow-hidden">
          {results.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                onSelect(loc);
                setQuery("");
              }}
              className="w-full text-left px-3 py-2 hover:bg-accent text-xs flex items-center gap-2"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: loc.category.color }}
              />
              <span className="truncate">
                {locale === "en" ? loc.nameEn : loc.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
