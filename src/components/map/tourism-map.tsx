"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Circle,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import type { Location } from "@/types";
import { useAnalytics } from "@/hooks/use-analytics";
import { createCategoryMarkerHtml } from "./category-icons";
import "leaflet/dist/leaflet.css";

function zoomToScale(zoom: number): number {
  if (zoom <= 8) return 0.6;
  if (zoom >= 16) return 1.4;
  return 0.6 + ((zoom - 8) / 8) * 0.8;
}

const iconCache = new Map<string, L.DivIcon>();

function getCategoryIcon(
  slug: string,
  color: string,
  isSelected: boolean,
  scale: number = 1,
) {
  const scaleKey = scale.toFixed(2);
  const key = `${slug}-${isSelected ? "sel" : "def"}-${scaleKey}`;
  if (iconCache.has(key)) return iconCache.get(key)!;
  const html = createCategoryMarkerHtml(slug, color, isSelected, scale);
  const baseImg = isSelected ? 38 : 30;
  const baseArrow = isSelected ? 10 : 7;
  const imgSize = Math.round(baseImg * scale);
  const arrowW = Math.max(5, Math.round(baseArrow * scale));
  const totalW = imgSize + 4 + arrowW;
  const totalH = imgSize;
  const icon = L.divIcon({
    className: "custom-png-marker",
    html,
    iconSize: [totalW, totalH],
    iconAnchor: [totalW, totalH / 2],
  });
  iconCache.set(key, icon);
  return icon;
}

const userIcon = L.divIcon({
  className: "user-marker",
  html: `<div class="user-marker-dot"><div class="user-marker-pulse"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// flyKey ensures re-trigger even when same location is clicked again
function FlyToLocation({
  position,
  flyKey,
}: {
  position: [number, number] | null;
  flyKey: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14, { duration: 1.2 });
  }, [position, flyKey, map]);
  return null;
}

function ZoomTracker({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => onZoomChange(map.getZoom());
    map.on("zoomend", handler);
    return () => {
      map.off("zoomend", handler);
    };
  }, [map, onZoomChange]);
  return null;
}

export interface RouteInfo {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  mode: "walking" | "driving" | "transit";
  color: string;
}

function FitRouteBounds({
  routeInfo,
}: {
  routeInfo: RouteInfo | null | undefined;
}) {
  const map = useMap();
  useEffect(() => {
    if (routeInfo && routeInfo.coordinates.length > 1) {
      const bounds = L.latLngBounds(
        routeInfo.coordinates.map((c) => L.latLng(c[0], c[1])),
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [routeInfo, map]);
  return null;
}

interface TourismMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  flyToLocation: Location | null;
  flyKey?: number;
  onSelectLocation: (location: Location) => void;
  activeCategory: string | null;
  routeInfo?: RouteInfo | null;
}

export default function TourismMap({
  locations,
  selectedLocation,
  flyToLocation,
  flyKey = 0,
  onSelectLocation,
  activeCategory,
  routeInfo,
}: TourismMapProps) {
  const { trackEvent } = useAnalytics();
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );
  const defaultZoom = Number(process.env.NEXT_PUBLIC_MAP_ZOOM) || 10;
  const [zoomLevel, setZoomLevel] = useState(defaultZoom);
  const [mapStyle, setMapStyle] = useState<"standard" | "satellite">(
    "satellite",
  );

  const center: [number, number] = [
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT) || 39.6484,
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG) || 27.8826,
  ];

  // Delay geolocation request to avoid browser violation
  useEffect(() => {
    const timer = setTimeout(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
          () => {},
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const filteredLocations = useMemo(
    () =>
      activeCategory
        ? locations.filter((l) => l.category.slug === activeCategory)
        : locations,
    [locations, activeCategory],
  );

  const flyTarget = useMemo<[number, number] | null>(
    () =>
      flyToLocation ? [flyToLocation.latitude, flyToLocation.longitude] : null,
    [flyToLocation],
  );

  const handleMarkerClick = useCallback(
    (location: Location) => {
      onSelectLocation(location);
      trackEvent("marker_click", location.id);
    },
    [onSelectLocation, trackEvent],
  );

  useEffect(() => {
    trackEvent("map_view");
  }, [trackEvent]);

  const tileUrl =
    mapStyle === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution =
    mapStyle === "satellite"
      ? "&copy; Esri, Maxar, Earthstar Geographics"
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <div className="relative h-full w-full">
      <button
        onClick={() =>
          setMapStyle((s) => (s === "standard" ? "satellite" : "standard"))
        }
        className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/90 backdrop-blur-md shadow-lg border border-gray-200/60 text-xs font-medium text-gray-700 hover:bg-white transition-all active:scale-95"
      >
        {mapStyle === "standard" ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            Uydu
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M9 3v18" />
              <path d="M15 3v18" />
            </svg>
            Standart
          </>
        )}
      </button>

      <MapContainer
        center={center}
        zoom={defaultZoom}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer key={mapStyle} attribution={tileAttribution} url={tileUrl} />
        <FlyToLocation position={flyTarget} flyKey={flyKey} />
        <FitRouteBounds routeInfo={routeInfo} />
        <ZoomTracker onZoomChange={setZoomLevel} />

        {userPosition && (
          <>
            <Marker position={userPosition} icon={userIcon} />
            <Circle
              center={userPosition}
              radius={200}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
          </>
        )}

        {filteredLocations.map((location) => {
          const isSelected = selectedLocation?.id === location.id;
          const scale = zoomToScale(zoomLevel);
          const icon = getCategoryIcon(
            location.category.slug,
            location.category.color,
            isSelected,
            scale,
          );
          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={icon}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => handleMarkerClick(location) }}
            />
          );
        })}

        {routeInfo && routeInfo.coordinates.length > 0 && (
          <Polyline
            positions={routeInfo.coordinates}
            pathOptions={{
              color: routeInfo.color,
              weight: 5,
              opacity: 0.8,
              dashArray: routeInfo.mode === "walking" ? "10, 10" : undefined,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
