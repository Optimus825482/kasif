"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { Location } from "@/types";
import type { RouteInfo } from "@/components/map/directions-modal";
import { useLocale } from "@/context/locale-context";
import { haversineDistance, formatDistance } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorRetry } from "@/components/ui/error-retry";
import {
  ArrowLeft,
  Clock,
  Banknote,
  MapPin,
  Phone,
  Globe,
  Navigation,
  Share2,
  Accessibility,
  ExternalLink,
  Bus,
  ChevronRight,
} from "lucide-react";

const DirectionsModal = dynamic(
  () => import("@/components/map/directions-modal"),
  { ssr: false },
);

const CATEGORY_GRADIENTS: Record<string, string> = {
  historical: "from-amber-700 to-amber-900",
  ancient: "from-amber-800 to-stone-900",
  museum: "from-violet-600 to-violet-800",
  nature: "from-green-600 to-green-800",
  beach: "from-cyan-600 to-cyan-800",
  cultural: "from-pink-600 to-pink-800",
  gastronomy: "from-orange-500 to-orange-700",
  thermal: "from-red-600 to-red-800",
  religious: "from-purple-700 to-purple-900",
};

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { locale, t } = useLocale();
  const { trackEvent } = useAnalytics();
  const [location, setLocation] = useState<Location | null>(null);
  const [nearby, setNearby] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const loadLocation = useCallback(() => {
    if (!params.id) return;
    setError(null);
    setNotFound(false);
    setLoading(true);
    fetch(`/api/locations/${params.id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const loc = res.data as Location;
          setLocation(loc);
          trackEvent("detail_view", loc.id);
          setNotFound(false);
          const url = `/api/locations?latitude=${loc.latitude}&longitude=${loc.longitude}&radiusKm=20&limit=6&excludeId=${loc.id}`;
          fetch(url)
            .then((r2) => r2.json())
            .then((r2res) => {
              if (r2res.success && r2res.data?.items) {
                setNearby((r2res.data.items as Location[]) ?? []);
              }
            });
        } else {
          setNotFound(true);
          setLocation(null);
        }
      })
      .catch(() => setError("Bağlantı hatası."))
      .finally(() => setLoading(false));
  }, [params.id, trackEvent]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {},
      );
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share && location) {
      const n = locale === "en" ? location.nameEn : location.name;
      await navigator.share({ title: n, url: window.location.href });
    }
  };

  const handleRouteReady = useCallback((_r: RouteInfo | null) => {}, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container max-w-2xl mx-auto p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <ErrorRetry message={error} onRetry={loadLocation} />
        </main>
      </div>
    );
  }

  if (notFound || (!loading && !location)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
          <p className="text-muted-foreground text-center">
            {t("detail.notFound")}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/explore">{t("nav.explore")}</Link>
            </Button>
            <Button asChild>
              <Link href="/">{t("nav.map")}</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!location) return null;

  const name = locale === "en" ? location.nameEn : location.name;
  const desc = locale === "en" ? location.descriptionEn : location.description;
  const catName =
    locale === "en" ? location.category.nameEn : location.category.name;
  const fee = locale === "en" ? location.feeEn : location.fee;
  const address = locale === "en" ? location.addressEn : location.address;
  const gradient =
    CATEGORY_GRADIENTS[location.category.slug] || "from-teal-600 to-teal-800";
  const hasRealImage =
    location.images?.length > 0 && !location.images[0].startsWith("/images/");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container max-w-2xl mx-auto p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> {t("detail.back")}
          </Button>

          <div
            className={`relative h-48 sm:h-64 rounded-xl bg-gradient-to-br ${gradient} mb-4 flex items-center justify-center overflow-hidden`}
          >
            {hasRealImage ? (
              <img
                src={location.images[0]}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-30">
                <MapPin className="h-16 w-16 text-white" />
                <span className="text-white/60 text-xs font-medium tracking-wider uppercase">
                  {catName}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <Badge
                style={{
                  backgroundColor: location.category.color,
                  color: "white",
                }}
                className="mb-2"
              >
                {catName}
              </Badge>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {name}
              </h1>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              className="flex-1"
              style={{ backgroundColor: location.category.color }}
              onClick={() => setShowDirections(true)}
            >
              <Navigation className="h-3.5 w-3.5 mr-1.5" />
              {locale === "tr" ? "Nasıl Gidilir" : "How to Get There"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> {t("detail.share")}
            </Button>
          </div>

          <Card className="mb-4">
            <CardContent className="pt-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent className="pt-4 space-y-3">
              {location.visitHours && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-teal-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("detail.visitHours")}
                    </p>
                    <p className="text-sm">{location.visitHours}</p>
                  </div>
                </div>
              )}
              {fee && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Banknote className="h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("detail.fee")}
                      </p>
                      <p className="text-sm">{fee}</p>
                    </div>
                  </div>
                </>
              )}
              {address && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("detail.address")}
                      </p>
                      <p className="text-sm">{address}</p>
                    </div>
                  </div>
                </>
              )}
              {location.phone && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("detail.phone")}
                      </p>
                      <a
                        href={`tel:${location.phone}`}
                        className="text-sm text-teal-600 hover:underline"
                      >
                        {location.phone}
                      </a>
                    </div>
                  </div>
                </>
              )}
              {location.website && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("detail.website")}
                      </p>
                      <a
                        href={location.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-teal-600 hover:underline flex items-center gap-1"
                      >
                        {t("detail.website")}{" "}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </>
              )}
              {location.accessibility && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Accessibility className="h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("detail.accessibility")}
                      </p>
                      <p className="text-sm">{location.accessibility}</p>
                    </div>
                  </div>
                </>
              )}
              {(location.publicTransport || location.publicTransportEn) && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Bus className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("detail.publicTransport")}
                      </p>
                      <p className="text-sm">
                        {locale === "en"
                          ? location.publicTransportEn ||
                            location.publicTransport
                          : location.publicTransport}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {nearby.length > 0 && location && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold mb-2">
                {t("detail.nearbyPlaces")}
              </h2>
              <p className="text-xs text-muted-foreground mb-2">
                {t("detail.nearbyPlacesHint")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {nearby.map((loc) => {
                  const locName =
                    locale === "en" ? loc.nameEn : loc.name;
                  const distanceM = haversineDistance(
                    location.latitude,
                    location.longitude,
                    loc.latitude,
                    loc.longitude,
                  );
                  return (
                    <Link key={loc.id} href={`/locations/${loc.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 flex items-center gap-2">
                          <Badge
                            style={{
                              backgroundColor: loc.category.color,
                              color: "white",
                            }}
                            className="text-xs"
                          >
                            {locale === "en"
                              ? loc.category.nameEn
                              : loc.category.name}
                          </Badge>
                          <span className="text-sm font-medium truncate flex-1 min-w-0">
                            {locName}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDistance(distanceM)}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      {showDirections && (
        <DirectionsModal
          location={location}
          userPosition={userPos}
          onClose={() => setShowDirections(false)}
          onRouteReady={handleRouteReady}
        />
      )}
    </div>
  );
}
