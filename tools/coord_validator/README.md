# Balıkesir Lokasyon Koordinat Doğrulayıcı

Uygulama dışında, veritabanındaki tüm turistik yerlerin koordinatlarını doğrulayan bağımsız Python aracı.

## Ne yapar?

1. **Veritabanından lokasyonları okur** – PostgreSQL `Location` ve `Category` tabloları
2. **WGS84 kontrolü** – Enlem/boylam geçerli aralıkta mı (-90/90, -180/180)
3. **Balıkesir bbox kontrolü** – Koordinatlar il sınırları içinde mi (yaklaşık 39–41°N, 26.2–28.6°E)
4. **Ondalık hassasiyet uyarısı** – En az 4 ondalık basamak önerilir
5. **İsteğe bağlı reverse geocode** – Nominatim (OSM) ile adres teyidi (yavaş, rate limit var)

## Kurulum

```bash
cd tools/coord_validator
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
```

## Ortam değişkeni

Veritabanı bağlantısı için `DATABASE_URL` gerekli. İki seçenek:

- Proje kökündeki `.env` dosyasında tanımlı olabilir (zaten varsa ekstra bir şey yapmayın)
- Veya `tools/coord_validator/.env` oluşturup içine yazın:

```env
DATABASE_URL=postgresql://postgres:SIFRE@localhost:5432/smartcity
```

## Kullanım

```bash
# Proje kökünden (smartcity-app)
python tools/coord_validator/validate.py

# Sadece hatalı kayıtları listele
python tools/coord_validator/validate.py --quiet

# JSON rapor üret
python tools/coord_validator/validate.py --json tools/coord_validator/out/rapor.json

# CSV rapor üret
python tools/coord_validator/validate.py --csv tools/coord_validator/out/rapor.csv

# HTML rapor (tıklanınca Google Maps açılır)
python tools/coord_validator/validate.py --html tools/coord_validator/out/koordinat-dogrulama-raporu.html

# Reverse geocode ile teyit (her nokta için istek atar, yavaş)
python tools/coord_validator/validate.py --geocode --json out/rapor_geocode.json
```

## Çıktı

- **Özet:** Geçerli / geçersiz / uyarılı kayıt sayıları
- **Geçersiz lokasyonlar:** Hata mesajlarıyla listelenir
- **Uyarılı lokasyonlar:** Koordinat geçerli ama hassasiyet veya geocode uyarısı
- `--json` / `--csv` ile dosyaya rapor yazılır

## Balıkesir bbox

`config.py` içinde il sınırlarına yakın bir bbox tanımlı. İl sınırları değişirse bu değerler güncellenebilir.
