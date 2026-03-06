import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const idsToDelete = [
  "cmmeb7hpb000rwggs61eb0bzb", // Bigadiç Müze ve Kültür Evi
  "cmmeb7hpj000vwggshs0z7hk7", // Burhaniye Kuva-yı Milliye Müzesi
  "cmmeb7hpf000twggs8efwogv1", // Devrim Erbil Çağdaş Sanatlar Müzesi
  "cmmeb7hoz000mwggs49ohtg5s", // Edremit Zeytinyağı Müzesi
  "cmmeb7hpl000wwggs5z5iiuny", // Havran Kent Müzesi
  "cmmeb7hpg000uwggsvzbad5pm", // Kazdağı Tabiat Müzesi
  "cmmeb7hp8000qwggsffd1qv86", // Rahmi M. Koç Müzesi
  "cmmeb7hqr001bwggs5j5ikn8h", // Ayvalık Tost Sokağı
  "cmmeb7hqx001ewggsb4864vfp", // Bandırma Balık Hali
  "cmmeb7hqt001cwggsu1sq29ka", // Edremit Zeytinyağlı Mutfak
  "cmmeb7hqw001dwggs7gutaavt", // Gönen Kaymağı
  "cmmeb7hrc001lwggs30ija45c", // Panayia Kilisesi
  "cmmeb7hr7001iwggsdmhnsesq", // Taksiyarhis Kilisesi
  "cmmeb7hr8001jwggsabhnb910", // Yıldırım Bayezid Camii (Edremit)
  "cmmeb7hoe000fwggsi3xc4a57", // Değirmenboğazı Köprüsü
  "cmmeb7hny000bwggs1m4cu80r", // Havran Terzizade Konağı
  "cmmeb7hoa000ewggsa392ayiw", // Karesi Bey Camii ve Külliyesi
  "cmmeb7ho4000cwggsqh8xcve3", // Sındırgı Kışla Müze Han
  "cmmeb7htc0030wggsaipoy7vt", // Soğuksu Köyü Kalıntıları
  "cmmeb7hql0019wggs0r7uy9lk", // Ayvalık Tarihi Sokaklar
  "cmmeb7htk0035wggs3zqlvj1g", // Apostol (Çifte Oluklar)
  "cmmeb7htd0031wggstzpg2lwk", // Çataldağ - Aygır Çeşmesi
  "cmmeb7hte0032wggskz81j35w", // Çaylak Şelalesi
  "cmmeb7ht7002wwggstm42p35r", // Kışla Mesire Yeri
  "cmmeb7ht9002xwggs2j6har13", // Su Uçtu Şelalesi
  "cmmeb7htl0036wggsht0hrdij", // Avşa Çınar Koyu
  "cmmeb7hr5001hwggsixqo33yg", // Kepsut Jeotermal Tesisleri
];

async function main() {
  const placeholders = idsToDelete.map((_, i) => `$${i + 1}`).join(", ");
  const sql = `UPDATE "Location" SET "deletedAt" = NOW() WHERE id IN (${placeholders}) AND "deletedAt" IS NULL`;
  const result = await pool.query(sql, idsToDelete);
  console.log(`Soft-deleted ${result.rowCount} locations`);

  // Verify
  const check = await pool.query(
    `SELECT COUNT(*) as deleted FROM "Location" WHERE "deletedAt" IS NOT NULL`,
  );
  console.log(`Total soft-deleted locations: ${check.rows[0].deleted}`);

  const active = await pool.query(
    `SELECT COUNT(*) as active FROM "Location" WHERE "deletedAt" IS NULL`,
  );
  console.log(`Active locations remaining: ${active.rows[0].active}`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
