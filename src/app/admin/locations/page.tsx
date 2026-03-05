"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
};

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

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchLocations = useCallback(async () => {
    const res = await fetch(`/api/admin/locations?search=${search}&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setLocations(data.data.items);
    setLoading(false);
  }, [search, token]);

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
    });
    setDialogOpen(true);
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

  const updateForm = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Lokasyonlar</h1>
        <Button
          size="sm"
          className="bg-teal-600 hover:bg-teal-700"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4 mr-1" /> Yeni Ekle
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Lokasyon ara..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Kategori
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Koordinat
                  </TableHead>
                  <TableHead className="w-20">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Lokasyon bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{loc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {loc.nameEn}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          style={{
                            backgroundColor: loc.category.color,
                            color: "white",
                          }}
                          className="text-xs"
                        >
                          {loc.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(loc)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Lokasyon Düzenle" : "Yeni Lokasyon"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ad (TR) *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Name (EN) *</Label>
                <Input
                  value={form.nameEn}
                  onChange={(e) => updateForm("nameEn", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Açıklama (TR) *</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description (EN) *</Label>
                <Textarea
                  value={form.descriptionEn}
                  onChange={(e) => updateForm("descriptionEn", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kısa Açıklama (TR)</Label>
                <Input
                  value={form.shortDesc}
                  onChange={(e) => updateForm("shortDesc", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Short Desc (EN)</Label>
                <Input
                  value={form.shortDescEn}
                  onChange={(e) => updateForm("shortDescEn", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Enlem *</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => updateForm("latitude", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Boylam *</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => updateForm("longitude", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => updateForm("categoryId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ziyaret Saatleri</Label>
                <Input
                  value={form.visitHours}
                  onChange={(e) => updateForm("visitHours", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ücret (TR)</Label>
                <Input
                  value={form.fee}
                  onChange={(e) => updateForm("fee", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fee (EN)</Label>
                <Input
                  value={form.feeEn}
                  onChange={(e) => updateForm("feeEn", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Telefon</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Adres (TR)</Label>
                <Input
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Address (EN)</Label>
                <Input
                  value={form.addressEn}
                  onChange={(e) => updateForm("addressEn", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => updateForm("website", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Erişilebilirlik</Label>
                <Input
                  value={form.accessibility}
                  onChange={(e) => updateForm("accessibility", e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(v) => updateForm("isFeatured", v)}
              />
              <Label>Öne Çıkan</Label>
            </div>
            <Button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700"
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editId ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lokasyonu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu lokasyon silinecek. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
