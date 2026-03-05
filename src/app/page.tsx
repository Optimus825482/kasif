"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Location, Category } from "@/types";
import type { RouteInfo } from "@/components/map/directions-modal";
import { Header } from "@/components/layout/header";
import { CategoryFilter } from "@/components/map/category-filter";
import { LocationCard } from "@/components/map/location-card";
import { SearchBar } from "@/components/map/search-bar";
import { NearbyPanel } from "@/components/map/nearby-panel";
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
  const [directionsTarget, setDirectionsTarget] = useState<Location | null>(
    null,
  );
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/locations/all").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([locRes, catRes]) => {
      if (locRes.success) setLocations(locRes.data);
      if (catRes.success) setCategories(catRes.data);
      setLoading(false);
    });
  }, []);

  // Geolocation is requested after data loads (user gesture context)
  useEffect(() => {
    if (!loading && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {},
      );
    }
  }, [loading]);

  const handleMarkerSelect = useCallback(
    (location: Location) => {
      if (selectedLocation?.id === location.id) {
        // Second click on same marker → zoom to it
        setFlyToLocation(location);
        setFlyKey((k) => k + 1);
      } else {
        // First click → show info card only
        setSelectedLocation(location);
      }
    },
    [selectedLocation],
  );

  const handleExternalSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    setFlyToLocation(location);
    setFlyKey((k) => k + 1);
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
            <SearchBar locations={locations} onSelect={handleExternalSelect} />
          </>
        )}

        <TourismMap
          locations={locations}
          selectedLocation={selectedLocation}
          flyToLocation={flyToLocation}
          flyKey={flyKey}
          onSelectLocation={handleMarkerSelect}
          activeCategory={activeCategory}
          routeInfo={routeInfo}
        />

        {!loading && (
          <NearbyPanel
            locations={locations}
            userPosition={userPosition}
            onSelect={handleExternalSelect}
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
