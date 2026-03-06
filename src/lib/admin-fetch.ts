/**
 * Admin API istekleri için fetch sarmalayıcı.
 * - Authorization: Bearer token ekler (localStorage admin_token)
 * - 401: Oturumu temizler, toast gösterir, /admin/login'e yönlendirir
 * - 429: Rate limit mesajı toast ile gösterir
 */

import { toast } from "sonner";

const SESSION_EXPIRED_MSG = "Oturumunuz sona erdi. Tekrar giriş yapın.";
const RATE_LIMIT_MSG = "Çok fazla istek. Lütfen bir süre sonra tekrar deneyin.";

function clearAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  document.cookie = "admin_token=; path=/; max-age=0";
}

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    clearAdminSession();
    toast.error(SESSION_EXPIRED_MSG);
    window.location.href = "/admin/login";
    return res;
  }

  if (res.status === 429) {
    let msg = RATE_LIMIT_MSG;
    try {
      const data = await res.clone().json();
      if (data?.error && typeof data.error === "string") msg = data.error;
    } catch {
      // body parse edilemezse varsayılan mesaj
    }
    toast.error(msg);
    return res;
  }

  return res;
}
