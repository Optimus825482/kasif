"use client";

import { useState, useRef, useEffect } from "react";
import type { Category } from "@/types";
import { useLocale } from "@/context/locale-context";
import { getCategoryImageSrc } from "@/components/map/category-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, ChevronDown, X } from "lucide-react";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (slug: string | null) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
}: CategoryFilterProps) {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const activeCat = categories.find((c) => c.slug === activeCategory);
  const label = activeCat
    ? locale === "en"
      ? activeCat.nameEn
      : activeCat.name
    : t("categories.all");

  return (
    <div
      ref={ref}
      className="absolute top-4 left-4 z-[1000]"
      style={{ maxWidth: "calc(100vw - 100px)" }}
    >
      {/* Toggle button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        className="h-9 text-xs bg-white/95 backdrop-blur-md shadow-lg border-gray-200/60 hover:bg-white gap-1.5"
        style={
          activeCat ? { borderColor: activeCat.color, borderWidth: 2 } : {}
        }
      >
        {activeCat ? (
          <img
            src={getCategoryImageSrc(activeCat.slug)}
            alt=""
            className="w-4 h-4 object-contain"
          />
        ) : (
          <Layers className="h-3.5 w-3.5" />
        )}
        <span className="truncate max-w-[120px]">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="mt-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[60vh] overflow-y-auto p-1.5 space-y-0.5">
            {/* All categories */}
            <button
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                activeCategory === null
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Layers className="h-4 w-4 shrink-0" />
              <span className="flex-1">{t("categories.all")}</span>
              {activeCategory === null && (
                <div className="w-2 h-2 rounded-full bg-teal-500" />
              )}
            </button>

            {categories.map((cat) => {
              const isActive = activeCategory === cat.slug;
              const imgSrc = getCategoryImageSrc(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelect(isActive ? null : cat.slug);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                    isActive ? "font-medium" : "hover:bg-gray-50 text-gray-700"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: cat.color + "18", color: cat.color }
                      : {}
                  }
                >
                  <img
                    src={imgSrc}
                    alt=""
                    className="w-5 h-5 object-contain shrink-0"
                  />
                  <span className="flex-1">
                    {locale === "en" ? cat.nameEn : cat.name}
                  </span>
                  {cat._count && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[10px]"
                    >
                      {cat._count.locations}
                    </Badge>
                  )}
                  {isActive && (
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Clear filter shortcut */}
          {activeCategory && (
            <div className="border-t border-gray-100 p-1.5">
              <button
                onClick={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <X className="h-3 w-3" />
                Filtreyi Temizle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
