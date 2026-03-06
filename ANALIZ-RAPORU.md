# Smartcity-App — Uygulama Analiz Raporu

**Tarih:** 6 Mart 2025  
**Analiz yöntemi:** Paralel analiz (Explore Agent + proje dosyaları incelemesi)

---

## 1. Genel Bakış

| Özellik | Değer |
|--------|--------|
| **Proje adı** | smartcity-app |
| **Tip** | Akıllı turizm PWA (Dijital Kaşif — Balıkesir odaklı) |
| **Framework** | Next.js 16.1.6 (App Router) |
| **React** | 19.2.3 |
| **Veritabanı** | PostgreSQL 16 (Prisma 7.4.2, driver adapter) |
| **UI** | Shadcn UI (new-york), Radix, Tailwind 4, Lucide |
| **Harita** | Leaflet, react-leaflet |
| **Grafik** | Recharts |
| **i18n** | next-intl (TR/EN) |

Uygulama kodu `src/` altında; route’lar `src/app/` içinde tanımlı.

---

## 2. Mimari Özet

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Next.js App Router)                                   │
│  src/app/ → sayfalar, layout, API route’lar                      │
│  src/components/ → ui, layout, map                               │
│  src/lib/ → auth, prisma, api-response, pagination, transit-guide │
│  src/services/ → location, category, analytics                   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  API Katmanı                                                     │
│  /api/locations, /api/categories, /api/events (public)           │
│  /api/auth/login (public)                                        │
│  /api/admin/* (Bearer JWT)                                       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Prisma + PostgreSQL (Docker: smartcity-db)                      │
│  Category, Location, Admin, AnalyticsEvent, AuditLog             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Route ve Sayfa Yapısı

| Path | Açıklama |
|------|----------|
| `/` | Ana sayfa: Leaflet harita, kategori filtre, arama, yakındakiler, rota modal |
| `/explore` | Lokasyon listesi (grid), arama, kategori filtre, `/locations/[id]` linkleri |
| `/about` | Hakkında: akademik vizyoner, özellikler, yayınlar, KVKK, geliştirici |
| `/locations/[id]` | Lokasyon detay: görsel, açıklama, iletişim, erişilebilirlik, toplu taşıma, “Nasıl gidilir” |
| `/admin` | Dashboard: Recharts istatistikleri (trend, olay türü, top lokasyonlar, kategoriler, son aktiviteler) |
| `/admin/login` | Admin giriş (username/password, JWT) |
| `/admin/locations` | Lokasyon listesi (tablo, sayfalama, arama, kategori, silme) |
| `/admin/locations/new` | Yeni lokasyon formu |
| `/admin/locations/[id]/edit` | Lokasyon düzenleme formu |

**Layout’lar:**
- **Root:** Metadata (title, description, OG, Twitter, manifest, appleWebApp), Inter font, `Providers` → `SplashScreen` → `children` → `BottomNav` → `PwaInstallPrompt` → `Toaster`, `lang="tr"`.
- **Admin:** Client component; `/admin/login` dışında `localStorage` ile token kontrolü, sidebar (Dashboard, Lokasyonlar, Çıkış, Siteye Dön).

---

## 4. API Özeti

| Method | Path | Auth | Açıklama |
|--------|------|------|----------|
| GET | `/api/locations` | Hayır | Sayfalı liste |
| GET | `/api/locations/all` | Hayır | Tüm aktif lokasyonlar |
| GET | `/api/locations/[id]` | Hayır | Tek lokasyon |
| GET | `/api/categories` | Hayır | Kategoriler |
| POST | `/api/events` | Hayır | Analitik olay (eventType, locationId, sessionId, metadata) |
| POST | `/api/auth/login` | Hayır | Admin login → JWT + admin bilgisi |
| GET | `/api/admin/locations` | Bearer | Admin lokasyon listesi (sayfalı, arama, categoryId) |
| POST | `/api/admin/locations` | Bearer | Yeni lokasyon + AuditLog |
| GET/PUT/DELETE | `/api/admin/locations/[id]` | Bearer | Get/update/soft-delete + AuditLog |
| GET | `/api/admin/stats` | Bearer | Dashboard istatistikleri |
| POST | `/api/admin/upload` | Bearer | Görsel yükleme (Sharp, WebP) |

Admin API’lerde `verifyToken(req)` ile Bearer JWT kontrolü yapılıyor.

---

## 5. Veritabanı Modelleri (Prisma)

| Model | Ana alanlar | İlişkiler |
|-------|-------------|-----------|
| **Category** | name, nameEn, icon, color, slug, sortOrder, isActive | → Location[] |
| **Location** | name, nameEn, description(s), lat/lng, categoryId, images[], visitHours, fee, address, phone, website, accessibility, publicTransport, isActive, isFeatured, deletedAt | → Category, AnalyticsEvent[] |
| **Admin** | username, email, password, name, role, isActive | → AuditLog[] |
| **AnalyticsEvent** | eventType, locationId?, sessionId, metadata | → Location? |
| **AuditLog** | adminId, action (CREATE/UPDATE/DELETE), entity, entityId, oldValue, newValue | → Admin |

Location için soft-delete (`deletedAt`) kullanılıyor.

---

## 6. Bileşen Organizasyonu

- **`src/components/ui/`:** Shadcn/Radix (alert-dialog, avatar, badge, button, card, command, dialog, dropdown-menu, form, input, label, popover, scroll-area, select, separator, sheet, skeleton, sonner, switch, table, tabs, textarea, tooltip).
- **`src/components/layout/`:** header (logo, nav, TR/EN), bottom-nav, consent-banner, sw-register, splash-screen, pwa-install.
- **`src/components/map/`:** tourism-map (Leaflet), location-card, category-filter, category-icons, search-bar, nearby-panel, directions-modal (OSRM + transit-guide).

Shadcn config: `components.json` — style: new-york, baseColor: neutral, alias’lar: `@/components`, `@/lib/utils`, `@/hooks`.

---

## 7. Auth Akışı

- **Login:** `POST /api/auth/login` (username, password) → Admin bulunur, `isActive` kontrolü, `comparePassword` → başarılıysa JWT (7 gün).
- **İstemci:** Token ve admin bilgisi `localStorage` (admin_token, admin_user); çıkışta temizlenir.
- **Koruma:** Admin layout’ta pathname ≠ `/admin/login` ise token kontrolü; yoksa `/admin/login`’e yönlendirme. API’de admin route’ları Bearer ile doğrulanır.
- **Not:** Refresh token yok; token httpOnly cookie’de değil; Next.js middleware kullanılmıyor.

---

## 8. Öne Çıkan Özellikler

- **Harita:** Leaflet, kategori filtre, arama, yakındakiler, “Nasıl gidilir” (yürüme/araç/transit, OSRM + custom transit-guide).
- **Transit-guide:** Balıkesir odaklı (hub’lar, ilçe bölgeleri, feribot); harici API yok, tamamen custom.
- **PWA:** Manifest, service worker, splash, kurulum prompt’u.
- **Analitik:** Consent banner; session_id; eventType: map_view, marker_click, detail_view, route_click, search → `/api/events`.
- **Admin:** Recharts dashboard; lokasyon CRUD; görsel yükleme (Sharp, WebP); AuditLog.

---

## 9. Docker ve Ortam

- **db:** postgres:16-alpine, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, healthcheck.
- **app:** Dockerfile build, port 3011, `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_*`, `NODE_ENV=production`, db health’e bağımlı.

---

## 10. İyileştirme Önerileri

| Alan | Öneri |
|------|--------|
| **Güvenlik** | JWT_SECRET fallback kaldırılmalı; production’da env zorunlu. Token httpOnly cookie + CSRF düşünülmeli. Admin/login ve API için rate limit. |
| **Auth** | Next.js middleware ile `/admin` koruması tek noktadan; refresh token ve yenileme akışı. |
| **Validasyon** | API body’leri için Zod (login, location create/update, events) tutarlı kullanılmalı. |
| **Hata yönetimi** | API’de yapılandırılmış hata cevabı ve client’ta net gösterim. |
| **Tip güvenliği** | LocationService create/update için `data: any` yerine Prisma/Zod tipleri; tekrarlar servise taşınabilir. |
| **Performans** | Lokasyon listesi/getById/getAll için cache (unstable_cache / React cache); harita verisi cache. |
| **i18n / SEO** | next-intl ile App Router locale segment entegrasyonu. |
| **Test** | Servis, auth, transit-guide unit testleri; API entegrasyon; kritik UI (login, harita, admin CRUD) için E2E (örn. Playwright). |
| **Monitoring** | Hata ve performans için log/APM. |
| **Transit-guide** | İleride GTFS veya harici API ile güncellenebilir. |

---

## 11. Kullanılan Eklentiler / Araçlar

- **Cursor Explore Agent:** Kod tabanı taraması, route/servis/component/Prisma özeti.
- **Proje dosyaları:** `package.json`, `docker-compose.yaml`, `prisma/schema.prisma`, `components.json`, `README.md`.
- **Serena MCP:** Proje listesinde smartcity-app aktif olmadığı için sadece şema bilgisi kullanıldı; detaylı sembol analizi yapılmadı.

---

## 12. Sonuç

Smartcity-app, Next.js 16 App Router ve Prisma ile kurulmuş, Balıkesir odaklı bir akıllı turizm PWA’sıdır. Harita (Leaflet), lokasyon CRUD, admin dashboard, analitik, PWA ve TR/EN i18n mevcut. Güvenlik (JWT, rate limit, httpOnly cookie), validasyon (Zod), test ve cache konularında iyileştirmeler rapora eklenmiştir.

---

## 13. Uygulanan İyileştirmeler (6 Mart 2025)

| Öneri | Uygulama |
|-------|----------|
| **JWT_SECRET zorunlu** | `src/lib/auth.ts`: `getJwtSecret()` production'da env yoksa hata fırlatıyor. |
| **Rate limit** | `src/lib/rate-limit.ts`: Login (5/dk), admin API (100/dk) in-memory. Login ve admin route'larda kullanılıyor. |
| **Zod validasyon** | `src/lib/validations.ts`: loginSchema, eventSchema, locationCreateSchema, locationUpdateSchema. |
| **Yapılandırılmış hata** | `errorResponse(error, status, errorCode?)`. Tüm API'lerde errorCode eklendi. |
| **Tip güvenliği** | LocationService.create/update Zod tipleri; admin route'ları servisi kullanıyor. |
| **Lokasyon cache** | getAll/getById için unstable_cache; revalidateTag admin CRUD sonrası. |
| **Middleware /admin** | `src/middleware.ts`: admin_token cookie ile /admin koruması; login/logout'ta cookie. |
| **Unit testler** | Vitest: validations.test.ts, rate-limit.test.ts. `npm run test` |
