# Fonksiyonellik ve İşlevsellik — Geliştirme Önerileri

Bu dokümanda **Dijital Kaşif** uygulamasının işlevselliğini ve kullanılabilirliğini artıracak özellik ve iyileştirme önerileri listelenmiştir.

---

## 1. Kullanıcı Deneyimi (UX) ve Geri Bildirim

### 1.1 Hata ve yeniden deneme
- **Durum:** API hatalarında (fetch başarısız, `res.success === false`) sayfalar çoğunlukla sadece loading’i kapatıyor; kullanıcıya hata mesajı veya yeniden deneme seçeneği gösterilmiyor.
- **Öneri:**
  - Tüm veri çeken sayfalarda (ana sayfa, explore, lokasyon detay, admin listeleri) **hata state’i** tanımlayın: `error: string | null` ve API/network hata durumunda set edin.
  - Hata durumunda kullanıcıya **kısa mesaj + “Yeniden dene” butonu** gösterin.
  - İsteğe bağlı: `errorCode` (VALIDATION_ERROR, UNAUTHORIZED vb.) ile mesajı locale’e göre çevirin veya daha net metin seçin.

### 1.2 Loading ve boş durumlar
- **Durum:** Loading skeleton’lar var; bazı sayfalarda “veri yok” veya “liste boş” durumu eksik veya tutarsız.
- **Öneri:**
  - Ana sayfada lokasyon/kategori yüklenirken **harita alanında** da net bir loading göstergesi (ör. overlay veya skeleton) kullanın.
  - Admin lokasyon listesinde **hiç lokasyon yokken** “Henüz lokasyon eklenmemiş. Yeni ekle” gibi CTA’lı boş durum ekleyin.
  - Lokasyon detayda **404 (bulunamadı)** için ayrı bir görünüm: “Bu lokasyon bulunamadı veya kaldırılmış” + ana sayfaya/explore’a dönüş linki.

### 1.3 Form ve işlem geri bildirimi
- **Durum:** Admin lokasyon ekleme/düzenleme ve login’de başarı/hata mesajları var; tutarlı bir pattern yok.
- **Öneri:**
  - Tüm form gönderimlerinde **loading state** (buton disabled + spinner) zaten kısmen var; **toast (sonner)** ile “Kaydedildi” / “Giriş başarılı” / “Bir hata oluştu” mesajlarını standartlaştırın.
  - Validasyon hatalarını **alan bazında** (Zod/flatten) gösterin; tek bir “Zorunlu alanlar eksik” yerine “Lokasyon adı gerekli”, “Enlem -90 ile 90 arasında olmalı” gibi.

---

## 2. Arama, Filtreleme ve Liste İşlevselliği

### 2.1 Harita sayfasında arama
- **Durum:** Ana sayfada `SearchBar` ve kategori filtreleri var; arama sonucu **liste veya harita üzerinde** net vurgulanmıyor.
- **Öneri:**
  - Arama metnine göre lokasyonları **filtreleyip** sadece eşleşenleri haritada gösterin veya öne çıkarın.
  - Arama sonucu tek ise **otomatik zoom/pan** ile o lokasyona odaklanın; çok sonuçta “X sonuç” bilgisi + “Haritada göster” davranışını netleştirin.

### 2.2 Keşfet (explore) sayfası
- **Durum:** Client-side filtreleme (search + kategori) ve boş sonuç mesajı mevcut; veri tek seferde `locations/all` ile çekiliyor.
- **Öneri:**
  - Lokasyon sayısı büyüdükçe **sunucu taraflı arama/filtreleme** (ör. `/api/locations?search=...&categoryId=...&page=1`) ile sayfalama ekleyin; ilk yüklemede sadece ilk sayfayı alın.
  - “Sıralama” seçeneği: en çok ziyaret, isim (A–Z), eklenme tarihi vb.
  - Arama kutusuna **debounce** (300–500 ms) ekleyerek gereksiz filtre tetiklemelerini azaltın.

### 2.3 Lokasyon detayda ilişkili içerik
- **Durum:** Tek lokasyon detayı var; “aynı kategorideki diğerleri” veya “yakındakiler” yok.
- **Öneri:**
  - Aynı **kategorideki** diğer lokasyonlara kısa link listesi veya kartlar ekleyin (“Benzer yerler”).
  - İsteğe bağlı: Konuma göre **yakındaki lokasyonlar** (API’de mesafe/limit ile) ve “Haritada göster” linki.

---

## 3. Harita ve Rota İşlevselliği

### 3.1 Konum (geolocation) deneyimi
- **Durum:** `getCurrentPosition` kullanılıyor; hata (izin reddi, timeout) sessizce yok sayılıyor.
- **Öneri:**
  - Konum izni **reddedilirse** veya hata olursa kullanıcıya kısa bilgi: “Konum açılmadı; haritayı elle hareket ettirebilirsiniz” ve isteğe bağlı “Tekrar dene” butonu.
  - “Konumuma git” butonu: tıklanınca haritayı kullanıcı konumuna odaklar ve gerekirse marker koyar.

### 3.2 Rota (directions) modali
- **Durum:** OSRM + transit-guide ile yürüme/araç/transit modları ve süre/mesafe hesaplanıyor.
- **Öneri:**
  - Rota hesaplanırken **açık loading** (ör. “Rota hesaplanıyor…” + spinner); OSRM hata verirse “Rota şu an hesaplanamıyor” mesajı + yeniden deneme.
  - Rota çizildikten sonra **süre/mesafe** bilgisini hem modal içinde hem (isteğe bağlı) harita üzerinde kalıcı gösterin.
  - Deep link: “Bu rota ile yön al” ile Google Maps / Apple Maps / Yandex açılması (URL scheme).

### 3.3 Harita performansı
- **Durum:** Tüm lokasyonlar tek seferde haritada; çok marker’da performans düşebilir.
- **Öneri:**
  - **Viewport/cluster:** Görünür alandaki veya yakındaki lokasyonları gösterin; zoom seviyesine göre clustering (ör. Leaflet.markercluster) kullanın.
  - Lokasyon verisini zaten cache’lediğiniz için, harita için de aynı cache’i kullanın; gereksiz tekrarlı istekleri engelleyin.

---

## 4. Veri, Çevrimdışı ve API Kullanımı

### 4.1 Tutarlı veri katmanı
- **Durum:** Sayfalar doğrudan `fetch` ile API’yi çağırıyor; tekrarlayan loading/error mantığı var.
- **Öneri:**
  - **React Query (TanStack Query)** veya SWR ile `/api/locations`, `/api/categories`, `/api/locations/[id]` için merkezi **data + loading + error + refetch** yönetimi.
  - Cache invalidation: admin tarafında lokasyon ekleme/güncelleme/silme sonrası ilgili query’leri invalidate edin; böylece liste/detay/harita verisi güncel kalsın.

### 4.2 Çevrimdışı (offline) ve PWA
- **Durum:** PWA manifest ve service worker var; offline’da sayfa/veri davranışı net değil.
- **Öneri:**
  - Service worker ile **önbelleğe alınan sayfalar** (ana sayfa, explore, statik sayfalar) offline’da açılsın; API yanıtları için Cache API ile “stale-while-revalidate” stratejisi (ör. lokasyon listesi) düşünün.
  - Ağ yokken **“Çevrimdışısınız; bazı veriler güncel olmayabilir”** banner’ı ve mümkünse son önbelleğe alınan lokasyon listesini gösterin.

### 4.3 API hata kullanımı (client)
- **Durum:** API’de `errorCode` dönülüyor; client tarafında bu kodlara göre özelleştirilmiş mesaj veya davranış yok.
- **Öneri:**
  - `res.errorCode === 'RATE_LIMIT_EXCEEDED'` ise “Çok fazla istek; X saniye sonra tekrar deneyin” gibi mesaj.
  - `401` / `UNAUTHORIZED` (admin): token süresi dolmuşsa otomatik login sayfasına yönlendirme ve “Oturumunuz sona erdi” toast’ı.

---

## 5. Erişilebilirlik ve Kullanılabilirlik

### 5.1 Klavye ve odak yönetimi
- **Öneri:**
  - Modal açıldığında **odak trap** (focus trap) ve kapatma için Escape.
  - Harita üzerinde marker’lara **klavye ile erişim** (tab order, Enter/Space ile seçim); “Atla: harita” gibi skip link’i.

### 5.2 Metin ve çeviri
- **Durum:** next-intl ve locale context var; bazı metinler hâlâ sabit (ör. “Detayları Gör” / “View Details” koşulu).
- **Öneri:**
  - Tüm kullanıcı arayüzü metinlerini **çeviri anahtarlarına** taşıyın (tr.json / en.json); sabit Türkçe/İngilizce koşullarını kaldırın.
  - Lokasyon alanları (description, shortDesc, fee, address vb.) zaten locale’e göre sunuluyor; listeleme ve detayda bu alanların tutarlı kullanıldığından emin olun.

### 5.3 Görsel ve içerik
- **Öneri:**
  - Lokasyon kartları ve detayda **görseller** için `alt` metni (kısa açıklama veya lokasyon adı).
  - “Nasıl gidilir”, “Paylaş”, “Yol tarifi” gibi butonlarda **aria-label** ile net etiket.

---

## 6. Analitik ve İçerik Kalitesi

### 6.1 Analitik kapsamı
- **Durum:** map_view, marker_click, detail_view, route_click, search gibi event’ler mevcut.
- **Öneri:**
  - **Arama** event’i: arama kutusu submit/debounce sonrası (aranan terim, sonuç sayısı) metadata ile gönderin.
  - **Rota** kullanımı: modal açıldığında veya rota türü (yürüme/araç/transit) seçildiğinde event; dashboard’da “en çok kullanılan rota tipi” raporu.
  - **Hata** event’i: client’ta yakalanan API/network hatalarını (errorCode, sayfa) isteğe bağlı loglayın; böylece sorunlu akışlar görülebilir.

### 6.2 İçerik ve SEO
- **Öneri:**
  - Lokasyon detay sayfaları için **dinamik meta** (title, description, OG image) — lokasyon adı ve kısa açıklama ile.
  - “Keşfet” ve kategori sayfaları için **sayfa bazlı meta** ve gerekirse structured data (JSON-LD, LocalBusiness/Place).

---

## 7. Admin Panel İşlevselliği

### 7.1 Lokasyon yönetimi
- **Öneri:**
  - Listede **toplu işlem:** çoklu seçim ile “Aktif/Pasif yap”, “Kategorileri değiştir” (tek kategoriye taşıma).
  - **Önizleme:** Listeden veya formdan “Siteyi görüntüle” ile ilgili lokasyonun public detay sayfasını yeni sekmede açın.
  - **Sıralama:** Liste sütunlarına tıklanabilir sıralama (isim, kategori, tarih).

### 7.2 Dashboard
- **Durum:** Recharts ile istatistikler ve son aktiviteler var.
- **Öneri:**
  - **Tarih aralığı** filtresi: son 7 gün, 30 gün, 3 ay; grafik ve sayılar buna göre güncellensin.
  - **Export:** Günlük/aylık özeti CSV veya Excel olarak indirme.
  - **Bildirim:** Kritik hata veya rate limit aşımlarında (isteğe bağlı) basit uyarı alanı.

### 7.3 Kategori yönetimi
- **Durum:** Kategoriler API’den okunuyor; admin’de kategori CRUD yok.
- **Öneri:**
  - **Kategori yönetimi** sayfası: listeleme, ekleme, düzenleme (isim, slug, ikon, renk, sıra), pasifleştirme; lokasyon sayısı bilgisi.

---

## 8. Performans ve Ölçeklenebilirlik

### 8.1 İlk yükleme
- **Öneri:**
  - Ana sayfada **kritik veriyi** (ör. öne çıkan lokasyonlar veya ilk 20 lokasyon) önce yükleyin; tam liste veya harita verisini lazy/arka planda getirin.
  - Görseller: **next/image** ile boyut ve format (WebP/AVIF) optimizasyonu; lazy loading.

### 8.2 Liste ve sayfalama
- **Öneri:**
  - Explore’da **sonsuz scroll** veya “Daha fazla” ile sayfalama; büyük listelerde DOM’u sınırlı tutun.
  - Admin lokasyon listesinde sayfa başına kayıt sayısı seçeneği (20 / 50 / 100).

---

## 9. Özet Öncelik Matrisi

| Öncelik | Alan            | Öneri (kısa) |
|--------|------------------|--------------|
| Yüksek | UX               | Tüm sayfalarda hata state + “Yeniden dene” |
| Yüksek | UX               | Form hatalarını alan bazında + toast ile gösterme |
| Yüksek | Veri             | React Query/SWR ile merkezi data/loading/error |
| Orta   | Arama/Filtre     | Haritada arama sonucuna göre filtreleme ve odaklanma |
| Orta   | Harita           | Konum hata mesajı + “Konumuma git” butonu |
| Orta   | Rota             | Rota loading/hata mesajı + harici harita deep link |
| Orta   | PWA              | Offline banner + basit stale-while-revalidate |
| Orta   | Admin            | Lokasyon listesi boş durumu + önizleme linki |
| Düşük  | Keşfet           | Sunucu taraflı arama + sayfalama + sıralama |
| Düşük  | Lokasyon detay   | “Benzer yerler” / “Yakındakiler” |
| Düşük  | Admin            | Kategori CRUD, dashboard tarih filtresi, export |
| Düşük  | Erişilebilirlik  | Odak yönetimi, aria-label, tüm metinleri çeviriye taşıma |

Bu öneriler, mevcut analiz raporu ve kod incelemesine dayanmaktadır; uygulama sırası proje önceliklerine göre ayarlanabilir.
