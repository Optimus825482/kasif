"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  LayoutDashboard,
  MapPinned,
  Crosshair,
  LogOut,
  ChevronLeft,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{ name: string; role: string } | null>(
    null,
  );

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    if (!token || !user) {
      router.push("/admin/login");
      return;
    }
    try {
      setAdmin(JSON.parse(user));
    } catch {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!admin) return null;

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/locations", label: "Lokasyonlar", icon: MapPinned },
    { href: "/admin/coordinates", label: "Koordinat Doğrula", icon: Crosshair },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-card hidden md:flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Admin Panel</p>
              <p className="text-[10px] text-muted-foreground">Dijital Kaşif</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium truncate">{admin.name}</p>
            <p className="text-[10px] text-muted-foreground">{admin.role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Çıkış Yap
          </Button>
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 mt-1"
            >
              <ChevronLeft className="h-4 w-4" /> Siteye Dön
            </Button>
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-muted/30">
        <div className="md:hidden flex items-center justify-between p-3 border-b bg-card">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <MapPin className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">Admin</span>
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
