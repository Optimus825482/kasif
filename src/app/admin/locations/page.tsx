"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  X,
  ImagePlus,
  MapPin,
  Globe,
  Clock,
  Phone,
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
  description: string;
  descriptionEn: string;
  shortDesc: string;
  shortDescEn: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  category: { id: string; name: string; nameEn: string; color: string };
  images: string[];
  visitHours: string | null;
  fee: string | null;
  feeEn: string | null;
  address: string | null;
  addressEn: string | null;
  phone: string | null;
  website: string | null;
  accessibility: string | null;
  isActive: boolean;
  isFeatured: boolean;
}

const emptyForm = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  shortDesc: "",
  shortDescEn: "",
  latitude: "",
  longitude: "",
  categoryId: "",
  visitHours: "",
  fee: "",
  feeEn: "",
  address: "",
  addressEn: "",
  phone: "",
  website: "",
  accessibility: "",
  isFeatured: false,
  isActive: true,
  images: [] as string[],
};

/* ── Image Upload Thumbnail ── */
function ImageThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="group relative h-24 w-24 rounded-lg overflow-hidden border bg-muted">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Reset page when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filterCategory]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (loc: AdminLocation) => {
    setEditId(loc.id);
    setForm({
      name: loc.name,
      nameEn: loc.nameEn,
      description: loc.description,
      descriptionEn: loc.descriptionEn,
      shortDesc: loc.shortDesc,
      shortDescEn: loc.shortDescEn,
      latitude: String(loc.latitude),
      longitude: String(loc.longitude),
      categoryId: loc.categoryId,
      visitHours: loc.visitHours || "",
      fee: loc.fee || "",
      feeEn: loc.feeEn || "",
      address: loc.address || "",
      addressEn: loc.addressEn || "",
      phone: loc.phone || "",
      website: loc.website || "",
      accessibility: loc.accessibility || "",
      isFeatured: loc.isFeatured,
      isActive: loc.isActive,
      images: loc.images || [],
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (data.success) {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, data.data.url],
          }));
          const saved = data.data.savedPercent;
          toast.success(
            `${file.name} yüklendi${saved > 0 ? ` (${saved}% optimize)` : ""}`,
          );
        } else {
          toast.error(`${file.name}: ${data.error}`);
        }
      } catch {
        toast.error(`${file.name} yüklenemedi`);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (
      !form.name ||
      !form.nameEn ||
      !form.description ||
      !form.descriptionEn ||
      !form.latitude ||
      !form.longitude ||
      !form.categoryId
    ) {
      toast.error("Zorunlu alanları doldurun");
      return;
    }
    setSaving(true);
    try {
      const url = editId
        ? `/api/admin/locations/${editId}`
        : "/api/admin/locations";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editId ? "Lokasyon güncellendi" : "Lokasyon oluşturuldu");
        setDialogOpen(false);
        fetchLocations();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setSaving(false);
    }
  };

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

  const updateForm = (key: string, value: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const getCategoryColor = (id: string) =>
    categories.find((c) => c.id === id)?.color || "#6b7280";

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
          onClick={openCreate}
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
                            onClick={() => openEdit(loc)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editId ? (
                <>
                  <Pencil className="h-4 w-4" /> Lokasyon Düzenle
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Yeni Lokasyon
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Genel</TabsTrigger>
              <TabsTrigger value="details">Detaylar</TabsTrigger>
              <TabsTrigger value="images">
                Görseller
                {form.images.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 px-1.5 text-[10px]"
                  >
                    {form.images.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Ayarlar</TabsTrigger>
            </TabsList>

            {/* Tab: General */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Ad (TR) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Lokasyon adı"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Name (EN) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.nameEn}
                    onChange={(e) => updateForm("nameEn", e.target.value)}
                    placeholder="Location name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Açıklama (TR) <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    rows={4}
                    placeholder="Detaylı açıklama..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Description (EN) <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={form.descriptionEn}
                    onChange={(e) =>
                      updateForm("descriptionEn", e.target.value)
                    }
                    rows={4}
                    placeholder="Detailed description..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Kısa Açıklama (TR)
                  </Label>
                  <Input
                    value={form.shortDesc}
                    onChange={(e) => updateForm("shortDesc", e.target.value)}
                    placeholder="Kısa tanıtım"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Short Desc (EN)</Label>
                  <Input
                    value={form.shortDescEn}
                    onChange={(e) => updateForm("shortDescEn", e.target.value)}
                    placeholder="Short introduction"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Kategori <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => updateForm("categoryId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Enlem <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => updateForm("latitude", e.target.value)}
                    placeholder="39.6484"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Boylam <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => updateForm("longitude", e.target.value)}
                    placeholder="27.8826"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Details */}
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Ziyaret Saatleri
                  </Label>
                  <Input
                    value={form.visitHours}
                    onChange={(e) => updateForm("visitHours", e.target.value)}
                    placeholder="09:00 - 17:00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Telefon
                  </Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="+90 266 ..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Ücret (TR)</Label>
                  <Input
                    value={form.fee}
                    onChange={(e) => updateForm("fee", e.target.value)}
                    placeholder="Ücretsiz / 50 TL"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Fee (EN)</Label>
                  <Input
                    value={form.feeEn}
                    onChange={(e) => updateForm("feeEn", e.target.value)}
                    placeholder="Free / 50 TL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Adres (TR)
                  </Label>
                  <Textarea
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    rows={2}
                    placeholder="Tam adres..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Address (EN)
                  </Label>
                  <Textarea
                    value={form.addressEn}
                    onChange={(e) => updateForm("addressEn", e.target.value)}
                    rows={2}
                    placeholder="Full address..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Globe className="h-3 w-3" /> Website
                  </Label>
                  <Input
                    value={form.website}
                    onChange={(e) => updateForm("website", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Erişilebilirlik</Label>
                  <Input
                    value={form.accessibility}
                    onChange={(e) =>
                      updateForm("accessibility", e.target.value)
                    }
                    placeholder="Tekerlekli sandalye, otopark..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Images */}
            <TabsContent value="images" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" /> Görsel Yönetimi
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP veya AVIF formatında görseller yükleyin.
                    Görseller otomatik olarak WebP formatına dönüştürülüp
                    optimize edilir.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {form.images.map((src, i) => (
                      <ImageThumb
                        key={`${src}-${i}`}
                        src={src}
                        onRemove={() => removeImage(i)}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-teal-500/50 flex flex-col items-center justify-center gap-1 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            Yükle
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {form.images.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Henüz görsel eklenmedi. Yukarıdaki butona tıklayarak
                      görsel yükleyebilirsiniz.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Settings */}
            <TabsContent value="settings" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Öne Çıkan</Label>
                      <p className="text-xs text-muted-foreground">
                        Ana sayfada öne çıkan lokasyonlar arasında gösterilir
                      </p>
                    </div>
                    <Switch
                      checked={form.isFeatured}
                      onCheckedChange={(v) => updateForm("isFeatured", v)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Aktif</Label>
                      <p className="text-xs text-muted-foreground">
                        Pasif lokasyonlar haritada ve listede görünmez
                      </p>
                    </div>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(v) => updateForm("isActive", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700 min-w-32"
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editId ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
