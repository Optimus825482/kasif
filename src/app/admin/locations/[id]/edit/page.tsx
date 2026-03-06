"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  X,
  ImagePlus,
  ImageIcon,
  MapPin,
  Globe,
  Clock,
  Phone,
} from "lucide-react";
import type { Category } from "@/types";
import { getImageSrc } from "@/lib/image-src";

function ImageThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  const [error, setError] = useState(false);
  return (
    <div className="group relative h-24 w-24 rounded-lg overflow-hidden border bg-muted">
      {error ? (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
        </div>
      ) : (
        <img
          src={getImageSrc(src)}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      )}
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

export default function EditLocationPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
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
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data);
      });
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const { adminFetch } = await import("@/lib/admin-fetch");
        const r = await adminFetch(`/api/admin/locations/${id}`);
        if (cancelled) return;
        if (!r.ok) {
          if (r.status === 401 || r.status === 429) return;
          toast.error("Lokasyon bulunamadı");
          router.push("/admin/locations");
          return;
        }
        const res = await r.json();
        if (res.success) {
          const loc = res.data;
          setForm({
            name: loc.name || "",
            nameEn: loc.nameEn || "",
            description: loc.description || "",
            descriptionEn: loc.descriptionEn || "",
            shortDesc: loc.shortDesc || "",
            shortDescEn: loc.shortDescEn || "",
            latitude: String(loc.latitude || ""),
            longitude: String(loc.longitude || ""),
            categoryId: loc.categoryId || "",
            visitHours: loc.visitHours || "",
            fee: loc.fee || "",
            feeEn: loc.feeEn || "",
            address: loc.address || "",
            addressEn: loc.addressEn || "",
            phone: loc.phone || "",
            website: loc.website || "",
            accessibility: loc.accessibility || "",
            isFeatured: loc.isFeatured || false,
            isActive: loc.isActive ?? true,
            images: loc.images || [],
          });
        } else {
          toast.error("Lokasyon bulunamadı");
          router.push("/admin/locations");
        }
      } catch {
        if (!cancelled) {
          toast.error("Lokasyon yüklenemedi");
          router.push("/admin/locations");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, router]);

  const updateForm = (key: string, value: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const { adminFetch } = await import("@/lib/admin-fetch");
        const res = await adminFetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        if (res.status === 401 || res.status === 429) return;
        const data = await res.json();
        if (data.success) {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, data.data.url],
          }));
          toast.success(
            `${file.name} yüklendi${data.data.savedPercent > 0 ? ` (${data.data.savedPercent}% optimize)` : ""}`,
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
      const { adminFetch } = await import("@/lib/admin-fetch");
      const res = await adminFetch(`/api/admin/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        }),
      });
      if (res.status === 401 || res.status === 429) return;
      const data = await res.json();
      if (data.success) {
        toast.success("Lokasyon güncellendi");
        router.push("/admin/locations");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/locations")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Lokasyon Düzenle</h1>
            <p className="text-sm text-muted-foreground">{form.name}</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 min-w-32"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Güncelle
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4 mb-6">
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

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Açıklama (TR) <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    rows={5}
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
                    rows={5}
                    placeholder="Detailed description..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">İletişim & Detaylar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImagePlus className="h-4 w-4" /> Görsel Yönetimi
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP veya AVIF formatında görseller yükleyin.
                Görseller otomatik olarak WebP formatına dönüştürülüp optimize
                edilir.
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
                  Henüz görsel eklenmedi. Yukarıdaki butona tıklayarak görsel
                  yükleyebilirsiniz.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
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
    </div>
  );
}
