/**
 * Generates seed.ts from current active DB locations.
 * Run: node prisma/_gen-seed.mjs > prisma/seed.ts
 */
import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function esc(str) {
  if (str == null) return "null";
  return "`" + str.replace(/`/g, "\\`").replace(/\$/g, "\\$") + "`";
}

function imgArr(images) {
  if (!images || images.length === 0) return "[]";
  return "[\n" + images.map((i) => `        "${i}",`).join("\n") + "\n      ]";
}

async function main() {
  const cats = await pool.query(
    `SELECT id, name, "nameEn", icon, color, slug, "sortOrder" FROM "Category" ORDER BY "sortOrder"`,
  );
  const locs = await pool.query(
    `SELECT l.*, c.slug as "catSlug" FROM "Location" l JOIN "Category" c ON l."categoryId" = c.id WHERE l."deletedAt" IS NULL ORDER BY c."sortOrder", l.name`,
  );

  const slugMap = {
    historical: "historical",
    ancient: "ancient",
    museum: "museum",
    nature: "nature",
    beach: "beach",
    cultural: "cultural",
    gastronomy: "gastronomy",
    thermal: "thermal",
    religious: "religious",
  };

  let out = "";
  out += `import "dotenv/config";\n`;
  out += `import { Pool } from "pg";\n`;
  out += `import { PrismaClient } from "../generated/prisma/client";\n`;
  out += `import { PrismaPg } from "@prisma/adapter-pg";\n`;
  out += `import bcrypt from "bcryptjs";\n\n`;
  out += `const pool = new Pool({ connectionString: process.env.DATABASE_URL });\n`;
  out += `const adapter = new PrismaPg(pool);\n`;
  out += `const prisma = new PrismaClient({ adapter });\n\n`;
  out += `async function main() {\n`;
  out += `  await prisma.analyticsEvent.deleteMany();\n`;
  out += `  await prisma.auditLog.deleteMany();\n`;
  out += `  await prisma.location.deleteMany();\n`;
  out += `  await prisma.category.deleteMany();\n`;
  out += `  await prisma.admin.deleteMany();\n\n`;

  // Categories
  out += `  // ── Categories ──\n`;
  out += `  const categories = await Promise.all([\n`;
  for (const c of cats.rows) {
    out += `    prisma.category.create({\n`;
    out += `      data: {\n`;
    out += `        name: "${c.name}",\n`;
    out += `        nameEn: "${c.nameEn}",\n`;
    out += `        icon: "${c.icon}",\n`;
    out += `        color: "${c.color}",\n`;
    out += `        slug: "${c.slug}",\n`;
    out += `        sortOrder: ${c.sortOrder},\n`;
    out += `      },\n`;
    out += `    }),\n`;
  }
  out += `  ]);\n`;
  out += `  const [\n`;
  out += cats.rows.map((c) => `    ${c.slug},`).join("\n") + "\n";
  out += `  ] = categories;\n\n`;

  // Group locations by category
  const grouped = {};
  for (const slug of Object.keys(slugMap)) grouped[slug] = [];
  for (const l of locs.rows) grouped[l.catSlug].push(l);

  const catLabels = {
    historical: "HISTORICAL SITES",
    ancient: "ANCIENT CITIES",
    museum: "MUSEUMS",
    nature: "NATURAL AREAS",
    beach: "BEACHES & ISLANDS",
    cultural: "CULTURAL VENUES",
    gastronomy: "GASTRONOMY",
    thermal: "THERMAL & GEOPARK",
    religious: "RELIGIOUS SITES",
  };

  out += `  // ── Locations ──\n`;
  out += `  const locations = [\n`;

  for (const slug of Object.keys(catLabels)) {
    const items = grouped[slug];
    if (!items || items.length === 0) continue;
    out += `    // ═══ ${catLabels[slug]} (${items.length}) ═══\n`;
    for (const l of items) {
      out += `    {\n`;
      out += `      name: ${esc(l.name)},\n`;
      out += `      nameEn: ${esc(l.nameEn)},\n`;
      out += `      description: ${esc(l.description)},\n`;
      out += `      descriptionEn: ${esc(l.descriptionEn)},\n`;
      out += `      shortDesc: ${esc(l.shortDesc)},\n`;
      out += `      shortDescEn: ${esc(l.shortDescEn)},\n`;
      out += `      latitude: ${l.latitude},\n`;
      out += `      longitude: ${l.longitude},\n`;
      out += `      categoryId: ${slug}.id,\n`;
      out += `      images: ${imgArr(l.images)},\n`;
      if (l.visitHours) out += `      visitHours: ${esc(l.visitHours)},\n`;
      if (l.fee) out += `      fee: ${esc(l.fee)},\n`;
      if (l.feeEn) out += `      feeEn: ${esc(l.feeEn)},\n`;
      out += `      address: ${esc(l.address)},\n`;
      out += `      addressEn: ${esc(l.addressEn)},\n`;
      if (l.publicTransport)
        out += `      publicTransport: ${esc(l.publicTransport)},\n`;
      if (l.publicTransportEn)
        out += `      publicTransportEn: ${esc(l.publicTransportEn)},\n`;
      if (l.isFeatured) out += `      isFeatured: true,\n`;
      if (!l.isActive) out += `      isActive: false,\n`;
      out += `    },\n`;
    }
  }

  out += `  ];\n\n`;
  out += `  for (const loc of locations) {\n`;
  out += `    await prisma.location.create({ data: loc });\n`;
  out += `  }\n\n`;
  out += `  // ── Admin ──\n`;
  out += `  const hashedPassword = await bcrypt.hash("admin123", 12);\n`;
  out += `  await prisma.admin.create({\n`;
  out += `    data: {\n`;
  out += `      username: "admin",\n`;
  out += `      email: "admin@balikesir.bel.tr",\n`;
  out += `      password: hashedPassword,\n`;
  out += `      name: "Sistem Yöneticisi",\n`;
  out += `      role: "SYSTEM_ADMIN",\n`;
  out += `    },\n`;
  out += `  });\n\n`;
  out += `  console.log(\n`;
  out += `    "✅ Seed completed: " +\n`;
  out += `      locations.length +\n`;
  out += `      " locations, 9 categories, 1 admin",\n`;
  out += `  );\n`;
  out += `}\n\n`;
  out += `main()\n`;
  out += `  .catch((e) => {\n`;
  out += `    console.error(e);\n`;
  out += `    process.exit(1);\n`;
  out += `  })\n`;
  out += `  .finally(async () => {\n`;
  out += `    await prisma.\$disconnect();\n`;
  out += `    await pool.end();\n`;
  out += `  });\n`;

  // Write to file
  const fs = await import("fs");
  fs.writeFileSync("prisma/seed.ts", out, "utf8");
  console.log(
    `Generated seed.ts with ${locs.rows.length} locations, ${cats.rows.length} categories`,
  );

  await pool.end();
}

main().catch(console.error);
