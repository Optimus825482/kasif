"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPinned, Layers, BarChart3, Activity } from "lucide-react";

interface Stats {
  locationCount: number;
  categoryCount: number;
  eventCount: number;
  recentEvents: { eventType: string; _count: { id: number } }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setStats(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        {
          label: "Toplam Lokasyon",
          value: stats.locationCount,
          icon: MapPinned,
          color: "text-teal-600",
        },
        {
          label: "Kategori",
          value: stats.categoryCount,
          icon: Layers,
          color: "text-violet-600",
        },
        {
          label: "Toplam Olay",
          value: stats.eventCount,
          icon: BarChart3,
          color: "text-amber-600",
        },
      ]
    : [];

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {cards.map((c) => (
              <Card key={c.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${c.color}`}
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{c.value}</p>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {stats?.recentEvents && stats.recentEvents.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Olay Dağılımı
                </h2>
                <div className="space-y-2">
                  {stats.recentEvents.map((e) => (
                    <div
                      key={e.eventType}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {e.eventType}
                      </span>
                      <span className="font-medium">{e._count.id}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
