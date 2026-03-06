"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { Location, Category } from "@/types";
import { haversineDistance } from "@/lib/utils";
import type { RouteInfo } from "@/components/map/directions-modal";
import { Header } from "@/components/layout/header";
import { CategoryFilter } from "@/components/map/category-filter";
import { LocationCard } from "@/components/map/location-card";
import { SearchBar } from "@/components/map/search-bar";
import { NearbyPanel } from "@/components/map/nearby-panel";
import { ErrorRetry } from "@/components/ui/error-retry";
import { Skeleton } from "@/components/ui/skeleton";

const TourismMap = dynamic(() => import("@/components/map/tourism-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

const DirectionsModal = dynamic(
  () => import("@/components/map/directions-modal"),
  { ssr: false },
);

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [flyToLocation, setFlyToLocation] = useState<Location | null>(null);
  const [flyKey, setFlyKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [geoError, setGeoError] = useState(false);
  const [directionsTarget, setDirectionsTarget] = useState<Location | null>(
    null,
  );
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [notificationRadiusKm, setNotificationRadiusKm] = useState<number>(30);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  const loadData = useCallback(() => {
    setError(null);
    setLoading(true);
    Promise.all([
      fetch("/api/locations/all").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([locRes, catRes, setRes]) => {
        let err: string | null = null;
        if (locRes.success) setLocations(locRes.data ?? []);
        else err = locRes.error ?? "Veriler yüklenemedi";
        if (catRes.success) setCategories(catRes.data ?? []);
        else err = err ?? catRes.error ?? "Kategoriler yüklenemedi";
        if (setRes.success && setRes.data?.notificationRadiusKm != null) {
          const km = Number(setRes.data.notificationRadiusKm);
          setNotificationRadiusKm(Number.isFinite(km) && km > 0 ? km : 30);
        }
        setError(err);
        setLoading(false);
      })
      .catch(() => {
        setError("Bağlantı hatası. Lütfen tekrar deneyin.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Geolocation after data loads
  useEffect(() => {
    if (!loading && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude]);
          setGeoError(false);
        },
        () => setGeoError(true),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, [loading]);

  // Request notification permission when we have location (after user has granted location)
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (userPosition && Notification.permission === "default") {
      Notification.requestPermission().then(setNotificationPermission);
    } else if (Notification.permission) {
      setNotificationPermission(Notification.permission);
    }
  }, [userPosition]);

  const filteredLocations = useMemo(() => {
    let list = locations;
    if (activeCategory) {
      list = list.filter((l) => l.category.slug === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) => {
        const name = l.name.toLowerCase();
        const nameEn = l.nameEn.toLowerCase();
        return name.includes(q) || nameEn.includes(q);
      });
    }
    return list;
  }, [locations, activeCategory, searchQuery]);

  const nearbyCountWithinRadius = useMemo(() => {
    if (!userPosition || notificationRadiusKm <= 0) return 0;
    const radiusM = notificationRadiusKm * 1000;
    return locations.filter(
      (loc) =>
        haversineDistance(
          userPosition[0],
          userPosition[1],
          loc.latitude,
          loc.longitude,
        ) <= radiusM,
    ).length;
  }, [locations, userPosition, notificationRadiusKm]);

  const nearbyNotificationShownRef = useRef(false);
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      notificationPermission !== "granted" ||
      nearbyCountWithinRadius === 0 ||
      nearbyNotificationShownRef.current
    )
      return;
    nearbyNotificationShownRef.current = true;
    new Notification("Yakınınızda yerler var", {
        body: `${nearbyCountWithinRadius} yer ${notificationRadiusKm} km çevrenizde. Haritada görmek için tıklayın.`,
        icon: "/icon-192.png",
        tag: "nearby-places",
      });
  }, [notificationPermission, nearbyCountWithinRadius, notificationRadiusKm]);

  const handleMarkerSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    setFlyToLocation(location);
    setFlyKey((k) => k + 1);
  }, []);

  const handleExternalSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    setFlyToLocation(location);
    setFlyKey((k) => k + 1);
  }, []);

  const handleRetryGeo = useCallback(() => {
    setGeoError(false);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude]);
          setGeoError(false);
        },
        () => setGeoError(true),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  const handleDirections = useCallback((location: Location) => {
    setDirectionsTarget(location);
  }, []);

  const handleRouteReady = useCallback((route: RouteInfo | null) => {
    setRouteInfo(route);
  }, []);

  const handleCloseDirections = useCallback(() => {
    setDirectionsTarget(null);
    setRouteInfo(null);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <ErrorRetry message={error} onRetry={loadData} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 relative overflow-hidden">
        {!loading && (
          <>
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
            <SearchBar
              locations={locations}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSelect={handleExternalSelect}
            />
          </>
        )}

        {loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-muted/80">
            <Skeleton className="h-full w-full" />
          </div>
        )}

        <TourismMap
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          flyToLocation={flyToLocation}
          flyKey={flyKey}
          onSelectLocation={handleMarkerSelect}
          activeCategory={activeCategory}
          routeInfo={routeInfo}
          userPosition={userPosition}
          geoError={geoError}
          onRetryGeo={handleRetryGeo}
        />

        {!loading && (
          <NearbyPanel
            locations={locations}
            userPosition={userPosition}
            onSelect={handleExternalSelect}
            radiusKm={notificationRadiusKm}
          />
        )}

        {selectedLocation && (
          <LocationCard
            location={selectedLocation}
            userPosition={userPosition}
            onClose={() => setSelectedLocation(null)}
            onDirections={handleDirections}
          />
        )}

        {directionsTarget && (
          <DirectionsModal
            location={directionsTarget}
            userPosition={userPosition}
            onClose={handleCloseDirections}
            onRouteReady={handleRouteReady}
          />
        )}
      </main>
    </div>
  );
}
