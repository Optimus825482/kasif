"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Zap,
  Check,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
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

interface ScanResult {
  locationId: string;
  locationName: string;
  locationNameEn: string;
  category: string;
  categoryColor: string;
  imageUrl?: string;
  thumbUrl?: string;
  originalUrl?: string;
  source?: string;
  strategy?: string;
  status: "found" | "not-found" | "applied" | "rejected";
}

type ScanState = "idle" | "scanning" | "complete";

export default function AdminImagesPage() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationRow | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WikimediaImage[]>([]);
  const [searching, setSearching] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  // Auto-scan state
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [scanProgress, setScanProgress] = useState({ processed: 0, total: 0 });
  const [scanStats, setScanStats] = useState({ found: 0, notFound: 0 });
  const [currentScanItem, setCurrentScanItem] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ─── Fetch locations without images ───
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

  // ─── Manual Wikimedia dialog ───
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen, selectedLocation?.id]);

  // ─── Apply image to single location ───
  const applyImage = async (
    locationId: string,
    imageUrl: string,
    fromScan = false,
  ) => {
    setApplying(imageUrl);
    try {
      const res = await fetch(`/api/admin/locations/${locationId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ images: [imageUrl] }),
      });
      const data = await res.json();
      if (data.success) {
        if (fromScan) {
          // Scan sonucunu güncelle
          setScanResults((prev) =>
            prev.map((r) =>
              r.locationId === locationId ? { ...r, status: "applied" } : r,
            ),
          );
          toast.success("Görsel uygulandı ✓");
        } else {
          // Dialog modunda
          if (selectedLocation) {
            toast.success(`"${selectedLocation.name}" için görsel eklendi.`);
          }
          setLocations((prev) => prev.filter((l) => l.id !== locationId));
          setDialogOpen(false);
          setSelectedLocation(null);
          setSearchResults([]);
        }
      } else {
        toast.error(data.error ?? "Görsel eklenemedi.");
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setApplying(null);
    }
  };

  // ─── Reject scan result ───
  const rejectResult = (locationId: string) => {
    setScanResults((prev) =>
      prev.map((r) =>
        r.locationId === locationId ? { ...r, status: "rejected" } : r,
      ),
    );
  };

  // ─── Apply all pending results ───
  const applyAllPending = async () => {
    const pending = scanResults.filter(
      (r) => r.status === "found" && r.imageUrl,
    );
    if (!pending.length) return;

    toast.info(`${pending.length} görsel uygulanıyor...`);
    let success = 0;

    for (const result of pending) {
      try {
        const res = await fetch(`/api/admin/locations/${result.locationId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ images: [result.imageUrl] }),
        });
        const data = await res.json();
        if (data.success) {
          success++;
          setScanResults((prev) =>
            prev.map((r) =>
              r.locationId === result.locationId
                ? { ...r, status: "applied" }
                : r,
            ),
          );
        }
      } catch {
        // continue
      }
    }

    toast.success(`${success}/${pending.length} görsel başarıyla uygulandı.`);
    fetchWithoutImages();
  };

  // ─── Auto-scan with SSE ───
  const startAutoScan = () => {
    if (!token) return;
    setScanState("scanning");
    setScanResults([]);
    setScanProgress({ processed: 0, total: 0 });
    setScanStats({ found: 0, notFound: 0 });
    setCurrentScanItem("");

    const abort = new AbortController();
    abortRef.current = abort;

    const evtSource = new EventSource(
      `/api/admin/images/auto-scan?token=${token}`,
    );

    // SSE doesn't support custom headers, so we use fetch with stream reader
    fetch("/api/admin/images/auto-scan", {
      headers: { Authorization: `Bearer ${token}` },
      signal: abort.signal,
    })
      .then(async (response) => {
        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let eventType = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                handleSSEEvent(eventType, data);
              } catch {
                // ignore parse errors
              }
            }
          }
        }

        setScanState("complete");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          toast.error("Tarama hatası: " + err.message);
        }
        setScanState("complete");
      });

    evtSource.close();
  };

  const handleSSEEvent = (
    event: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ) => {
    switch (event) {
      case "start":
        setScanProgress({ processed: 0, total: data.total });
        break;

      case "progress":
        setCurrentScanItem(data.locationName);
        setScanProgress((prev) => ({
          ...prev,
          processed: data.index,
        }));
        break;

      case "found":
        setScanResults((prev) => [
          ...prev,
          {
            locationId: data.locationId,
            locationName: data.locationName,
            locationNameEn: data.locationNameEn,
            category: data.category,
            categoryColor: data.categoryColor,
            imageUrl: data.imageUrl,
            thumbUrl: data.thumbUrl,
            originalUrl: data.originalUrl,
            source: data.source,
            strategy: data.strategy,
            status: "found",
          },
        ]);
        setScanStats(data.stats);
        setScanProgress({ processed: data.stats.processed, total: data.total });
        break;

      case "not-found":
        setScanResults((prev) => [
          ...prev,
          {
            locationId: data.locationId,
            locationName: data.locationName,
            locationNameEn: data.locationNameEn,
            category: data.category,
            categoryColor: data.categoryColor,
            status: "not-found",
          },
        ]);
        setScanStats(data.stats);
        setScanProgress({ processed: data.stats.processed, total: data.total });
        break;

      case "complete":
        setScanState("complete");
        toast.success(data.message);
        break;

      case "error":
        toast.error(data.message);
        setScanState("complete");
        break;
    }
  };

  const stopScan = () => {
    abortRef.current?.abort();
    setScanState("complete");
    toast.info("Tarama durduruldu.");
  };

  const progressPercent =
    scanProgress.total > 0
      ? Math.round((scanProgress.processed / scanProgress.total) * 100)
      : 0;

  const pendingCount = scanResults.filter((r) => r.status === "found").length;
  const appliedCount = scanResults.filter((r) => r.status === "applied").length;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImagePlus className="h-6 w-6" />
            Eksik Görselli Lokasyonlar
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Görseli olmayan lokasyonları tespit edin, otomatik olarak Wikipedia
            ve Wikimedia Commons&apos;tan gerçek fotoğraflarını bulun.
          </p>
        </div>
        {!loading && locations.length > 0 && scanState === "idle" && (
          <Button onClick={startAutoScan} className="gap-2 shrink-0">
            <Zap className="h-4 w-4" />
            Tümünü Otomatik Tara
          </Button>
        )}
      </div>

      {/* ─── Auto-Scan Progress ─── */}
      {scanState !== "idle" && (
        <Card className="border-teal-500/30 bg-teal-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {scanState === "scanning" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {scanState === "scanning"
                  ? "Otomatik Tarama Devam Ediyor..."
                  : "Tarama Tamamlandı"}
              </CardTitle>
              <div className="flex items-center gap-2">
                {scanState === "scanning" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stopScan}
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" /> Durdur
                  </Button>
                )}
                {scanState === "complete" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setScanState("idle");
                      setScanResults([]);
                      fetchWithoutImages();
                    }}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Sıfırla
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {scanState === "scanning" && currentScanItem
                    ? `Arıyor: ${currentScanItem}`
                    : `İşlenen: ${scanProgress.processed}/${scanProgress.total}`}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-700 font-medium">
                  {scanStats.found} bulundu
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-600 font-medium">
                  {scanStats.notFound} bulunamadı
                </span>
              </div>
              {appliedCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    {appliedCount} uygulandı
                  </span>
                </div>
              )}
              {pendingCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-amber-700 font-medium">
                    {pendingCount} onay bekliyor
                  </span>
                </div>
              )}
            </div>

            {/* Bulk apply button */}
            {pendingCount > 0 && scanState === "complete" && (
              <Button
                onClick={applyAllPending}
                className="gap-2 w-full"
                variant="default"
              >
                <Check className="h-4 w-4" />
                {pendingCount} Görseli Toplu Uygula
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Scan Results ─── */}
      {scanResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tarama Sonuçları</CardTitle>
            <p className="text-xs text-muted-foreground">
              Bulunan görselleri kontrol edip onaylayın veya reddedin.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {scanResults
                .filter((r) => r.imageUrl)
                .map((result) => (
                  <div
                    key={result.locationId}
                    className={`rounded-xl border overflow-hidden transition-all ${
                      result.status === "applied"
                        ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                        : result.status === "rejected"
                          ? "border-red-500/30 bg-red-50/30 opacity-50 dark:bg-red-950/10"
                          : "border-border hover:border-teal-500/50"
                    }`}
                  >
                    {/* Image preview */}
                    <div className="relative aspect-video bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={result.thumbUrl || result.imageUrl}
                        alt={result.locationName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%239ca3af' font-size='14'%3EYüklenemedi%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      {result.status === "applied" && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      {result.status === "rejected" && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                          <X className="h-3 w-3" />
                        </div>
                      )}
                      <button
                        onClick={() =>
                          setPreviewUrl(
                            result.originalUrl || result.imageUrl || null,
                          )
                        }
                        className="absolute top-2 left-2 bg-black/60 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                        title="Tam boyut önizleme"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-2.5">
                      <p className="text-sm font-medium truncate">
                        {result.locationName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          style={{
                            backgroundColor: result.categoryColor,
                            color: "white",
                          }}
                          className="text-[9px] px-1.5 py-0"
                        >
                          {result.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {result.source}
                        </span>
                      </div>

                      {/* Actions */}
                      {result.status === "found" && (
                        <div className="flex gap-1.5 mt-2">
                          <Button
                            size="sm"
                            className="flex-1 h-7 text-xs gap-1"
                            onClick={() =>
                              applyImage(
                                result.locationId,
                                result.imageUrl!,
                                true,
                              )
                            }
                            disabled={applying === result.imageUrl}
                          >
                            {applying === result.imageUrl ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Onayla
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => rejectResult(result.locationId)}
                          >
                            <X className="h-3 w-3" /> Reddet
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => {
                              const loc = locations.find(
                                (l) => l.id === result.locationId,
                              );
                              if (loc) openWikimediaDialog(loc);
                            }}
                            title="Manuel ara"
                          >
                            <Search className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {result.status === "applied" && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Uygulandı
                        </p>
                      )}
                      {result.status === "rejected" && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Reddedildi
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Not found list */}
            {scanResults.filter((r) => r.status === "not-found").length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2 text-muted-foreground">
                  ❌ Görsel Bulunamayan Lokasyonlar (manuel arama gerekli)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {scanResults
                    .filter((r) => r.status === "not-found")
                    .map((r) => (
                      <button
                        key={r.locationId}
                        className="text-xs px-2 py-1 rounded-md border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => {
                          const loc = locations.find(
                            (l) => l.id === r.locationId,
                          );
                          if (loc) openWikimediaDialog(loc);
                        }}
                      >
                        {r.locationName}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Locations table (when not scanning) ─── */}
      {scanState === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Görseli Olmayan Kayıtlar
            </CardTitle>
            <p className="text-xs text-muted-foreground font-normal">
              Aşağıdaki lokasyonların hiç görseli yok. &quot;Wikimedia&apos;da
              Ara&quot; ile tek tek arayın ya da &quot;Tümünü Otomatik
              Tara&quot; ile toplu arama başlatın.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : locations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                🎉 Tüm lokasyonlarda en az bir görsel var!
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Toplam {locations.length} kayıt görselsiz
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Lokasyon</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Kategori
                      </TableHead>
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
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Manual Wikimedia Dialog ─── */}
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
                  Arama yapın veya varsayılan terimle otomatik arama bekleyin.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {searchResults.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() =>
                      selectedLocation &&
                      applyImage(selectedLocation.id, img.url)
                    }
                    disabled={applying !== null}
                    className="relative group rounded-lg overflow-hidden border bg-background hover:ring-2 hover:ring-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 aspect-square"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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

      {/* ─── Image Preview Dialog ─── */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Görsel Önizleme</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
