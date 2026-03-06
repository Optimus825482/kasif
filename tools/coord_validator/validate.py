"""
Veritabanındaki tüm lokasyonların koordinatlarını doğrular.
- WGS84 geçerliliği
- Balıkesir bbox içinde mi
- Opsiyonel: Nominatim ile reverse geocode teyidi
"""

from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

# Proje kökündeki .env veya tools/coord_validator/.env
ROOT = Path(__file__).resolve().parent.parent.parent
for env_path in [ROOT / "tools" / "coord_validator" / ".env", ROOT / ".env"]:
    if env_path.exists():
        load_dotenv(env_path)
        break

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("HATA: DATABASE_URL tanımlı değil. .env veya tools/coord_validator/.env dosyasını ayarlayın.")
    sys.exit(1)

from config import BALIKESIR_BBOX, WGS84_LAT_RANGE, WGS84_LON_RANGE


@dataclass
class LocationRow:
    id: str
    name: str
    name_en: str
    latitude: float
    longitude: float
    address: str | None
    category_name: str
    deleted_at: str | None

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "nameEn": self.name_en,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "address": self.address,
            "categoryName": self.category_name,
            "deletedAt": self.deleted_at,
        }


@dataclass
class ValidationResult:
    location: LocationRow
    valid: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    geocode_place: str | None = None

    def to_dict(self):
        return {
            **self.location.to_dict(),
            "valid": self.valid,
            "errors": self.errors,
            "warnings": self.warnings,
            "geocodePlace": self.geocode_place,
        }


def fetch_locations() -> list[LocationRow]:
    import psycopg
    from psycopg.rows import dict_row

    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    l.id,
                    l.name,
                    l."nameEn" AS name_en,
                    l.latitude,
                    l.longitude,
                    l.address,
                    l."deletedAt" AS deleted_at,
                    c.name AS category_name
                FROM "Location" l
                JOIN "Category" c ON c.id = l."categoryId"
                ORDER BY l.name
            """)
            rows = cur.fetchall()

    return [
        LocationRow(
            id=r["id"],
            name=r["name"],
            name_en=r["name_en"] or "",
            latitude=float(r["latitude"]),
            longitude=float(r["longitude"]),
            address=r["address"],
            category_name=r["category_name"],
            deleted_at=str(r["deleted_at"]) if r["deleted_at"] else None,
        )
        for r in rows
    ]


def validate_wgs84(lat: float, lon: float) -> list[str]:
    err = []
    if not (WGS84_LAT_RANGE[0] <= lat <= WGS84_LAT_RANGE[1]):
        err.append(f"Enlem WGS84 dışında: {lat}")
    if not (WGS84_LON_RANGE[0] <= lon <= WGS84_LON_RANGE[1]):
        err.append(f"Boylam WGS84 dışında: {lon}")
    return err


def validate_balikesir_bbox(lat: float, lon: float) -> list[str]:
    err = []
    if lat < BALIKESIR_BBOX["lat_min"] or lat > BALIKESIR_BBOX["lat_max"]:
        err.append(f"Enlem Balıkesir bbox dışında: {lat} (beklenen {BALIKESIR_BBOX['lat_min']}-{BALIKESIR_BBOX['lat_max']})")
    if lon < BALIKESIR_BBOX["lon_min"] or lon > BALIKESIR_BBOX["lon_max"]:
        err.append(f"Boylam Balıkesir bbox dışında: {lon} (beklenen {BALIKESIR_BBOX['lon_min']}-{BALIKESIR_BBOX['lon_max']})")
    return err


def reverse_geocode(lat: float, lon: float) -> str | None:
    try:
        from geopy.geocoders import Nominatim
        from geopy.exc import GeocoderTimedOut, GeocoderServiceError

        geolocator = Nominatim(user_agent=os.getenv("USER_AGENT", "BalikesirCoordValidator/1.0"))
        location = geolocator.reverse(f"{lat}, {lon}", timeout=10, language="tr")
        if location and location.raw:
            return location.address
    except (GeocoderTimedOut, GeocoderServiceError, Exception):
        pass
    return None


def run_validation(
    locations: list[LocationRow],
    *,
    use_geocode: bool = False,
) -> list[ValidationResult]:
    results = []
    for loc in locations:
        errors = []
        warnings = []

        errors.extend(validate_wgs84(loc.latitude, loc.longitude))
        errors.extend(validate_balikesir_bbox(loc.latitude, loc.longitude))

        geocode_place = None
        if use_geocode and not errors:
            geocode_place = reverse_geocode(loc.latitude, loc.longitude)
            if geocode_place and "Balıkesir" not in geocode_place and "Balikesir" not in geocode_place:
                warnings.append(f"Reverse geocode sonucu Balıkesir içermiyor: {geocode_place[:80]}...")

        valid = len(errors) == 0
        results.append(
            ValidationResult(
                location=loc,
                valid=valid,
                errors=errors,
                warnings=warnings,
                geocode_place=geocode_place,
            )
        )
    return results


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Balıkesir lokasyon koordinat doğrulayıcı")
    parser.add_argument("--geocode", action="store_true", help="Nominatim ile reverse geocode yap (yavaş)")
    parser.add_argument("--json", type=str, metavar="FILE", help="Sonuçları JSON dosyasına yaz")
    parser.add_argument("--csv", type=str, metavar="FILE", help="Sonuçları CSV dosyasına yaz")
    parser.add_argument("--md", type=str, metavar="FILE", help="Tam doğrulama raporunu Markdown tablo olarak yaz")
    parser.add_argument("--html", type=str, metavar="FILE", help="HTML rapor üret; tıklanınca Google Maps açılır")
    parser.add_argument("--quiet", "-q", action="store_true", help="Sadece hatalı kayıtları listele")
    args = parser.parse_args()

    print("Veritabanından lokasyonlar çekiliyor...")
    locations = fetch_locations()
    print(f"Toplam {len(locations)} lokasyon bulundu.\n")

    results = run_validation(locations, use_geocode=args.geocode)

    valid_count = sum(1 for r in results if r.valid)
    invalid_count = len(results) - valid_count

    if args.quiet:
        invalid = [r for r in results if not r.valid]
        for r in invalid:
            print(f"[HATA] {r.location.name} (id={r.location.id})")
            for e in r.errors:
                print(f"  - {e}")
    else:
        print("=" * 60)
        print("ÖZET")
        print("=" * 60)
        print(f"  Geçerli (WGS84 + Balıkesir bbox): {valid_count}")
        print(f"  Geçersiz:                        {invalid_count}")
        print()

        if invalid_count > 0:
            print("GEÇERSİZ KOORDİNATLI LOKASYONLAR")
            print("-" * 60)
            for r in results:
                if not r.valid:
                    print(f"  {r.location.name}")
                    print(f"    id: {r.location.id} | lat={r.location.latitude}, lon={r.location.longitude}")
                    for e in r.errors:
                        print(f"    - {e}")
                    print()

    if args.json:
        out_path = Path(args.json)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "summary": {
                "total": len(results),
                "valid": valid_count,
                "invalid": invalid_count,
            },
            "results": [r.to_dict() for r in results],
        }
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"JSON rapor: {out_path}")

    if args.csv:
        import csv
        out_path = Path(args.csv)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8-sig", newline="") as f:
            w = csv.writer(f)
            w.writerow(["id", "name", "nameEn", "latitude", "longitude", "address", "category", "valid", "errors", "warnings", "geocodePlace"])
            for r in results:
                w.writerow([
                    r.location.id,
                    r.location.name,
                    r.location.name_en,
                    r.location.latitude,
                    r.location.longitude,
                    r.location.address or "",
                    r.location.category_name,
                    r.valid,
                    "; ".join(r.errors),
                    "; ".join(r.warnings),
                    (r.geocode_place or "")[:200],
                ])
        print(f"CSV rapor: {out_path}")

    if args.md:
        from datetime import datetime
        out_path = Path(args.md)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        lines = [
            "# Balıkesir Lokasyon Koordinat Doğrulama Raporu",
            "",
            f"**Tarih:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "",
            "## Özet",
            "",
            "| Metrik | Değer |",
            "|--------|-------|",
            f"| Toplam lokasyon | {len(results)} |",
            f"| Geçerli (WGS84 + Balıkesir bbox) | {valid_count} |",
            f"| Geçersiz | {invalid_count} |",
            "",
            "**Kriterler:** WGS84 enlem/boylam aralığı, Balıkesir il bbox (39–41°N, 26.2–28.75°E).",
            "",
            "> ⚠️ **Önemli:** \"Geçerli\" yalnızca koordinatın bu aralıklarda olduğu anlamına gelir; "
            "pinin ilgili yerin tam konumunda olduğunu **doğrulamaz**. Gerçek konumu teyit etmek için "
            "\"Kontrol\" sütunundaki Google Maps linkine tıklayıp haritada kontrol edin.",
            "",
            "---",
            "",
            "## Tüm Lokasyonlar – Doğrulama ve Karşılaştırma",
            "",
            "| # | Ad | Ad (EN) | Kategori | Enlem | Boylam | Durum | Hata / Not | Kontrol (Google Maps) |",
            "|---|----|---------|----------|-------|--------|-------|-------------|------------------------|",
        ]
        for i, r in enumerate(results, 1):
            name_esc = (r.location.name or "").replace("|", "\\|")
            name_en_esc = (r.location.name_en or "").replace("|", "\\|")
            cat_esc = (r.location.category_name or "").replace("|", "\\|")
            lat = r.location.latitude
            lon = r.location.longitude
            status = "Geçerli" if r.valid else "Geçersiz"
            err_note = "; ".join(r.errors).replace("|", "\\|") if r.errors else ("—" if r.valid else "")
            maps_url = f"https://www.google.com/maps?q={lat},{lon}"
            lines.append(f"| {i} | {name_esc} | {name_en_esc} | {cat_esc} | {lat} | {lon} | {status} | {err_note} | [Haritada aç]({maps_url}) |")
        lines.extend(["", "---", "", "*Rapor: Koordinat doğrulayıcı (tools/coord_validator). Konum doğruluğu için \"Kontrol\" linklerini kullanın.*", ""])
        with open(out_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        print(f"Markdown rapor: {out_path}")

    if args.html:
        from datetime import datetime
        out_path = Path(args.html)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        html_escape = lambda s: (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
        rows_html = []
        for i, r in enumerate(results, 1):
            lat, lon = r.location.latitude, r.location.longitude
            maps_url = f"https://www.google.com/maps?q={lat},{lon}"
            status_class = "valid" if r.valid else "invalid"
            status_text = "Geçerli" if r.valid else "Geçersiz"
            err_note = "; ".join(r.errors) if r.errors else "—"
            rows_html.append(
                f"""<tr>
  <td>{i}</td>
  <td>{html_escape(r.location.name)}</td>
  <td>{html_escape(r.location.name_en)}</td>
  <td>{html_escape(r.location.category_name)}</td>
  <td>{lat}</td>
  <td>{lon}</td>
  <td class="{status_class}">{status_text}</td>
  <td>{html_escape(err_note)}</td>
  <td><a href="{maps_url}" target="_blank" rel="noopener" class="maps-link">Haritada aç</a></td>
</tr>"""
            )
        html_content = f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Balıkesir Lokasyon Koordinat Doğrulama Raporu</title>
  <style>
    body {{ font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 1.5rem; background: #f5f5f5; color: #1a1a1a; }}
    .container {{ max-width: 1200px; margin: 0 auto; background: #fff; padding: 1.5rem 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }}
    h1 {{ margin-top: 0; font-size: 1.5rem; }}
    .meta {{ color: #666; font-size: 0.9rem; margin-bottom: 1rem; }}
    .summary {{ display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1rem; }}
    .summary span {{ background: #e8f4fc; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.9rem; }}
    .notice {{ background: #fff8e6; border-left: 4px solid #e6a800; padding: 0.75rem 1rem; margin: 1rem 0; font-size: 0.9rem; }}
    table {{ width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.85rem; }}
    th, td {{ padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #eee; }}
    th {{ background: #f8f9fa; font-weight: 600; position: sticky; top: 0; }}
    tr:hover {{ background: #fafafa; }}
    td.valid {{ color: #0d7d0d; }}
    td.invalid {{ color: #c00; }}
    .maps-link {{ color: #1a73e8; text-decoration: none; font-weight: 500; }}
    .maps-link:hover {{ text-decoration: underline; }}
    .footer {{ margin-top: 1.5rem; font-size: 0.8rem; color: #888; }}
  </style>
</head>
<body>
  <div class="container">
    <h1>Balıkesir Lokasyon Koordinat Doğrulama Raporu</h1>
    <p class="meta">Tarih: {datetime.now().strftime("%Y-%m-%d %H:%M")}</p>
    <div class="summary">
      <span>Toplam: {len(results)}</span>
      <span>Geçerli: {valid_count}</span>
      <span>Geçersiz: {invalid_count}</span>
    </div>
    <p class="notice">
      <strong>Önemli:</strong> "Geçerli" yalnızca koordinatın WGS84 ve Balıkesir bbox içinde olduğu anlamına gelir.
      Konumun doğruluğunu teyit etmek için <strong>"Haritada aç"</strong> linkine tıklayıp Google Maps'te kontrol edin.
    </p>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Ad</th>
          <th>Ad (EN)</th>
          <th>Kategori</th>
          <th>Enlem</th>
          <th>Boylam</th>
          <th>Durum</th>
          <th>Hata / Not</th>
          <th>Kontrol</th>
        </tr>
      </thead>
      <tbody>
{"".join(rows_html)}
      </tbody>
    </table>
    <p class="footer">Rapor: tools/coord_validator — Koordinat doğrulayıcı</p>
  </div>
</body>
</html>"""
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"HTML rapor: {out_path}")

    return 0 if invalid_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
