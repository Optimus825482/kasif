"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ImagePlus,
  Search,
  Loader2,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface LocationRow {
  id: string;
  name: string;
  nameEn: string;
  category: { id: string; name: string; nameEn: string; color: string };
  images: string[];
}

interface WikimediaImage {
  url: string;
  thumbUrl: string;
  title: string;
}

export default function AdminImagesPage() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WikimediaImage[]>([]);
  const [searching, setSearching] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchWithoutImages = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      "/api/admin/locations?withoutImages=true&limit=500",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await res.json();
    if (data.success) {
      setLocations(data.data.items ?? []);
    } else {
      toast.error(data.error ?? "Liste alınamadı");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchWithoutImages();
  }, [fetchWithoutImages]);

  const openWikimediaDialog = (loc: LocationRow) => {
    setSelectedLocation(loc);
    setSearchQuery(`${loc.name} Balıkesir`);
    setSearchResults([]);
    setDialogOpen(true);
  };

  const runSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/admin/wikimedia/search?q=${encodeURIComponent(searchQuery.trim())}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.images)) {
        setSearchResults(data.data.images);
        if (data.data.images.length === 0) {
          toast.info("Sonuç bulunamadı. Arama terimini değiştirmeyi deneyin.");
        }
      } else {
        toast.error("Wikimedia araması başarısız.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setSearching(false);
    }
  }, [searchQuery, token]);

  useEffect(() => {
    if (!dialogOpen || !selectedLocation || !token) return;
    const initialQuery = `${selectedLocation.name} Balıkesir`;
    setSearchQuery(initialQuery);
    setSearching(true);
    fetch(
      `/api/admin/wikimedia/search?q=${encodeURIComponent(initialQuery)}&limit=20`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.images)) {
          setSearchResults(data.data.images);
        }
      })
      .catch(() => toast.error("Wikimedia araması başarısız."))
      .finally(() => setSearching(false));
  }, [dialogOpen, selectedLocation?.id, selectedLocation?.name, token]);

  const applyImage = async (imageUrl: string) => {
    if (!selectedLocation) return;
    setApplying(imageUrl);
    try {
      const res = await fetch(`/api/admin/locations/${selectedLocation.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ images: [imageUrl] }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${selectedLocation.name}" için görsel eklendi.`);
        setLocations((prev) => prev.filter((l) => l.id !== selectedLocation.id));
        setDialogOpen(false);
        setSelectedLocation(null);
        setSearchResults([]);
      } else {
        toast.error(data.error ?? "Görsel eklenemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ImagePlus className="h-6 w-6" />
          Eksik Görselli Lokasyonlar
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Görseli olmayan lokasyonları tespit edin ve Wikimedia Commons üzerinden
          otomatik görsel arayıp ekleyin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Görseli Olmayan Kayıtlar</CardTitle>
          <p className="text-xs text-muted-foreground font-normal">
            Aşağıdaki lokasyonların hiç görseli yok. &quot;Wikimedia&apos;da
            Ara&quot; ile Commons&apos;ta arama yapıp bir görsel seçerek ekleyebilirsiniz.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : locations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Tüm lokasyonlarda en az bir görsel var veya henüz lokasyon
              eklenmemiş.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Lokasyon</TableHead>
                  <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                  <TableHead className="w-40">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc, idx) => (
                  <TableRow key={loc.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{loc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {loc.nameEn}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        style={{
                          backgroundColor: loc.category.color,
                          color: "white",
                        }}
                        className="text-[10px]"
                      >
                        {loc.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWikimediaDialog(loc)}
                        >
                          <Search className="h-3.5 w-3.5 mr-1" />
                          Wikimedia&apos;da Ara
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          asChild
                        >
                          <a
                            href={`/admin/locations/${loc.id}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Düzenle"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Wikimedia Commons&apos;tan Görsel Seç
              {selectedLocation && (
                <span className="text-sm font-normal text-muted-foreground block mt-1">
                  {selectedLocation.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 flex-1 min-h-0 flex flex-col">
            <div className="flex gap-2">
              <Input
                placeholder="Arama (örn: Saat Kulesi Balıkesir)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
              <Button onClick={runSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex-1 overflow-auto rounded-lg border bg-muted/30 p-2 min-h-[200px]">
              {searchResults.length === 0 && !searching && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Arama yapın veya yukarıdaki varsayılan terimle ara butonuna
                  tıklayın.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {searchResults.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => applyImage(img.url)}
                    disabled={applying !== null}
                    className="relative group rounded-lg overflow-hidden border bg-background hover:ring-2 hover:ring-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 aspect-square"
                  >
                    <img
                      src={img.thumbUrl}
                      alt={img.title}
                      className="w-full h-full object-cover"
                    />
                    {applying === img.url ? (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-white text-center px-1 line-clamp-2">
                          Bu görseli ekle
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
