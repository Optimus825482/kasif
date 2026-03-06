# Sistem Analizi — Geliştirilecek Kısımlar ve Olası Hatalar

**Tarih:** 6 Mart 2026  
**Kapsam:** Smartcity-app (Dijital Kaşif) genel inceleme.

---

## 1. Tespit Edilen / Olası Hatalar

### 1.1 Uploads API — Path traversal (düşük risk)
- **Dosya:** `src/app/api/uploads/[[...path]]/route.ts`
- **Durum:** `filename.includes("..")` ile basit kontrol var; URL decode veya farklı encoding ile bypass teorik olarak mümkün.
- **Öneri:** Resolve sonrası path’in `UPLOADS_DIR` altında kaldığını garanti edin:
  ```ts
  const filePath = path.resolve(UPLOADS_DIR, filename);
  if (!filePath.startsWith(path.resolve(UPLOADS_DIR))) return new Response(null, { status: 400 });
  ```

### 1.2 Rate limit — Çoklu instance
- **Dosya:** `src/lib/rate-limit.ts`
- **Durum:** In-memory Map kullanılıyor; birden fazla sunucu/instance’da her biri kendi sayacını tutar. Saldırgan instance başına 5 login denemesi alabilir.
- **Öneri:** Production’da Redis (veya benzeri) ile merkezi rate limit. Dokümantasyonda “production’da Redis kullanın” notu mevcut, uygulama planı yapılabilir.

### 1.3 Events API — Spam / DoS
- **Dosya:** `src/app/api/events/route.ts`
- **Durum:** Public POST; `eventType`, `sessionId` vb. ile analitik event kaydediliyor. Rate limit yok; çok yüksek istek ile DB ve log dolu olabilir.
- **Öneri:** IP veya session bazlı rate limit (ör. dakikada en fazla N event) ekleyin.

### 1.4 Proxy-image — Content-Type güvenliği
- **Dosya:** `src/app/api/proxy-image/route.ts`
- **Durum:** Wikimedia’dan gelen `Content-Type` doğrudan iletiliyor. Teorik olarak script/html dönmesi durumunda XSS riski (pratikte Wikimedia’dan image beklenir).
- **Öneri:** Sadece `image/*` MIME tiplerine izin verin; değilse 502 veya varsayılan `image/jpeg` ile devam etmeyin, hata dönün.

---

## 2. Geliştirilmesi Gereken Kısımlar

### 2.1 Güvenlik
| Konu | Durum | Öneri |
|------|--------|--------|
| JWT | Cookie + localStorage | Production’da token’ı mümkünse httpOnly cookie’de tutun; XSS’te çalınma riski azalır. |
| Admin middleware | Sadece cookie kontrolü | `/admin` sayfa koruması iyi; API’ler Bearer ile ayrı korunuyor. |
| CORS | Varsayılan Next | Admin API’lerini sadece kendi domain’inizden çağırın; gerekirse CORS kısıtlayın. |

### 2.2 Hata yönetimi ve UX
- **API hata mesajları:** Birçok sayfada `error` state ve “Yeniden dene” var; bazı fetch’lerde hâlâ sadece `setLoading(false)` yapılıp kullanıcıya mesaj verilmiyor. Tüm veri çeken ekranlarda hata mesajı + yeniden dene tutarlı hale getirilebilir.
- **401 / token süresi:** Admin’de token süresi dolunca API 401 döner; client’ta otomatik login sayfasına yönlendirme ve “Oturumunuz sona erdi” toast’ı eklenebilir.
- **Rate limit 429:** Client’ta `RATE_LIMIT_EXCEEDED` veya 429 için “Çok fazla istek; X saniye sonra tekrar deneyin” gibi mesaj gösterilebilir.

### 2.3 Performans
- **Harita:** Tüm lokasyonlar tek seferde marker olarak yükleniyor. Lokasyon sayısı çok artarsa viewport/cluster (ör. Leaflet.markercluster) veya sadece görünür bölgedeki lokasyonları gösterme düşünülebilir.
- **Events API:** Her tıklamada/etkileşimde ayrı POST; gerekirse batch (örn. 5–10 event’i bir istekte gönderme) ile istek sayısı azaltılabilir.

### 2.4 Veri ve cache
- **React Query / SWR:** Şu an doğrudan `fetch` + `useState` kullanılıyor. Merkezi data layer (React Query veya SWR) ile loading/error/cache/refetch tek yerde toplanabilir; admin CRUD sonrası ilgili listelerin invalidate edilmesi kolaylaşır.
- **Stale-while-revalidate:** Lokasyon listesi ve ayarlar için SWR/React Query ile “önce cache göster, arka planda güncelle” davranışı verilebilir.

### 2.5 Erişilebilirlik ve i18n
- **Odak ve klavye:** Modal açıldığında focus trap ve Escape ile kapatma kontrol edilebilir; harita marker’larına klavye ile erişim (tab order) iyileştirilebilir.
- **Çeviri:** Bazı metinler hâlâ sabit TR/EN (örn. “Detayları Gör” / “View Details”); tamamı `tr.json` / `en.json` anahtarlarına taşınabilir.
- **Alt metinleri:** Lokasyon görsellerinde `alt` için anlamlı metin (lokasyon adı veya kısa açıklama) kullanılabilir.

### 2.6 Test ve kalite
- **E2E:** Login, harita tıklama, lokasyon detay, admin CRUD gibi kritik akışlar için Playwright (veya benzeri) E2E testleri eklenebilir.
- **API testleri:** `/api/events`, `/api/locations`, `/api/auth/login` için entegrasyon testleri yazılabilir.

---

## 3. Tutarlılık Kontrolleri

| Alan | Durum |
|------|--------|
| Admin API auth | Tüm `/api/admin/*` route’larında `verifyToken(req)` kullanılıyor. |
| Public API | `/api/locations`, `/api/categories`, `/api/settings`, `/api/events` auth gerektirmiyor; tasarım gereği doğru. |
| Validasyon | Login, events, location create/update Zod ile doğrulanıyor. |
| revalidateTag | Next.js 16’da iki argümanlı kullanım (`"max"`) dokümantasyonla uyumlu. |

---

## 4. Özet Öncelik Listesi

1. **Kısa vadede:** Events API’ye rate limit; uploads path’i için `path.resolve` + `startsWith` kontrolü; proxy-image’da sadece `image/*` Content-Type kabulü.
2. **Orta vadede:** 401’de admin’i login’e yönlendirme + toast; rate limit için Redis (çoklu instance için); client’ta 429 mesajı.
3. **Uzun vadede:** React Query/SWR; harita clustering; E2E testler; token’ı httpOnly cookie’ye taşıma (opsiyonel).

---

Bu doküman mevcut kod incelemesi ve `ANALIZ-RAPORU.md` / `GELISTIRME-ONERILERI-FONKSIYONELLIK.md` ile uyumlu olacak şekilde hazırlanmıştır. Belirli bir madde için kod değişikliği istenirse söylemeniz yeterli.

---

## 5. Uygulanan İyileştirmeler (6 Mart 2026)

| Madde | Uygulama |
|-------|----------|
| **1.3 Events API rate limit** | `src/lib/rate-limit.ts`: `checkEventsRateLimit` (120/dk IP). `src/app/api/events/route.ts`: 429 + RATE_LIMIT_EXCEEDED. |
| **1.1 Uploads path** | Zaten uygulanmıştı: `path.resolve` + `startsWith`. |
| **1.4 Proxy-image Content-Type** | Sadece `image/*` MIME kabulü; aksi halde 502. |
| **2.2 Admin 401 / 429** | `src/lib/admin-fetch.ts`: Tüm admin API istekleri sarmalandı; 401 → oturum temizleme, toast, `/admin/login` yönlendirme; 429 → toast. Tüm admin sayfaları `adminFetch` kullanıyor. |
| **2.2 Client 429 mesajı** | `common.sessionExpired`, `common.rateLimitRetry` i18n; adminFetch 429’da API mesajını toast ile gösteriyor. |
| **2.2 Hata + Yeniden dene** | Ana sayfa, explore, lokasyon detay, admin list zaten ErrorRetry kullanıyordu; admin lokasyon listesine `error` state + ErrorRetry eklendi. |
| **2.5 Boş / 404** | Admin lokasyon listesi boş durumu ve lokasyon detay 404 görünümü zaten vardı. |
| **2.5 i18n / a11y** | ErrorRetry: `useLocale`, `t("common.retry")`, `t("common.close")`. LocationCard: `t("explore.viewDetails")`, `t("detail.getDirections")`, `aria-label`. OfflineBanner: `t("offline.message")`. Directions modal: `t("map.routeError")`, `t("map.clearRoute")`, `t("common.close")`. `map.clearRoute` tr/en eklendi. |
| **2.5 Görsel alt** | Lokasyon detay hero’da `alt={name}` zaten vardı. |
| **Harita loading / rota / offline** | Ana sayfada loading overlay (Skeleton) zaten vardı; rota modal loading/error i18n kullanıyor; OfflineBanner zaten vardı, i18n eklendi. |
| **Testler** | İstenen gibi en sona bırakıldı. Sadece `checkEventsRateLimit` için unit test eklendi. Kalan testler aşağıda. |
| **JWT httpOnly cookie** | Opsiyonel olarak bırakıldı; uygulanmadı. |

---

## 6. Kalan Testler (yapılacaklar)

### Şu an olan (Vitest unit + API entegrasyon)
- **`src/lib/validations.test.ts`**: `loginSchema`, `eventSchema`, `locationCreateSchema`, `locationUpdateSchema`
- **`src/lib/rate-limit.test.ts`**: `checkLoginRateLimit`, `checkAdminApiRateLimit`, `checkEventsRateLimit`
- **`src/app/api/events/route.test.ts`**: POST /api/events → 201, 422, 429
- **`src/app/api/auth/login/route.test.ts`**: POST /api/auth/login → 200, 401, 422, 429
- **`src/app/api/locations/route.test.ts`**: GET /api/locations → 200, query params (page, limit, search, categoryId, latitude, longitude, radiusKm, excludeId)
- **`src/lib/auth.test.ts`**: signToken, verifyToken, comparePassword, hashPassword (bcrypt mock); production'da JWT_SECRET yoksa hata
- **`src/lib/api-response.test.ts`**: successResponse, errorResponse (status ve body)
- **`src/lib/utils.test.ts`**: haversineDistance, formatDistance (sınır değerler)
- **`src/services/location.service.test.ts`**: list (nearby + excludeId, non-nearby), getById (mock Prisma)
- **`src/lib/transit-guide.test.ts`**: generateTransitGuide (yakın mesafe, aynı ilçe, ada, ilçeler arası)  
  → `npm run test` ile hepsi çalışır (64 test).

### Yapılması önerilen

| Öncelik | Tür | Ne test edilecek |
|--------|-----|-------------------|
| **Orta** | **Unit** | `src/lib/auth.ts`: `signToken` / `comparePassword` (mock bcrypt); `getJwtSecret` production’da env yoksa hata. |
| **Orta** | **Unit** | `src/lib/api-response.ts`: `successResponse` / `errorResponse` status ve body. |
| **Orta** | **Unit** | `src/lib/utils.ts`: `haversineDistance`, `formatDistance` (sınır değerler). |
| **Orta** | **API entegrasyon** | `POST /api/events`: geçerli body → 201; eksik alan → 422; aynı IP’den 120+ istek → 429. |
| **Orta** | **API entegrasyon** | `POST /api/auth/login`: geçerli kimlik → 200 + token; geçersiz → 401; 5+ hatalı deneme → 429. |
| **Orta** | **API entegrasyon** | `GET /api/locations`: `latitude`, `longitude`, `radiusKm` ile yakındaki yerler; `excludeId`; sayfalama. |
| **Düşük** | **Unit** | `src/services/location.service.ts`: `list` (radius/nearby), `getById` (mock Prisma). |
| **Düşük** | **Unit** | `src/lib/transit-guide.ts`: `generateTransitGuide` (bilinen koordinatlar için adım sayısı / tür). |
| **Düşük** | **E2E (Playwright)** | Kurulum: `playwright.config.ts`, `tests/e2e/`; senaryolar: admin login → dashboard; haritada marker tıklama → kart açılması; lokasyon detay sayfası; admin lokasyon listesi + yeni lokasyon (opsiyonel). |

### E2E için adımlar
1. `npm install -D @playwright/test` (veya zaten vitest ile geliyorsa sadece Playwright’ı e2e için ekle).
2. `playwright.config.ts` oluştur: `baseURL: 'http://localhost:3011'`, `webServer: { command: 'npm run start', url: '...' }`.
3. `tests/e2e/admin-login.spec.ts`, `tests/e2e/map.spec.ts`, `tests/e2e/location-detail.spec.ts` benzeri dosyalar.
4. `package.json`: `"test:e2e": "playwright test"`.
