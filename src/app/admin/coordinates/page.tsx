"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ExternalLink, MapPin, RefreshCw } from "lucide-react";

interface CoordLocation {
  id: string;
  name: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  category?: { name: string };
}

function parseCoordInput(value: string): { lat: number; lon: number } | null {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const parts = trimmed.split(/[,;\s]+/);
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0].trim());
  const lon = parseFloat(parts[1].trim());
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export default function AdminCoordinatesPage() {
  const [locations, setLocations] = useState<CoordLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "/api/admin/locations?page=1&limit=500",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success && data.data?.items) {
        const list = data.data.items as CoordLocation[];
        list.sort((a, b) => a.name.localeCompare(b.name, "tr"));
        setLocations(list);
      } else {
        toast.error(data.error ?? "Lokasyonlar yüklenemedi");
      }
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleUpdateCoord = async (
    id: string,
    lat: number,
    lon: number
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/locations/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      const data = await res.json();
      if (data.success) {
        setLocations((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, latitude: lat, longitude: lon } : l
          )
        );
        toast.success("Koordinat güncellendi");
        inputRefs.current[id]?.blur();
      } else {
        toast.error(data.error ?? "Güncelleme başarısız");
      }
    } catch {
      toast.error("İstek hatası");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCoordInput = (id: string, value: string) => {
    const parsed = parseCoordInput(value);
    if (parsed) {
      handleUpdateCoord(id, parsed.lat, parsed.lon);
      const input = inputRefs.current[id];
      if (input) input.value = "";
    }
  };

  const handlePaste = (id: string, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (!pasted) return;
    const parsed = parseCoordInput(pasted);
    if (parsed) {
      e.preventDefault();
      handleUpdateCoord(id, parsed.lat, parsed.lon);
      const input = inputRefs.current[id];
      if (input) {
        input.value = "";
        input.blur();
      }
    }
  };

  const openInMaps = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-teal-600" />
            Koordinat Doğrulama
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Lokasyonları Google Maps’te açıp kontrol edin; yeni koordinatı virgülle ayırarak yapıştırın, otomatik güncellenir.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Listeyi yenile
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Tüm lokasyonlar ({locations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[calc(100vh-220px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Ad</TableHead>
                  <TableHead className="whitespace-nowrap">Enlem</TableHead>
                  <TableHead className="whitespace-nowrap">Boylam</TableHead>
                  <TableHead className="w-[100px]">Haritada aç</TableHead>
                  <TableHead className="min-w-[220px]">Yeni koordinat (enlem, boylam)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc, idx) => (
                  <TableRow key={loc.id}>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{loc.name}</span>
                      {loc.category?.name && (
                        <span className="block text-xs text-muted-foreground">
                          {loc.category.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {loc.latitude}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {loc.longitude}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        onClick={() => openInMaps(loc.latitude, loc.longitude)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Aç
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Input
                        ref={(el) => {
                          inputRefs.current[loc.id] = el;
                        }}
                        placeholder="40.12, 27.88 yapıştır"
                        className="font-mono text-sm h-9"
                        disabled={updatingId === loc.id}
                        onPaste={(e) => handlePaste(loc.id, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const v = (e.target as HTMLInputElement).value;
                            handleCoordInput(loc.id, v);
                          }
                        }}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v.includes(",") || v.includes(";") || /\s\d+\.\d+/.test(v)) {
                            handleCoordInput(loc.id, v);
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
