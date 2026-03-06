"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorRetry } from "@/components/ui/error-retry";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Users,
  MapPinned,
  Layers,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailyTrend {
  date: string;
  count: number;
}
interface TopLocation {
  name: string;
  nameEn: string;
  categoryName: string;
  categoryColor: string;
  count: number;
}
interface EventByType {
  eventType: string;
  _count: { id: number };
}
interface CategoryStat {
  name: string;
  nameEn: string;
  color: string;
  count: number;
}
interface RecentEvent {
  id: string;
  eventType: string;
  sessionId: string;
  createdAt: string;
  location: { name: string } | null;
}
interface Stats {
  totalLocations: number;
  totalCategories: number;
  totalEvents: number;
  uniqueSessions: number;
  dailyTrends: DailyTrend[];
  topLocations: TopLocation[];
  eventsByType: EventByType[];
  categoryStats: CategoryStat[];
  recentEvents: RecentEvent[];
}

const PIE_COLORS = ["#0d9488", "#7c3aed", "#f59e0b", "#ef4444", "#3b82f6"];
const EVENT_LABELS: Record<string, string> = {
  map_view: "Harita Görüntüleme",
  marker_click: "İşaretçi Tıklama",
  detail_view: "Detay Görüntüleme",
  route_click: "Rota Tıklama",
  search: "Arama",
};

function relativeTime(d: string): string {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return m + " dk önce";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " saat önce";
  return Math.floor(h / 24) + " gün önce";
}

function fmtNum(n: number) {
  return n.toLocaleString("tr-TR");
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderPieLabel = (p: any) =>
  (p.name || "") + " " + ((p.percent || 0) * 100).toFixed(0) + "%";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { adminFetch } = await import("@/lib/admin-fetch");
      const r = await adminFetch("/api/admin/stats");
      if (!r.ok) {
        setLoading(false);
        if (r.status === 401 || r.status === 429) return;
        const res = await r.json().catch(() => ({}));
        setError(res.error ?? "Veriler yüklenemedi");
        return;
      }
      const res = await r.json();
      if (res.success) setStats(res.data);
      else setError(res.error ?? "Veriler yüklenemedi");
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = stats
    ? [
        {
          label: "Toplam Görüntülenme",
          value: stats.totalEvents,
          icon: Eye,
          color: "text-teal-600",
          bg: "bg-teal-100",
        },
        {
          label: "Tekil Ziyaretçi",
          value: stats.uniqueSessions,
          icon: Users,
          color: "text-violet-600",
          bg: "bg-violet-100",
        },
        {
          label: "Aktif Lokasyon",
          value: stats.totalLocations,
          icon: MapPinned,
          color: "text-amber-600",
          bg: "bg-amber-100",
        },
        {
          label: "Kategori",
          value: stats.totalCategories,
          icon: Layers,
          color: "text-rose-600",
          bg: "bg-rose-100",
        },
      ]
    : [];

  const trendData = (stats?.dailyTrends ?? []).map((t) => ({
    date: fmtDate(t.date),
    count: t.count,
  }));
  const eventPieData = (stats?.eventsByType ?? []).map((e) => ({
    name: EVENT_LABELS[e.eventType] ?? e.eventType,
    value: e._count.id,
  }));
  const topLocData = (stats?.topLocations ?? []).slice(0, 10);
  const categoryPieData = (stats?.categoryStats ?? []).map((c) => ({
    name: c.name,
    value: c.count,
    color: c.color,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-1" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[350px] rounded-xl" />
          <Skeleton className="h-[350px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || (!loading && !stats))
    return (
      <div className="flex items-center justify-center min-h-[300px] p-4">
        <ErrorRetry
          message={error ?? "Veriler yüklenemedi."}
          onRetry={loadStats}
        />
      </div>
    );

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ziyaretçi istatistikleri ve analitik verileri
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <Card key={c.label} className="shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className={
                  "h-12 w-12 rounded-xl " +
                  c.bg +
                  " flex items-center justify-center shrink-0"
                }
              >
                <c.icon className={"h-6 w-6 " + c.color} />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">
                  {fmtNum(c.value)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="details">Detaylar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  Günlük Ziyaretçi Trendi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient
                          id="tealGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0d9488"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0d9488"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#0d9488"
                        strokeWidth={2}
                        fill="url(#tealGradient)"
                        name="Görüntülenme"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-600" />
                  Olay Türü Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderPieLabel}
                        labelLine={false}
                      >
                        {eventPieData.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={PIE_COLORS[idx % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-amber-600" />
                  En Çok Ziyaret Edilen Lokasyonlar
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topLocData}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={120}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Görüntülenme"
                        radius={[0, 4, 4, 0]}
                      >
                        {topLocData.map((loc, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              loc.categoryColor ||
                              PIE_COLORS[idx % PIE_COLORS.length]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-rose-600" />
                  Kategori Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderPieLabel}
                        labelLine={false}
                      >
                        {categoryPieData.map((c, idx) => (
                          <Cell
                            key={idx}
                            fill={
                              c.color || PIE_COLORS[idx % PIE_COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {stats.recentEvents.slice(0, 20).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-2 text-sm border-b border-border/50 pb-2 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[11px] font-medium"
                    >
                      {EVENT_LABELS[ev.eventType] ?? ev.eventType}
                    </Badge>
                    <span className="truncate text-muted-foreground">
                      {ev.location?.name ?? "\u2014"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                    <span>{relativeTime(ev.createdAt)}</span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                      {ev.sessionId.slice(0, 8)}
                    </code>
                  </div>
                </div>
              ))}
              {stats.recentEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz aktivite yok.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              En Popüler Lokasyonlar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {topLocData.map((loc, idx) => (
                <div
                  key={loc.name}
                  className="flex items-center gap-3 text-sm border-b border-border/50 pb-2 last:border-0"
                >
                  <span className="text-lg font-bold text-muted-foreground w-6 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{loc.name}</p>
                    <Badge
                      variant="outline"
                      className="mt-0.5 text-[10px]"
                      style={{
                        borderColor: loc.categoryColor,
                        color: loc.categoryColor,
                      }}
                    >
                      {loc.categoryName}
                    </Badge>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold">{fmtNum(loc.count)}</span>
                    <p className="text-[10px] text-muted-foreground">
                      görüntülenme
                    </p>
                  </div>
                </div>
              ))}
              {topLocData.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz veri yok.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
