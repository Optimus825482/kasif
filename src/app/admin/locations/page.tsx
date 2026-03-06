"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Star,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Category } from "@/types";

interface AdminLocation {
  id: string;
  name: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  category: { id: string; name: string; nameEn: string; color: string };
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export default function AdminLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const LIMIT = 15;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      page: String(page),
      limit: String(LIMIT),
    });
    if (filterCategory !== "all") params.set("categoryId", filterCategory);
    const res = await fetch(`/api/admin/locations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      setLocations(data.data.items);
      setTotalPages(data.data.pageCount);
      setTotal(data.data.total);
    }
    setLoading(false);
  }, [search, page, filterCategory, token]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data);
      });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterCategory]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/locations/${deleteId}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Lokasyon silindi");
        fetchLocations();
      } else toast.error(data.error);
    } catch {
      toast.error("Silme başarısız");
    }
    setDeleteId(null);
  };

  const toggleActive = async (loc: AdminLocation) => {
    try {
      const res = await fetch(`/api/admin/locations/${loc.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ isActive: !loc.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          loc.isActive ? "Lokasyon gizlendi" : "Lokasyon aktifleştirildi",
        );
        fetchLocations();
      }
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold">Lokasyon Yönetimi</h1>
          <p className="text-sm text-muted-foreground">
            {total} lokasyon kayıtlı
          </p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 shadow-sm"
          onClick={() => router.push("/admin/locations/new")}
        >
          <Plus className="h-4 w-4 mr-1.5" /> Yeni Lokasyon
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lokasyon ara..."
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategori filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Lokasyon</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Kategori
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Görsel</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Koordinat
                  </TableHead>
                  <TableHead className="w-16">Durum</TableHead>
                  <TableHead className="w-24">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-12"
                    >
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      Lokasyon bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc, idx) => (
                    <TableRow
                      key={loc.id}
                      className={!loc.isActive ? "opacity-50" : ""}
                    >
                      <TableCell className="text-xs text-muted-foreground">
                        {(page - 1) * LIMIT + idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {loc.images?.[0] ? (
                            <img
                              src={loc.images[0]}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {loc.name}
                              {loc.isFeatured && (
                                <Star className="inline h-3 w-3 ml-1 text-amber-500 fill-amber-500" />
                              )}
                            </p>
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
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {loc.images?.length || 0} görsel
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground font-mono">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => toggleActive(loc)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title={loc.isActive ? "Gizle" : "Aktifleştir"}
                        >
                          {loc.isActive ? (
                            <Eye className="h-4 w-4 text-teal-600" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              router.push(`/admin/locations/${loc.id}/edit`)
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(loc.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Sayfa {page} / {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lokasyonu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu lokasyon kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
