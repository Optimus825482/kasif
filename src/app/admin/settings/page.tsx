"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorRetry } from "@/components/ui/error-retry";
import { Settings, Bell, Save, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [notificationRadiusKm, setNotificationRadiusKm] = useState<number>(30);
  const [savedRadius, setSavedRadius] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { adminFetch } = await import("@/lib/admin-fetch");
      const r = await adminFetch("/api/admin/settings");
      if (!r.ok) {
        setLoading(false);
        if (r.status === 401 || r.status === 429) return;
        setError("Ayarlar yüklenemedi.");
        return;
      }
      const res = await r.json();
      if (res.success && res.data?.notificationRadiusKm != null) {
        const km = Number(res.data.notificationRadiusKm);
        setNotificationRadiusKm(km);
        setSavedRadius(km);
      }
    } catch {
      setError("Ayarlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    const km = Math.round(Number(notificationRadiusKm));
    if (km < 1 || km > 500) {
      setError("Mesafe 1–500 km arasında olmalıdır.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const { adminFetch } = await import("@/lib/admin-fetch");
      const r = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationRadiusKm: km }),
      });
      if (!r.ok) {
        if (r.status === 401 || r.status === 429) return;
        const res = await r.json().catch(() => ({}));
        setError(res.error ?? "Kaydetme başarısız.");
        return;
      }
      const res = await r.json();
      if (res.success) {
        setSavedRadius(res.data.notificationRadiusKm);
        setNotificationRadiusKm(res.data.notificationRadiusKm);
      } else {
        setError(res.error ?? "Kaydetme başarısız.");
      }
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  if (error && !savedRadius) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <ErrorRetry message={error} onRetry={loadSettings} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Uygulama Ayarları
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bildirim menzili ve diğer uygulama ayarları.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Bildirim menzili (km)
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Kullanıcı konum ve bildirim izni verdikten sonra, bu yarıçap (km) içindeki yerler kullanıcıya bildirim olarak gösterilir. Varsayılan: 30 km.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="radius">Menzil (km)</Label>
            <Input
              id="radius"
              type="number"
              min={1}
              max={500}
              value={notificationRadiusKm}
              onChange={(e) => setNotificationRadiusKm(Number(e.target.value) || 30)}
            />
            <p className="text-xs text-muted-foreground">1–500 km arası</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Kaydet
          </Button>
          {savedRadius != null && !saving && (
            <p className="text-xs text-muted-foreground">
              Kaydedilen değer: {savedRadius} km
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
