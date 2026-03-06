"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("admin_token", data.data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.data.admin));
        router.push("/admin");
      } else {
        setError(data.error || "Giriş başarısız");
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-background to-teal-50/30 p-4">
      <Card className="w-full max-w-sm shadow-lg border-0">
        <CardContent className="pt-8 pb-6">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 mb-4 shadow-md">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Yönetim Paneli</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Dijital Kaşif Admin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-medium">
                Kullanıcı Adı
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="pl-9"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">
                Şifre
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-sm"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Giriş Yap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
