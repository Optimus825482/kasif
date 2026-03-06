"use client";

import { useMemo } from "react";
import type { Location } from "@/types";
import { useLocale } from "@/context/locale-context";
import { haversineDistance, formatDistance } from "@/lib/utils";
import { getCategoryImageSrc } from "@/components/map/category-icons";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Navigation } from "lucide-react";

// Balıkesir province approximate bounding box
const BALIKESIR_BOUNDS = {
  minLat: 39.0,
  maxLat: 40.4,
  minLng: 26.6,
  maxLng: 28.9,
};

function isInBalikesir(lat: number, lng: number): boolean {
  return (
    lat >= BALIKESIR_BOUNDS.minLat &&
    lat <= BALIKESIR_BOUNDS.maxLat &&
    lng >= BALIKESIR_BOUNDS.minLng &&
    lng <= BALIKESIR_BOUNDS.maxLng
  );
}

interface NearbyPanelProps {
  locations: Location[];
  userPosition: [number, number] | null;
  onSelect: (location: Location) => void;
  /** Radius in km; only locations within this distance are shown. Default 30. */
  radiusKm?: number;
}

const DEFAULT_RADIUS_KM = 30;

export function NearbyPanel({
  locations,
  userPosition,
  onSelect,
  radiusKm = DEFAULT_RADIUS_KM,
}: NearbyPanelProps) {
  const { locale, t } = useLocale();
  const radiusM = (radiusKm > 0 ? radiusKm : DEFAULT_RADIUS_KM) * 1000;

  // Only show nearby if user is within Balıkesir province
  const isUserInProvince = useMemo(() => {
    if (!userPosition) return false;
    return isInBalikesir(userPosition[0], userPosition[1]);
  }, [userPosition]);

  const nearbyLocations = useMemo(() => {
    if (!userPosition || !isUserInProvince) return [];
    return [...locations]
      .map((loc) => ({
        ...loc,
        distance: haversineDistance(
          userPosition[0],
          userPosition[1],
          loc.latitude,
          loc.longitude,
        ),
      }))
      .filter((item) => item.distance <= radiusM)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }, [locations, userPosition, isUserInProvince, radiusM]);

  // Don't render panel if user is outside Balıkesir
  if (!isUserInProvince || nearbyLocations.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-[1000] w-72 hidden lg:block">
      <div className="rounded-xl border bg-background/95 backdrop-blur shadow-lg overflow-hidden">
        <div className="px-3 py-2 border-b bg-teal-600 text-white">
          <h3 className="text-xs font-semibold flex items-center gap-1.5">
            <Navigation className="h-3 w-3" />
            {t("map.nearbyPlaces")}
          </h3>
          <p className="text-[10px] text-teal-100 mt-0.5">
            {t("map.withinRadius").replace("{{km}}", String(radiusKm > 0 ? radiusKm : DEFAULT_RADIUS_KM))}
          </p>
        </div>
        <ScrollArea className="h-64">
          <div className="p-1.5 space-y-1">
            {nearbyLocations.map((loc) => {
              const name = locale === "en" ? loc.nameEn : loc.name;
              const catName =
                locale === "en" ? loc.category.nameEn : loc.category.name;
              const dist = formatDistance(loc.distance);
              const imgSrc = getCategoryImageSrc(loc.category.slug);

              return (
                <button
                  key={loc.id}
                  onClick={() => onSelect(loc)}
                  className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors flex items-start gap-2.5"
                >
                  <img
                    src={imgSrc}
                    alt=""
                    className="w-5 h-5 object-contain shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {catName}
                      </span>
                      <Badge
                        variant="secondary"
                        className="h-3.5 px-1 text-[9px]"
                      >
                        {dist}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
