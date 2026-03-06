"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { Location } from "@/types";
import { useLocale } from "@/context/locale-context";
import {
  generateTransitGuide,
  type TransitGuide,
  type TransitStep,
} from "@/lib/transit-guide";
import {
  X,
  Footprints,
  Car,
  Bus,
  Loader2,
  Clock,
  Route as RouteIcon,
  Ship,
  ArrowRight,
  MapPin,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

export interface RouteInfo {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  mode: "walking" | "driving" | "transit";
  color: string;
}

interface DirectionsModalProps {
  location: Location;
  userPosition: [number, number] | null;
  onClose: () => void;
  onRouteReady: (route: RouteInfo | null) => void;
}

type TransportMode = "walking" | "driving" | "transit";

const MODE_COLORS: Record<TransportMode, string> = {
  walking: "#16a34a",
  driving: "#2563eb",
  transit: "#ea580c",
};

const OSRM_PROFILES: Record<string, string> = {
  walking: "foot",
  driving: "car",
};

// Average speeds for duration calculation (m/s)
const AVG_SPEEDS: Record<string, number> = {
  walking: 5 / 3.6, // 5 km/h → ~1.39 m/s
  driving: 40 / 3.6, // 40 km/h city avg → ~11.11 m/s
};

function formatDistance(meters: number, locale: string): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number, locale: string): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} ${locale === "tr" ? "dk" : "min"}`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (remaining === 0) return `${hours} ${locale === "tr" ? "sa" : "h"}`;
  return `${hours} ${locale === "tr" ? "sa" : "h"} ${remaining} ${locale === "tr" ? "dk" : "min"}`;
}

const STEP_ICONS: Record<TransitStep["icon"], typeof Bus> = {
  bus: Bus,
  minibus: Bus,
  ferry: Ship,
  walk: Footprints,
  transfer: ArrowRight,
};

const STEP_COLORS: Record<TransitStep["icon"], string> = {
  bus: "#ea580c",
  minibus: "#d97706",
  ferry: "#0891b2",
  walk: "#16a34a",
  transfer: "#6b7280",
};

interface RouteCache {
  walking?: {
    distance: number;
    duration: number;
    coordinates: [number, number][];
  };
  driving?: {
    distance: number;
    duration: number;
    coordinates: [number, number][];
  };
  transit?: { distance: number; duration: number };
}

export default function DirectionsModal({
  location,
  userPosition,
  onClose,
  onRouteReady,
}: DirectionsModalProps) {
  const { locale, t } = useLocale();
  const [selectedMode, setSelectedMode] = useState<TransportMode | null>(null);
  const [loading, setLoading] = useState<TransportMode | null>(null);
  const [cache, setCache] = useState<RouteCache>({});
  const [error, setError] = useState<string | null>(null);
  const [transitExpanded, setTransitExpanded] = useState(true);

  // Generate dynamic transit guide
  const transitGuide: TransitGuide | null = useMemo(() => {
    if (!userPosition) return null;
    return generateTransitGuide(
      userPosition[0],
      userPosition[1],
      location.latitude,
      location.longitude,
      location.publicTransport,
      location.publicTransportEn,
    );
  }, [
    userPosition,
    location.latitude,
    location.longitude,
    location.publicTransport,
    location.publicTransportEn,
  ]);

  const labels: Record<
    TransportMode,
    { tr: string; en: string; icon: typeof Footprints }
  > = {
    walking: { tr: "Yürüyerek", en: "Walking", icon: Footprints },
    driving: { tr: "Araçla", en: "Driving", icon: Car },
    transit: { tr: "Toplu Taşıma", en: "Transit", icon: Bus },
  };

  const fetchRoute = useCallback(
    async (mode: TransportMode) => {
      if (!userPosition) return;

      if (cache[mode]) {
        const cached = cache[mode]!;
        setSelectedMode(mode);
        if (mode === "transit") {
          onRouteReady(null);
        } else {
          onRouteReady({
            coordinates: (cached as { coordinates: [number, number][] })
              .coordinates,
            distance: cached.distance,
            duration: cached.duration,
            mode,
            color: MODE_COLORS[mode],
          });
        }
        return;
      }

      setLoading(mode);
      setError(null);

      try {
        if (mode === "transit") {
          let walkingDuration: number;
          let walkingDistance: number;
          if (cache.walking) {
            walkingDuration = cache.walking.duration;
            walkingDistance = cache.walking.distance;
          } else {
            const walkRes = await fetch(
              `https://router.project-osrm.org/route/v1/foot/${userPosition[1]},${userPosition[0]};${location.longitude},${location.latitude}?overview=full&geometries=geojson`,
            );
            const walkData = await walkRes.json();
            if (walkData.code !== "Ok") throw new Error("Route not found");
            const route = walkData.routes[0];
            const dist = route.distance;
            const coords: [number, number][] = route.geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]] as [number, number],
            );
            walkingDuration = dist / AVG_SPEEDS.walking;
            walkingDistance = dist;
            setCache((prev) => ({
              ...prev,
              walking: {
                distance: dist,
                duration: walkingDuration,
                coordinates: coords,
              },
            }));
          }
          setCache((prev) => ({
            ...prev,
            transit: {
              distance: walkingDistance,
              duration: walkingDuration * 0.4,
            },
          }));
          setSelectedMode(mode);
          onRouteReady(null);
        } else {
          const profile = OSRM_PROFILES[mode];
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/${profile}/${userPosition[1]},${userPosition[0]};${location.longitude},${location.latitude}?overview=full&geometries=geojson`,
          );
          const data = await res.json();
          if (data.code !== "Ok") throw new Error("Route not found");
          const route = data.routes[0];
          const dist = route.distance;
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number],
          );
          const duration = dist / AVG_SPEEDS[mode];
          setCache((prev) => ({
            ...prev,
            [mode]: {
              distance: dist,
              duration,
              coordinates: coords,
            },
          }));
          setSelectedMode(mode);
          onRouteReady({
            coordinates: coords,
            distance: dist,
            duration,
            mode,
            color: MODE_COLORS[mode],
          });
        }
      } catch {
        setError(
          locale === "tr" ? "Rota hesaplanamadı" : "Could not calculate route",
        );
      } finally {
        setLoading(null);
      }
    },
    [userPosition, location, cache, locale, onRouteReady],
  );

  // Auto-fetch walking & driving on mount (sequential to avoid race condition)
  useEffect(() => {
    if (!userPosition) return;
    let cancelled = false;

    const prefetch = async () => {
      // 1) Fetch walking first
      try {
        const walkRes = await fetch(
          `https://router.project-osrm.org/route/v1/foot/${userPosition[1]},${userPosition[0]};${location.longitude},${location.latitude}?overview=full&geometries=geojson`,
        );
        const walkData = await walkRes.json();
        if (!cancelled && walkData.code === "Ok") {
          const route = walkData.routes[0];
          const dist = route.distance; // meters (road distance from OSRM)
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number],
          );
          const walkDuration = dist / AVG_SPEEDS.walking; // 5 km/h
          setCache((prev) => ({
            ...prev,
            walking: {
              distance: dist,
              duration: walkDuration,
              coordinates: coords,
            },
            transit: {
              distance: dist,
              duration: walkDuration * 0.4,
            },
          }));
        }
      } catch {
        /* silent */
      }

      // 2) Then fetch driving
      try {
        const driveRes = await fetch(
          `https://router.project-osrm.org/route/v1/car/${userPosition[1]},${userPosition[0]};${location.longitude},${location.latitude}?overview=full&geometries=geojson`,
        );
        const driveData = await driveRes.json();
        if (!cancelled && driveData.code === "Ok") {
          const route = driveData.routes[0];
          const dist = route.distance;
          const coords: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number],
          );
          setCache((prev) => ({
            ...prev,
            driving: {
              distance: dist,
              duration: dist / AVG_SPEEDS.driving, // 40 km/h city avg
              coordinates: coords,
            },
          }));
        }
      } catch {
        /* silent */
      }
    };

    prefetch();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPosition, location.latitude, location.longitude]);

  const handleClearRoute = () => {
    setSelectedMode(null);
    onRouteReady(null);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[1100] animate-in slide-in-from-bottom duration-300"
      role="dialog"
      aria-label={locale === "tr" ? "Nasıl Gidilir" : "Directions"}
    >
      <div className="mx-auto max-w-lg rounded-t-2xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)] max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b px-4 py-3 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <RouteIcon className="h-5 w-5 text-gray-700" />
            <h3 className="text-sm font-semibold text-gray-900">
              {locale === "tr" ? "Nasıl Gidilir" : "Directions"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {selectedMode && (
              <button
                onClick={handleClearRoute}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                {locale === "tr" ? "Rotayı Temizle" : "Clear Route"}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              aria-label={locale === "tr" ? "Kapat" : "Close"}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {!userPosition ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500">
            {locale === "tr"
              ? "Konumunuz alınamadı. Lütfen konum iznini kontrol edin."
              : "Could not get your location. Please check location permissions."}
          </div>
        ) : (
          <>
            {/* Destination */}
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                <MapPin className="h-3 w-3" />→{" "}
                {locale === "tr" ? location.name : location.nameEn}
              </p>
            </div>

            {loading && (
              <p className="px-4 text-xs text-gray-500 flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("map.routeCalculating")}
              </p>
            )}

            {/* Mode buttons */}
            <div className="grid grid-cols-3 gap-2 px-4 py-3">
              {(["walking", "driving", "transit"] as TransportMode[]).map(
                (mode) => {
                  const label = labels[mode];
                  const Icon = label.icon;
                  const isSelected = selectedMode === mode;
                  const isLoading = loading === mode;
                  const cached = cache[mode];
                  const color = MODE_COLORS[mode];
                  // For transit, show guide estimate instead of OSRM estimate
                  const showGuideEst = mode === "transit" && transitGuide;

                  return (
                    <button
                      key={mode}
                      onClick={() => fetchRoute(mode)}
                      disabled={isLoading}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition-all ${
                        isSelected
                          ? "border-current shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={
                        isSelected ? { borderColor: color, color } : undefined
                      }
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-hidden />
                      ) : (
                        <Icon
                          className="h-5 w-5"
                          style={isSelected ? { color } : { color: "#6b7280" }}
                        />
                      )}
                      <span
                        className={`text-xs font-medium ${isSelected ? "" : "text-gray-700"}`}
                        style={isSelected ? { color } : undefined}
                      >
                        {locale === "tr" ? label.tr : label.en}
                      </span>
                      {showGuideEst ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {locale === "en"
                              ? transitGuide.totalEstimateEn
                              : transitGuide.totalEstimate}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {transitGuide.distanceKm.toFixed(0)} km
                          </span>
                        </div>
                      ) : cached ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {formatDuration(cached.duration, locale)}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatDistance(cached.distance, locale)}
                          </span>
                        </div>
                      ) : null}
                    </button>
                  );
                },
              )}
            </div>

            {/* Dynamic Transit Guide */}
            {selectedMode === "transit" && transitGuide && (
              <div className="px-4 pb-4">
                {/* Summary bar */}
                <button
                  onClick={() => setTransitExpanded(!transitExpanded)}
                  className="w-full flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2.5 mb-2"
                >
                  <div className="flex items-center gap-2">
                    {transitGuide.needsFerry && (
                      <Ship className="h-4 w-4 text-cyan-600" />
                    )}
                    <Bus className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-semibold text-orange-900">
                      {locale === "en"
                        ? transitGuide.summaryEn
                        : transitGuide.summary}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-orange-700">
                      {locale === "en"
                        ? transitGuide.totalEstimateEn
                        : transitGuide.totalEstimate}
                    </span>
                    {transitExpanded ? (
                      <ChevronUp className="h-4 w-4 text-orange-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-orange-400" />
                    )}
                  </div>
                </button>

                {/* Steps */}
                {transitExpanded && (
                  <div className="space-y-0">
                    {transitGuide.steps.map((step, i) => {
                      const StepIcon = STEP_ICONS[step.icon];
                      const stepColor = STEP_COLORS[step.icon];
                      const isLast = i === transitGuide.steps.length - 1;
                      const isVenueTip = step.title === "Yerel ulaşım bilgisi";

                      return (
                        <div key={i} className="flex gap-3">
                          {/* Timeline */}
                          <div className="flex flex-col items-center">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-full"
                              style={{ backgroundColor: stepColor + "18" }}
                            >
                              <StepIcon
                                className="h-3.5 w-3.5"
                                style={{ color: stepColor }}
                              />
                            </div>
                            {!isLast && (
                              <div className="w-0.5 flex-1 min-h-[16px] bg-gray-200" />
                            )}
                          </div>
                          {/* Content */}
                          <div className={`flex-1 pb-3 ${isLast ? "" : ""}`}>
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-gray-900">
                                {locale === "en" ? step.titleEn : step.title}
                              </p>
                              {step.duration && (
                                <span className="text-[10px] text-gray-500 flex items-center gap-0.5 shrink-0 ml-2">
                                  <Clock className="h-2.5 w-2.5" />
                                  {locale === "en"
                                    ? step.durationEn
                                    : step.duration}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[11px] leading-relaxed mt-0.5 ${isVenueTip ? "text-orange-700" : "text-gray-600"}`}
                            >
                              {locale === "en" ? step.detailEn : step.detail}
                            </p>
                            {step.tip && (
                              <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5">
                                <Info className="h-2.5 w-2.5" />
                                {locale === "en" ? step.tipEn : step.tip}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="text-[10px] text-gray-400 text-center mt-1">
                  {locale === "tr"
                    ? "Süreler tahminidir, trafik ve sefer saatlerine göre değişebilir"
                    : "Times are estimates and may vary based on traffic and schedules"}
                </p>
              </div>
            )}

            {error && (
              <div className="px-4 pb-3 flex flex-col items-center gap-2">
                <p className="text-xs text-red-600">{t("map.routeError")}</p>
                {selectedMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      fetchRoute(selectedMode);
                    }}
                    className="text-xs font-medium text-teal-600 hover:underline"
                  >
                    {t("common.retry")}
                  </button>
                )}
              </div>
            )}

            {/* External map links */}
            {userPosition && (
              <div className="px-4 pb-4 pt-2 border-t flex flex-wrap gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userPosition[0]},${userPosition[1]}&destination=${location.latitude},${location.longitude}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  aria-label={t("map.openInGoogleMaps")}
                >
                  <span>{t("map.openInGoogleMaps")}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={`https://maps.apple.com/?daddr=${location.latitude},${location.longitude}&saddr=${userPosition[0]},${userPosition[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  aria-label={t("map.openInAppleMaps")}
                >
                  <span>{t("map.openInAppleMaps")}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
