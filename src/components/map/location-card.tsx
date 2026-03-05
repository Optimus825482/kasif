"use client";

import { useState, useEffect } from "react";
import type { Location } from "@/types";
import { useLocale } from "@/context/locale-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance, haversineDistance } from "@/lib/utils";
import { Navigation, Clock, X, ChevronRight, Ticket } from "lucide-react";
import Link from "next/link";

interface LocationCardProps {
  location: Location;
  userPosition: [number, number] | null;
  onClose: () => void;
  onDirections: (location: Location) => void;
}

export function LocationCard({
  location,
  userPosition,
  onClose,
  onDirections,
}: LocationCardProps) {
  const { locale, t } = useLocale();
  const [visible, setVisible] = useState(false);

  const name = locale === "en" ? location.nameEn : location.name;
  const desc = locale === "en" ? location.shortDescEn : location.shortDesc;
  const catName =
    locale === "en" ? location.category.nameEn : location.category.name;
  const fee = locale === "en" ? location.feeEn : location.fee;
  const color = location.category.color;

  const dist = userPosition
    ? formatDistance(
        haversineDistance(
          userPosition[0],
          userPosition[1],
          location.latitude,
          location.longitude,
        ),
      )
    : null;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  return (
    <div
      className={`location-card ${visible ? "location-card-visible" : "location-card-hidden"}`}
    >
      {/* Color accent */}
      <div
        className="h-1 w-full rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
      />

      <button
        onClick={handleClose}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all z-10"
        aria-label="Kapat"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>

      <div className="p-4 pt-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            style={{ backgroundColor: color, color: "white" }}
            className="text-[11px] px-2.5 py-0.5 font-medium shadow-sm"
          >
            {catName}
          </Badge>
          {dist && (
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Navigation className="h-3 w-3" /> {dist}
            </span>
          )}
        </div>

        <h3 className="font-bold text-[15px] leading-snug text-gray-900 mb-1.5 pr-6">
          {name}
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {desc}
        </p>

        <div className="flex items-center gap-4 text-[11px] text-gray-400 mb-4">
          {location.visitHours && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {location.visitHours}
            </span>
          )}
          {fee && (
            <span className="flex items-center gap-1">
              <Ticket className="h-3.5 w-3.5" /> {fee}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 text-[13px] h-9 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: color }}
            asChild
          >
            <Link href={`/locations/${location.id}`}>
              {locale === "tr" ? "Detayları Gör" : "View Details"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-[13px] h-9 rounded-lg"
            onClick={() => onDirections(location)}
          >
            <Navigation className="h-4 w-4 mr-1" />
            {locale === "tr" ? "Nasıl Gidilir" : "How to Get There"}
          </Button>
        </div>
      </div>
    </div>
  );
}
