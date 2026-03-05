import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.analyticsEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.location.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();

  // ── Categories ──
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Tarihi Yapılar",
        nameEn: "Historical Sites",
        icon: "landmark",
        color: "#b45309",
        slug: "historical",
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Antik Kentler",
        nameEn: "Ancient Cities",
        icon: "columns-3",
        color: "#92400e",
        slug: "ancient",
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Müzeler",
        nameEn: "Museums",
        icon: "building-2",
        color: "#7c3aed",
        slug: "museum",
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Doğal Alanlar",
        nameEn: "Natural Areas",
        icon: "trees",
        color: "#16a34a",
        slug: "nature",
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "Plajlar & Adalar",
        nameEn: "Beaches & Islands",
        icon: "waves",
        color: "#0891b2",
        slug: "beach",
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: "Kültürel Mekanlar",
        nameEn: "Cultural Venues",
        icon: "palette",
        color: "#db2777",
        slug: "cultural",
        sortOrder: 6,
      },
    }),
    prisma.category.create({
      data: {
        name: "Gastronomi",
        nameEn: "Gastronomy",
        icon: "utensils",
        color: "#ea580c",
        slug: "gastronomy",
        sortOrder: 7,
      },
    }),
    prisma.category.create({
      data: {
        name: "Termal & Jeopark",
        nameEn: "Thermal & Geopark",
        icon: "flame",
        color: "#dc2626",
        slug: "thermal",
        sortOrder: 8,
      },
    }),
    prisma.category.create({
      data: {
        name: "Dini Yapılar",
        nameEn: "Religious Sites",
        icon: "church",
        color: "#6d28d9",
        slug: "religious",
        sortOrder: 9,
      },
    }),
  ]);

  const [
    historical,
    ancient,
    museum,
    nature,
    beach,
    cultural,
    gastronomy,
    thermal,
    religious,
  ] = categories;

  // ── Locations ──
  const locations = [
    // ═══════════════════════════════════════
    // HISTORICAL SITES
    // ═══════════════════════════════════════
    {
      name: "Zağnos Paşa Camii ve Külliyesi",
      nameEn: "Zagnos Pasha Mosque & Complex",
      description:
        "1461 yılında Fatih Sultan Mehmet'in vezir-i azamı Zağanos Mehmed Paşa tarafından inşa ettirilen Erken Osmanlı başyapıtı. Kare planlı mekanı, merkezi kubbesi ve dört köşe kubbesiyle dönemin mimari denemelerini temsil eder. Barok üsluplu minaresi 18-19. yüzyıl Batı etkili Osmanlı formlarını yansıtır. Erken Osmanlı dönemi mermer minberi, palmet-rumi kombinasyonlu köşe sütunceleri ve eşsiz aynalık madalyonlarıyla sanat tarihi literatürüne girmiştir. Kurtuluş Savaşı'nda Mehmet Akif Ersoy'un direniş vaazı ve Mustafa Kemal'in tarihi 'Balıkesir Hutbesi' burada verilmiştir. 2018'de Darphane tarafından hatıra parası basılmıştır.",
      descriptionEn:
        "An Early Ottoman masterpiece built in 1461 by Zagnos Pasha, Grand Vizier of Sultan Mehmed the Conqueror. Features a square plan with central dome and four corner domes. Its baroque-style minaret reflects 18-19th century Western-influenced Ottoman forms. The Early Ottoman marble minbar with palmette-rumi column decorations is renowned in art history. During the War of Independence, Mehmet Akif Ersoy delivered his resistance sermon and Mustafa Kemal gave the historic 'Balıkesir Sermon' here.",
      shortDesc: "1461 Erken Osmanlı başyapıtı, Balıkesir Hutbesi mekanı",
      shortDescEn:
        "1461 Early Ottoman masterpiece, site of historic Balıkesir Sermon",
      latitude: 39.6484,
      longitude: 27.8826,
      categoryId: historical.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Za%C4%9Fnos_Pa%C5%9Fa_Camii.jpg/1280px-Za%C4%9Fnos_Pa%C5%9Fa_Camii.jpg",
      ],
      visitHours: "Her gün 05:00-22:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Zağnos Mahallesi, Balıkesir Merkez",
      addressEn: "Zagnos District, Balıkesir Center",
      publicTransport:
        "Balıkesir şehir içi belediye otobüsleri ile Zağnos Mahallesi durağında inin. Merkez otogardan yürüyerek 10 dk mesafededir.",
      publicTransportEn:
        "Take Balıkesir city buses and get off at Zağnos Mahallesi stop. 10 min walk from the central bus station.",
      isFeatured: true,
    },
    {
      name: "Balıkesir Saat Kulesi",
      nameEn: "Balıkesir Clock Tower",
      description:
        "1827 yılında inşa edilen ve şehrin simgesi haline gelen Saat Kulesi, Balıkesir'in merkezinde yer almaktadır. Osmanlı döneminden kalma yapı, şehrin tarihi dokusunun önemli bir parçasıdır.",
      descriptionEn:
        "Built in 1827 and becoming the symbol of the city, the Clock Tower is located in the center of Balıkesir. The Ottoman-era structure is an important part of the city's historical texture.",
      shortDesc: "1827'den kalma şehir simgesi",
      shortDescEn: "City symbol dating from 1827",
      latitude: 39.6486,
      longitude: 27.883,
      categoryId: historical.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Bal%C4%B1kesir_Clock_Tower.jpg/1280px-Bal%C4%B1kesir_Clock_Tower.jpg",
      ],
      visitHours: "Dış mekan, her zaman görülebilir",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Merkez, Balıkesir",
      addressEn: "Center, Balıkesir",
      publicTransport:
        "Balıkesir merkez belediye otobüsleri ile Çarşı/Merkez durağında inin. Otogardan yürüyerek 10 dk.",
      publicTransportEn:
        "Take city buses to Çarşı/Merkez stop. 10 min walk from bus station.",
      isFeatured: true,
    },
    {
      name: "Havran Terzizade Konağı (Atatürk ve Seyit Onbaşı Müzesi)",
      nameEn: "Havran Terzizade Mansion (Atatürk & Seyit Onbaşı Museum)",
      description:
        "19. yüzyıl Osmanlı sivil mimarisinin Havran'daki en görkemli örneklerinden biri. Geleneksel Türk konak formunun kırsal uyarlamasıdır. Gazi Mustafa Kemal Atatürk ile Çanakkale kahramanı Havranlı Seyit Onbaşı'nın tarihi buluşmasına ev sahipliği yapmıştır. Balıkesir Büyükşehir Belediyesi tarafından aslına uygun restore edilerek 2023'te Cumhuriyet'in 100. yılında 'Atatürk ve Seyit Onbaşı Müzesi' olarak açılmıştır.",
      descriptionEn:
        "One of the most magnificent examples of 19th-century Ottoman civil architecture in Havran. It hosted the historic meeting between Atatürk and Çanakkale hero Seyit Onbaşı. Restored faithfully and opened as 'Atatürk & Seyit Onbaşı Museum' in 2023 for the Republic's centennial.",
      shortDesc: "Atatürk-Seyit Onbaşı buluşma mekanı, 2023 müze",
      shortDescEn: "Atatürk-Seyit Onbaşı meeting place, 2023 museum",
      latitude: 39.5833,
      longitude: 27.2167,
      categoryId: historical.id,
      images: [
        "https://images.unsplash.com/photo-1590076082562-e7e3e1e0c1f4?w=1024&q=80",
      ],
      visitHours: "Salı-Pazar 09:00-17:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Havran, Balıkesir",
      addressEn: "Havran, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Havran dolmuşları 30 dk arayla kalkar. Havran merkezden yürüyerek 5 dk.",
      publicTransportEn:
        "Minibuses to Havran depart every 30 min from Balıkesir bus station. 5 min walk from Havran center.",
      isFeatured: true,
    },
    {
      name: "Sındırgı Kışla Müze Han",
      nameEn: "Sındırgı Kışla Museum Inn",
      description:
        "Kesme taş mimarisiyle hayranlık uyandıran tarihi yapı. 1957-1998 arası askerlik şubesi olarak kullanılmıştır. Yapı köşelerindeki geleneksel kurşun dökme sistemi sayesinde büyük depremleri minimum hasarla atlatmıştır. Balıkesir Valiliği, Üniversitesi ve Sındırgı Belediyesi ortaklığıyla restore edilerek 8 odalı butik otele ve kültür kompleksine dönüştürülmüştür. Odalar Sındırgı'nın kültürel değerlerinin isimleriyle adlandırılmıştır.",
      descriptionEn:
        "A historic cut-stone building that served as a military office from 1957-1998. Its traditional lead-casting corner system helped it survive major earthquakes. Restored through a multi-stakeholder partnership into an 8-room boutique hotel and cultural complex. Rooms are named after Sındırgı's cultural heritage values.",
      shortDesc: "Tarihi askeri yapı, butik otel ve kültür kompleksi",
      shortDescEn:
        "Historic military building, boutique hotel & cultural complex",
      latitude: 39.2333,
      longitude: 28.1667,
      categoryId: historical.id,
      images: [
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1024&q=80",
      ],
      visitHours: "Her gün 09:00-22:00",
      fee: "Müze ücretsiz, konaklama ücretli",
      feeEn: "Museum free, accommodation paid",
      address: "Sındırgı Merkez, Balıkesir",
      addressEn: "Sındırgı Center, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Sındırgı otobüsleri günde 8-10 sefer kalkar (1.5 saat). Sındırgı merkezden yürüyerek 5 dk.",
      publicTransportEn:
        "Buses to Sındırgı depart 8-10 times daily from Balıkesir station (1.5 hours). 5 min walk from Sındırgı center.",
    },

    // ═══════════════════════════════════════
    // ANCIENT CITIES
    // ═══════════════════════════════════════
    {
      name: "Antandros Antik Kenti",
      nameEn: "Antandros Ancient City",
      description:
        "Edremit Altınoluk'ta, Kaz Dağları'nın güney eteklerinde konumlanan antik kent. Mitolojide Paris'in Afrodit'e 'Altın Elma'yı verdiği efsanevi bölge olarak bilinir. 2001'den beri Ege Üniversitesi liderliğinde kazılar sürmektedir. 'İkinci Efes' olarak nitelendirilen yamaç evleri, Anadolu'da Efes'ten sonra en iyi korunmuş duvar freskleri ve zemin mozaiklerine sahiptir. Yunanca kitabeli mozaik pano, Geç Roma toplumundaki aile bağlarını yansıtmaktadır. Üç bölümlü hamam kompleksi Roma dönemi su mühendisliğinin kanıtıdır.",
      descriptionEn:
        "An ancient city at the southern foothills of Mount Ida in Altınoluk. Known in mythology as where Paris gave Aphrodite the 'Golden Apple'. Excavations led by Ege University since 2001. Its hillside houses, dubbed 'Second Ephesus', have the best-preserved wall frescoes and floor mosaics in Anatolia after Ephesus. Features a Greek-inscribed mosaic panel and a three-section Roman bath complex.",
      shortDesc: "İkinci Efes: Roma freskleri ve mozaikleri",
      shortDescEn: "Second Ephesus: Roman frescoes and mosaics",
      latitude: 39.5794,
      longitude: 26.7372,
      categoryId: ancient.id,
      images: [
        "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1024&q=80",
      ],
      visitHours: "Salı-Pazar 08:30-17:30",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Altınoluk, Edremit, Balıkesir",
      addressEn: "Altınoluk, Edremit, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Edremit/Altınoluk otobüsü (2 saat). Altınoluk merkezden dolmuş veya yürüyerek 15 dk.",
      publicTransportEn:
        "Bus from Balıkesir station to Edremit/Altınoluk (2 hours). Minibus or 15 min walk from Altınoluk center.",
      isFeatured: true,
    },
    {
      name: "Adramytteion Antik Kenti",
      nameEn: "Adramytteion Ancient City",
      description:
        "Burhaniye Ören'de yer alan antik liman kenti. Edremit Körfezi'ndeki jeostratejik konumuyla Ege havzası ve Doğu Akdeniz ticari rotalarının düğüm noktasıdır. Doç. Dr. Hüseyin Murat Özgen liderliğinde kazılar sürmektedir. Koruma amaçlı imar planları, modern kentleşme baskısı altındaki antik yerleşimlerin korunmasına ulusal düzeyde emsal teşkil etmektedir.",
      descriptionEn:
        "An ancient port city in Burhaniye/Ören. Its geostrategic position in the Gulf of Edremit made it a key node on Aegean and Eastern Mediterranean trade routes. Ongoing excavations led by Assoc. Prof. Hüseyin Murat Özgen. Its conservation-oriented development plans set national precedents for protecting ancient settlements under urban pressure.",
      shortDesc: "Antik liman kenti, Ege ticaret düğüm noktası",
      shortDescEn: "Ancient port city, Aegean trade hub",
      latitude: 39.4833,
      longitude: 26.9333,
      categoryId: ancient.id,
      images: [
        "https://images.unsplash.com/photo-1568322503122-d237ab09f422?w=1024&q=80",
      ],
      visitHours: "Salı-Pazar 08:30-17:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Ören, Burhaniye, Balıkesir",
      addressEn: "Ören, Burhaniye, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Burhaniye otobüsü (1.5 saat), ardından Ören dolmuşu (15 dk). Edremit'ten de dolmuş mevcut.",
      publicTransportEn:
        "Bus from Balıkesir to Burhaniye (1.5 hours), then minibus to Ören (15 min). Minibuses also available from Edremit.",
    },
    {
      name: "Daskyleion Antik Kenti",
      nameEn: "Daskyleion Ancient City",
      description:
        "MÖ 7. yüzyıldan kalma Pers (Ahameniş) İmparatorluğu satraplık merkezi. Manyas Gölü kıyısında, Bandırma Ergili'de yer almaktadır. Zerdüştlük inancının izlerini ve Anadolu-Pers kültürel sentezini yansıtan benzersiz kabartmalarıyla öne çıkar. Kazılarda bulunan eserler Bandırma Arkeoloji Müzesi'nde sergilenmektedir.",
      descriptionEn:
        "A Persian (Achaemenid) Empire satrapy center dating from the 7th century BC. Located on the shores of Lake Manyas in Bandırma/Ergili. Features unique reliefs reflecting Zoroastrian traces and Anatolian-Persian cultural synthesis. Artifacts are exhibited at Bandırma Archaeology Museum.",
      shortDesc: "MÖ 7. yüzyıl Pers satraplık merkezi",
      shortDescEn: "7th century BC Persian satrapy center",
      latitude: 40.1667,
      longitude: 28.0333,
      categoryId: ancient.id,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1024&q=80",
      ],
      visitHours: "Salı-Pazar 09:00-17:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Ergili, Bandırma, Balıkesir",
      addressEn: "Ergili, Bandırma, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Bandırma otobüsü (1.5 saat). Bandırma'dan Ergili köyüne dolmuş veya taksi (20 dk).",
      publicTransportEn:
        "Bus from Balıkesir to Bandırma (1.5 hours). Minibus or taxi from Bandırma to Ergili village (20 min).",
      isFeatured: true,
    },
    {
      name: "Kyzikos Antik Kenti",
      nameEn: "Kyzikos Ancient City",
      description:
        "Erdek'te Kapıdağ Yarımadası berzahında konumlanan devasa antik kent. Hadrian Tapınağı, karmaşık antik liman altyapısı ve antik dünyanın en önemli darphanelerinden birine ev sahipliği yapmıştır. Kyzikos staterleri Akdeniz ticaretini yönlendiren en güvenilir para birimlerinden biriydi. Günümüzde 'Belkıs' ve 'Balkız' olarak da bilinir.",
      descriptionEn:
        "A massive ancient city on the isthmus of the Kapıdağ Peninsula in Erdek. Home to the Temple of Hadrian, complex ancient port infrastructure, and one of the ancient world's most important mints. Kyzikos staters were among the most trusted currencies directing Mediterranean trade.",
      shortDesc: "Hadrian Tapınağı ve antik darphane kenti",
      shortDescEn: "Temple of Hadrian and ancient mint city",
      latitude: 40.3833,
      longitude: 27.8667,
      categoryId: ancient.id,
      images: [
        "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1024&q=80",
      ],
      visitHours: "Her gün gündüz saatleri",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Düzler Köyü, Erdek, Balıkesir",
      addressEn: "Düzler Village, Erdek, Balıkesir",
      publicTransport:
        "Bandırma'dan Erdek dolmuşları sık sefer yapar (45 dk). Erdek'ten Düzler köyüne taksi (10 dk).",
      publicTransportEn:
        "Frequent minibuses from Bandırma to Erdek (45 min). Taxi from Erdek to Düzler village (10 min).",
      isFeatured: true,
    },
    {
      name: "Saraylar Açık Hava Müzesi",
      nameEn: "Saraylar Open-Air Museum",
      description:
        "Marmara Adası'nda antik çağlardan beri kesintisiz işletilen mermer ocakları ve heykeltıraşlık okullarının bulunduğu endüstriyel-sanatsal üretim merkezi. Roma ve Bizans başkentlerinin inşasında kullanılan yarı mamul sütunlar, başlıklar ve lahitler doğal ortamlarında sergilenmektedir.",
      descriptionEn:
        "An industrial-artistic production center on Marmara Island with marble quarries operating continuously since antiquity. Semi-finished columns, capitals, and sarcophagi used in building Roman and Byzantine capitals are displayed in their natural setting.",
      shortDesc: "Antik mermer ocakları ve heykeltıraşlık atölyeleri",
      shortDescEn: "Ancient marble quarries and sculpture workshops",
      latitude: 40.6167,
      longitude: 27.6167,
      categoryId: ancient.id,
      images: [
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1024&q=80",
      ],
      visitHours: "Her gün 08:00-18:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Saraylar, Marmara Adası, Balıkesir",
      addressEn: "Saraylar, Marmara Island, Balıkesir",
      publicTransport:
        "Erdek veya Tekirdağ'dan Marmara Adası'na feribot (1-2 saat). Adada Saraylar'a dolmuş mevcut.",
      publicTransportEn:
        "Ferry from Erdek or Tekirdağ to Marmara Island (1-2 hours). Minibus available on the island to Saraylar.",
    },

    // ═══════════════════════════════════════
    // MUSEUMS
    // ═══════════════════════════════════════
    {
      name: "Kuvayi Milliye Müzesi",
      nameEn: "National Forces Museum",
      description:
        "Balıkesir merkezde yer alan müze, Kurtuluş Savaşı döneminde kentin milis örgütlenmesini, kongre kararlarını ve sivil direniş hafızasını somut belgeler ve eşyalar üzerinden yaşatmaktadır.",
      descriptionEn:
        "Located in Balıkesir center, this museum preserves the city's militia organization, congress decisions, and civilian resistance memory during the War of Independence through documents and artifacts.",
      shortDesc: "Kurtuluş Savaşı ve Kuvayi Milliye belgeleri",
      shortDescEn: "War of Independence and National Forces documents",
      latitude: 39.6489,
      longitude: 27.8819,
      categoryId: museum.id,
      images: [
        "https://images.unsplash.com/photo-1590076082562-e7e3e1e0c1f4?w=1024&q=80",
      ],
      visitHours: "Salı-Pazar 09:00-17:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Merkez, Balıkesir",
      addressEn: "Center, Balıkesir",
      publicTransport:
        "Balıkesir merkez belediye otobüsleri ile Çarşı durağında inin. Otogardan yürüyerek 10 dk.",
      publicTransportEn:
        "Take city buses to Çarşı stop. 10 min walk from bus station.",
      isFeatured: true,
    },
    {
      name: "Edremit Zeytinyağı Müzesi",
      nameEn: "Edremit Olive Oil Museum",
      description:
        "Türkiye'nin ilk zeytinyağı müzesi. Zeytinyağı üretiminin tarihini ve geleneksel yöntemlerini sergiler. Zeytin ağacının kültürel önemini anlatan interaktif bölümler bulunmaktadır.",
      descriptionEn:
        "Turkey's first olive oil museum. Exhibits the history and traditional methods of olive oil production with interactive sections on the cultural importance of the olive tree.",
      shortDesc: "Türkiye'nin ilk zeytinyağı müzesi",
      shortDescEn: "Turkey's first olive oil museum",
      latitude: 39.596,
      longitude: 27.024,
      categoryId: museum.id,
      images: [
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1024&q=80",
      ],
      visitHours: "Pazartesi-Cumartesi 09:00-17:00",
      fee: "15 TL",
      feeEn: "15 TRY",
      address: "Edremit, Balıkesir",
      addressEn: "Edremit, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Edremit otobüsü (1.5 saat). Edremit merkezden yürüyerek 10 dk.",
      publicTransportEn:
        "Bus from Balıkesir to Edremit (1.5 hours). 10 min walk from Edremit center.",
    },
    {
      name: "Tahtakuşlar Etnografya Müzesi",
      nameEn: "Tahtakuşlar Ethnography Museum",
      description:
        "Kaz Dağları yöresindeki köklü Türkmen ve Yörük kültürünü, göçebe yaşam pratiklerini, şamanik izler taşıyan şifa inançlarını ve zengin el sanatlarını büyük özenle kayıt altına alan sosyolojik arşiv niteliğinde bir müze.",
      descriptionEn:
        "A museum serving as a sociological archive, meticulously documenting the deep-rooted Turkmen and Yörük culture of the Mount Ida region, nomadic life practices, healing beliefs with shamanic traces, and rich handicrafts.",
      shortDesc: "Yörük kültürü ve göçebe yaşam müzesi",
      shortDescEn: "Yörük culture and nomadic life museum",
      latitude: 39.6167,
      longitude: 26.8833,
      categoryId: museum.id,
      images: [
        "https://images.unsplash.com/photo-1590076215667-875c2d76b544?w=1024&q=80",
      ],
      visitHours: "Salı-Pazar 09:00-17:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Tahtakuşlar Köyü, Edremit, Balıkesir",
      addressEn: "Tahtakuşlar Village, Edremit, Balıkesir",
      publicTransport:
        "Edremit'ten Tahtakuşlar köyüne dolmuş mevcut. Kaz Dağları yönüne giden minibüslerle ulaşılır.",
      publicTransportEn:
        "Minibus from Edremit to Tahtakuşlar village. Accessible via minibuses heading towards Mount Ida.",
    },

    {
      name: "Bandırma Arkeoloji Müzesi",
      nameEn: "Bandırma Archaeology Museum",
      description:
        "Daskyleion kazılarından elde edilen Pers dönemi buluntuları ile Kyzikos'tan çıkarılan devasa mimari parçaların modern küratöryel tekniklerle sergilendiği müze.",
      descriptionEn:
        "A museum exhibiting Persian-period artifacts from Daskyleion excavations and massive architectural pieces from Kyzikos using modern curatorial techniques.",
      shortDesc: "Pers ve antik dönem arkeolojik eserleri",
      shortDescEn: "Persian and ancient period archaeological artifacts",
      latitude: 40.35,
      longitude: 27.9667,
      categoryId: museum.id,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1024&q=80",
      ],
      visitHours: "Salı-Pazar 08:30-17:30",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Bandırma, Balıkesir",
      addressEn: "Bandırma, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Bandırma otobüsü (1.5 saat). İstanbul'dan IDO feribotu ile de ulaşılır. Bandırma merkezden yürüyerek 10 dk.",
      publicTransportEn:
        "Bus from Balıkesir to Bandırma (1.5 hours). Also accessible by IDO ferry from Istanbul. 10 min walk from Bandırma center.",
    },
    {
      name: "Gönen Mozaik Müzesi",
      nameEn: "Gönen Mosaic Museum",
      description:
        "Antik dönemin incelikli zemin döşemelerinin modern küratöryel tekniklerle sergilendiği müze. Bölgedeki Roma dönemi mozaik sanatının en seçkin örneklerini barındırır.",
      descriptionEn:
        "A museum exhibiting exquisite ancient floor mosaics using modern curatorial techniques. Houses the finest examples of Roman-period mosaic art from the region.",
      shortDesc: "Roma dönemi mozaik sanatı koleksiyonu",
      shortDescEn: "Roman-period mosaic art collection",
      latitude: 40.1167,
      longitude: 27.65,
      categoryId: museum.id,
      images: [
        "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1024&q=80",
      ],
      visitHours: "Salı-Pazar 09:00-17:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Gönen, Balıkesir",
      addressEn: "Gönen, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Gönen otobüsü (1 saat). Bandırma'dan da dolmuş mevcut. Gönen merkezden yürüyerek 5 dk.",
      publicTransportEn:
        "Bus from Balıkesir to Gönen (1 hour). Minibuses also from Bandırma. 5 min walk from Gönen center.",
    },
    {
      name: "Rahmi M. Koç Müzesi (Cunda)",
      nameEn: "Rahmi M. Koç Museum (Cunda)",
      description:
        "Ayvalık Cunda Adası'nda endüstriyel miras, iletişim ve ulaşım tarihinin gözler önüne serildiği nitelikli özel müze. Tarihi bir zeytinyağı fabrikasında konumlanmıştır.",
      descriptionEn:
        "A quality private museum on Cunda Island showcasing industrial heritage, communication and transportation history. Located in a historic olive oil factory.",
      shortDesc: "Endüstriyel miras ve ulaşım tarihi müzesi",
      shortDescEn: "Industrial heritage and transportation history museum",
      latitude: 39.3267,
      longitude: 26.705,
      categoryId: museum.id,
      images: [
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1024&q=80",
      ],
      visitHours: "Salı-Pazar 10:00-18:00",
      fee: "80 TL",
      feeEn: "80 TRY",
      address: "Cunda Adası, Ayvalık, Balıkesir",
      addressEn: "Cunda Island, Ayvalık, Balıkesir",
      publicTransport:
        "Ayvalık merkezden Cunda'ya belediye otobüsü ve dolmuş sık sefer yapar (10 dk). Köprü üzerinden yürüyerek de geçilebilir.",
      publicTransportEn:
        "Frequent city buses and minibuses from Ayvalık center to Cunda (10 min). Also walkable across the bridge.",
    },
    {
      name: "Bigadiç Müze ve Kültür Evi",
      nameEn: "Bigadiç Museum and Culture House",
      description:
        "İlçe ölçeğindeki yerel kimliğin, Bigadiç Kalesi'nin stratejik askeri tarihiyle bütünleşerek halka sunulduğu entegre kültür alanı.",
      descriptionEn:
        "An integrated cultural area where local identity is presented to the public, combined with the strategic military history of Bigadiç Castle.",
      shortDesc: "Yerel kimlik ve kale tarihi",
      shortDescEn: "Local identity and castle history",
      latitude: 39.3833,
      longitude: 28.1333,
      categoryId: museum.id,
      images: [
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1024&q=80",
      ],
      visitHours: "Salı-Cumartesi 09:00-17:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Bigadiç, Balıkesir",
      addressEn: "Bigadiç, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Bigadiç otobüsleri günde 6-8 sefer (1 saat). Bigadiç merkezden yürüyerek 5 dk.",
      publicTransportEn:
        "Buses from Balıkesir to Bigadiç 6-8 times daily (1 hour). 5 min walk from Bigadiç center.",
    },

    // ═══════════════════════════════════════
    // NATURAL AREAS
    // ═══════════════════════════════════════
    {
      name: "Kazdağları Milli Parkı (İda Dağı)",
      nameEn: "Mount Ida National Park",
      description:
        "Mitolojide Tanrıların Dağı olarak bilinen Kazdağları, zengin biyoçeşitliliği ve endemik bitki türleriyle ünlüdür. Yürüyüş parkurları, şelaleler ve oksijen oranı yüksek orman alanları ile doğa tutkunlarının vazgeçilmez adresidir. Kaz Dağları ekosistemine bağlı zengin hidrolojik kaynaklar ve volkanik/tektonik jeolojik oluşumlar dünya çapında doğa turizmi altyapısı sunar.",
      descriptionEn:
        "Known as the Mountain of the Gods in mythology, Mount Ida is famous for its rich biodiversity and endemic plant species. An indispensable destination for nature lovers with hiking trails, waterfalls, and high-oxygen forest areas.",
      shortDesc: "Mitolojik Tanrıların Dağı, zengin biyoçeşitlilik",
      shortDescEn: "Mythological Mountain of the Gods, rich biodiversity",
      latitude: 39.7,
      longitude: 26.8833,
      categoryId: nature.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Kazdagi_Verwaltung.JPG/1280px-Kazdagi_Verwaltung.JPG",
      ],
      visitHours: "Her gün 08:00-18:00",
      fee: "10 TL",
      feeEn: "10 TRY",
      address: "Kazdağları, Edremit, Balıkesir",
      addressEn: "Mount Ida, Edremit, Balıkesir",
      accessibility: "Tekerlekli sandalye kısmen uygun, otopark mevcut",
      publicTransport:
        "Balıkesir otogarından Edremit otobüsü (1.5 saat), ardından Kazdağları Milli Parkı'na dolmuş veya taksi. Edremit/Altınoluk'tan tur servisleri de mevcut.",
      publicTransportEn:
        "Bus from Balıkesir to Edremit (1.5 hours), then minibus or taxi to Mount Ida National Park. Tour shuttles also available from Edremit/Altınoluk.",
      isFeatured: true,
    },
    {
      name: "Manyas Kuş Cenneti Milli Parkı",
      nameEn: "Manyas Bird Paradise National Park",
      description:
        "Bandırma yakınında Manyas Gölü havzasında yer alan park, Afrika, Asya ve Avrupa'yı birbirine bağlayan kıtalararası kuş göç yolları üzerindedir. 239'dan fazla kuş türüne kuluçka ve beslenme alanı sağlar. Uluslararası ornitoloji araştırmalarının ve doğa fotoğrafçılığının Türkiye'deki bir numaralı merkezidir. UNESCO Dünya Mirası Geçici Listesi'ndedir.",
      descriptionEn:
        "Located in the Manyas Lake basin near Bandırma, this park sits on intercontinental bird migration routes connecting Africa, Asia, and Europe. Provides breeding and feeding grounds for over 239 bird species. Turkey's number one center for international ornithology research and nature photography. On the UNESCO World Heritage Tentative List.",
      shortDesc: "239+ kuş türü, UNESCO geçici listesi, göç yolu",
      shortDescEn: "239+ bird species, UNESCO tentative list, migration route",
      latitude: 40.1833,
      longitude: 28.0167,
      categoryId: nature.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Manyas_Ku%C5%9F_Cenneti.jpg/1280px-Manyas_Ku%C5%9F_Cenneti.jpg",
      ],
      visitHours: "Her gün 08:00-17:00",
      fee: "20 TL",
      feeEn: "20 TRY",
      address: "Manyas, Balıkesir",
      addressEn: "Manyas, Balıkesir",
      accessibility: "Tekerlekli sandalye uygun, gözlem kuleleri mevcut",
      publicTransport:
        "Bandırma'dan Manyas Kuş Cenneti'ne dolmuş mevcut (30 dk). Balıkesir'den Bandırma otobüsü ile aktarmalı ulaşılır.",
      publicTransportEn:
        "Minibus from Bandırma to Manyas Bird Paradise (30 min). Transfer via Balıkesir-Bandırma bus.",
      isFeatured: true,
    },
    {
      name: "Ayvalık Adaları Tabiat Parkı",
      nameEn: "Ayvalık Islands Nature Park",
      description:
        "Ayvalık açıklarındaki irili ufaklı adaları kapsayan devasa doğal alan. Kara ve deniz ekosistemlerinin iç içe geçtiği biyolojik rezerv. Endemik bitki türleri, zengin sualtı faunası ve asırlık zeytin ağaçları dokusuyla denizel korumanın tabiat turizmiyle kusursuz birleştiği doğa harikası.",
      descriptionEn:
        "A vast natural area encompassing numerous islands off Ayvalık. A biological reserve where land and marine ecosystems intertwine. A natural wonder where marine conservation perfectly merges with nature tourism, featuring endemic plants, rich underwater fauna, and centuries-old olive tree landscapes.",
      shortDesc: "Deniz-kara ekosistemi, endemik türler",
      shortDescEn: "Marine-land ecosystem, endemic species",
      latitude: 39.2833,
      longitude: 26.65,
      categoryId: nature.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/View_on_Ayvalik.JPG/1280px-View_on_Ayvalik.JPG",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Ayvalık, Balıkesir",
      addressEn: "Ayvalık, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Ayvalık otobüsü (3 saat). İzmir'den de sık otobüs seferleri mevcut (3 saat). Ayvalık merkezden tekne turları düzenlenir.",
      publicTransportEn:
        "Bus from Balıkesir to Ayvalık (3 hours). Frequent buses also from İzmir (3 hours). Boat tours organized from Ayvalık center.",
      isFeatured: true,
    },

    // ═══════════════════════════════════════
    // CULTURAL VENUES
    // ═══════════════════════════════════════
    {
      name: "Ayvalık Tarihi Sokaklar",
      nameEn: "Ayvalık Historic Streets",
      description:
        "Ayvalık'ın tarihi kent dokusu, 19. yüzyıl Rum mimarisinin en iyi korunmuş örneklerini barındırır. Dar taş sokaklar, taş evler, zeytinyağı fabrikaları ve butik dükkanlarla dolu atmosferik bir kentsel miras alanıdır. Sokak sanatı, galeri ve atölyelerle çağdaş kültürel yaşamın da merkezi haline gelmiştir.",
      descriptionEn:
        "Ayvalık's historic urban fabric houses the best-preserved examples of 19th-century Greek architecture. An atmospheric urban heritage area filled with narrow stone streets, stone houses, olive oil factories, and boutique shops. It has also become a center of contemporary cultural life with street art, galleries, and workshops.",
      shortDesc: "19. yüzyıl taş sokaklar ve kültürel yaşam",
      shortDescEn: "19th-century stone streets and cultural life",
      latitude: 39.3167,
      longitude: 26.6944,
      categoryId: cultural.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/A_street_in_Cunda_Island.jpg/1280px-A_street_in_Cunda_Island.jpg",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Ayvalık Merkez, Balıkesir",
      addressEn: "Ayvalık Center, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Ayvalık otobüsü (3 saat). İzmir'den sık otobüs seferleri (3 saat). Ayvalık merkezde yürüyerek gezilebilir.",
      publicTransportEn:
        "Bus from Balıkesir to Ayvalık (3 hours). Frequent buses from İzmir (3 hours). Walkable within Ayvalık center.",
      isFeatured: true,
    },
    {
      name: "Cunda Adası (Alibey Adası)",
      nameEn: "Cunda Island (Alibey Island)",
      description:
        "Ayvalık'a köprüyle bağlı tarihi ada. Rum Ortodoks mimarisi, taş evler, restore edilmiş kiliseler, butik oteller ve deniz ürünleri restoranlarıyla ünlüdür. Rahmi M. Koç Müzesi, Taksiyarhis Kilisesi ve Sevgi Yolu gibi kültürel çekim noktalarına ev sahipliği yapar. Sanatçılar ve yazarlar için ilham kaynağı olan bohemik atmosferiyle bilinir.",
      descriptionEn:
        "A historic island connected to Ayvalık by bridge. Famous for Greek Orthodox architecture, stone houses, restored churches, boutique hotels, and seafood restaurants. Home to cultural attractions like Rahmi M. Koç Museum, Taksiyarhis Church, and Love Road. Known for its bohemian atmosphere inspiring artists and writers.",
      shortDesc: "Tarihi ada, bohemik atmosfer ve gastronomi",
      shortDescEn: "Historic island, bohemian atmosphere and gastronomy",
      latitude: 39.3267,
      longitude: 26.705,
      categoryId: cultural.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Cunda_Adas%C4%B1_01.jpg/1280px-Cunda_Adas%C4%B1_01.jpg",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Cunda Adası, Ayvalık, Balıkesir",
      addressEn: "Cunda Island, Ayvalık, Balıkesir",
      publicTransport:
        "Ayvalık merkezden Cunda'ya belediye otobüsü ve dolmuş sık sefer yapar (10 dk). Köprü üzerinden yürüyerek de geçilebilir.",
      publicTransportEn:
        "Frequent city buses and minibuses from Ayvalık center to Cunda (10 min). Also walkable across the bridge.",
      isFeatured: true,
    },
    {
      name: "Şeytan Sofrası",
      nameEn: "Devil's Table",
      description:
        "Ayvalık'ın en ünlü seyir noktası. Sönmüş volkanik lav birikintisi tepe, 360 derecelik takımada ve Midilli manzarası sunar. Volkanik oluşumun mitolojik dev ayak izi efsanesiyle birleşmesi, jeolojik oluşuma kültürel çekicilik kazandırır. Her yıl yüz binlerce ziyaretçiyi çeken devasa doğal seyir terası.",
      descriptionEn:
        "Ayvalık's most famous viewpoint. An extinct volcanic lava accumulation hill offering 360-degree views of the archipelago and Lesbos. The combination of volcanic formation with the mythological giant footprint legend adds cultural appeal. A massive natural viewing terrace attracting hundreds of thousands of visitors annually.",
      shortDesc: "Volkanik seyir terası, 360° ada manzarası",
      shortDescEn: "Volcanic viewing terrace, 360° island panorama",
      latitude: 39.31,
      longitude: 26.67,
      categoryId: nature.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/e/e4/Seytansofrasi.JPG",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Şeytan Sofrası, Ayvalık, Balıkesir",
      addressEn: "Devil's Table, Ayvalık, Balıkesir",
      publicTransport:
        "Ayvalık merkezden Şeytan Sofrası'na dolmuş mevcut (yazın sık sefer). Kış aylarında taksi önerilir (15 dk).",
      publicTransportEn:
        "Minibus from Ayvalık center to Devil's Table (frequent in summer). Taxi recommended in winter (15 min).",
      isFeatured: true,
    },
    {
      name: "Sütüven Şelalesi",
      nameEn: "Sütüven Waterfall",
      description:
        "Kaz Dağları ekosistemine bağlı, Edremit'e 90 km uzaklıktaki muhteşem şelale. Zengin bitki örtüsüyle bölgenin devasa oksijen çadırı niteliğindedir. Eko-turistler, kampçılar ve doğa yürüyüşü grupları için vazgeçilmez rota. Soğuk suyunda yüzme imkanı, restoran ve yerel ürün satış noktaları mevcuttur.",
      descriptionEn:
        "A magnificent waterfall connected to the Mount Ida ecosystem. Serves as a massive oxygen tent for the region with its rich vegetation. An essential route for eco-tourists, campers, and hiking groups. Swimming in cold water, restaurant, and local product stalls available.",
      shortDesc: "Kaz Dağları'nın muhteşem şelalesi",
      shortDescEn: "Magnificent waterfall of Mount Ida",
      latitude: 39.65,
      longitude: 26.8167,
      categoryId: nature.id,
      images: [
        "https://images.unsplash.com/photo-1432405972618-c6b0cfba8b01?w=1024&q=80",
      ],
      visitHours: "Her gün 08:00-19:00",
      fee: "10 TL",
      feeEn: "10 TRY",
      address: "Edremit, Balıkesir",
      addressEn: "Edremit, Balıkesir",
      publicTransport:
        "Edremit'ten Kaz Dağları yönüne dolmuş ile ulaşılır. Son duraktan yürüyüş parkuru başlar (30 dk).",
      publicTransportEn:
        "Minibus from Edremit towards Mount Ida. Hiking trail starts from the last stop (30 min walk).",
    },
    {
      name: "Şahinderesi Kanyonu",
      nameEn: "Şahinderesi Canyon",
      description:
        "Kaz Dağları ekosistemine bağlı, zengin bitki örtüsüyle bölgenin devasa oksijen çadırı niteliğindeki kanyon. Adrenalin tutkunları, eko-turistler ve doğa fotoğrafçıları için sarp ancak büyüleyici bir rota.",
      descriptionEn:
        "A canyon connected to the Mount Ida ecosystem, serving as a massive oxygen tent with its rich vegetation. A steep but enchanting route for adrenaline seekers, eco-tourists, and nature photographers.",
      shortDesc: "Kaz Dağları'nın oksijen dolu kanyonu",
      shortDescEn: "Oxygen-rich canyon of Mount Ida",
      latitude: 39.6833,
      longitude: 26.85,
      categoryId: nature.id,
      images: [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1024&q=80",
      ],
      visitHours: "Gündüz saatleri",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Edremit, Balıkesir",
      addressEn: "Edremit, Balıkesir",
      publicTransport:
        "Edremit'ten Kaz Dağları yönüne dolmuş mevcut. Kanyon girişine taksi veya özel araç önerilir.",
      publicTransportEn:
        "Minibus from Edremit towards Mount Ida. Taxi or private vehicle recommended to canyon entrance.",
    },
    {
      name: "Kapıdağ Yarımadası",
      nameEn: "Kapıdağ Peninsula",
      description:
        "Marmara Denizi'ne uzanan yarımada, deniz turizminin yanı sıra 800 metreyi bulan zirvelerle doğa sporlarına imkan tanır. Ormanlı Şelalesi, Ormanlı Manastır Plajı, ahşap bungalovlar ve kamp alanları alternatif turizm arayanlar için idealdir. Tatlısu Köyü 1700'lerden beri sayfiye kimliğini korumaktadır.",
      descriptionEn:
        "A peninsula extending into the Marmara Sea, offering both beach tourism and nature sports with peaks reaching 800 meters. Ormanlı Waterfall, Ormanlı Monastery Beach, wooden bungalows, and camping areas are ideal for alternative tourism seekers. Tatlısu Village has maintained its resort identity since the 1700s.",
      shortDesc: "Deniz ve dağ turizmi, alternatif tatil",
      shortDescEn: "Sea and mountain tourism, alternative vacation",
      latitude: 40.3833,
      longitude: 27.7833,
      categoryId: nature.id,
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1024&q=80",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Kapıdağ, Erdek, Balıkesir",
      addressEn: "Kapıdağ, Erdek, Balıkesir",
      publicTransport:
        "Bandırma'dan Erdek dolmuşları sık sefer yapar (45 dk). Erdek'ten Kapıdağ köylerine dolmuş mevcut.",
      publicTransportEn:
        "Frequent minibuses from Bandırma to Erdek (45 min). Minibuses from Erdek to Kapıdağ villages.",
    },

    // ═══════════════════════════════════════
    // BEACHES & ISLANDS
    // ═══════════════════════════════════════
    {
      name: "Akçay Plajı",
      nameEn: "Akçay Beach",
      description:
        "Edremit Körfezi'nin en popüler plajlarından biri. Temiz denizi ve uzun sahil şeridiyle aileler için ideal tatil noktası. Sahil boyunca restoranlar ve kafeler bulunmaktadır.",
      descriptionEn:
        "One of the most popular beaches of the Gulf of Edremit. An ideal holiday spot for families with its clean sea and long coastline. Restaurants and cafes along the coast.",
      shortDesc: "Edremit Körfezi'nin popüler aile plajı",
      shortDescEn: "Popular family beach of the Gulf of Edremit",
      latitude: 39.5833,
      longitude: 26.9333,
      categoryId: beach.id,
      images: [
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1024&q=80",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Akçay, Edremit, Balıkesir",
      addressEn: "Akçay, Edremit, Balıkesir",
      accessibility: "Engelli rampası mevcut, otopark var",
      publicTransport:
        "Edremit'ten Akçay'a dolmuş sık sefer yapar (15 dk). Balıkesir otogarından Edremit/Akçay otobüsü (1.5 saat).",
      publicTransportEn:
        "Frequent minibuses from Edremit to Akçay (15 min). Bus from Balıkesir to Edremit/Akçay (1.5 hours).",
    },
    {
      name: "Avşa Adası",
      nameEn: "Avşa Island",
      description:
        "Marmara Takımadaları'nın en popüler turizm destinasyonu. İstanbul'a 2.5 saat mesafede. Antik çağ coğrafyacıları Strabon ve Plinius'un kayıtlarına kadar uzanan köklü geçmişe sahip. Bizans döneminde sürgün yeri olarak kullanılmış, Meryem Ana Manastırı kalıntıları mevcuttur. Avşa Plajı, Altınkum, Mavikoy ve Kadınlar Plajı farklı kıyı deneyimleri sunar. Yerel oteller, pansiyonlar ve apart konaklama ağı bulunur.",
      descriptionEn:
        "The most popular tourism destination of the Marmara Archipelago. 2.5 hours from Istanbul. Has a deep history recorded by ancient geographers Strabo and Pliny. Used as an exile place during Byzantine era, with Virgin Mary Monastery ruins. Avşa Beach, Altınkum, Mavikoy, and Kadınlar Beach offer diverse coastal experiences.",
      shortDesc: "Marmara'nın en popüler adası, tarihi ve plajları",
      shortDescEn: "Marmara's most popular island, history and beaches",
      latitude: 40.5167,
      longitude: 27.5833,
      categoryId: beach.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Sunset_at_Av%C5%9Fa_Island%2C_Turkey.jpg/1280px-Sunset_at_Av%C5%9Fa_Island%2C_Turkey.jpg",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Avşa Adası, Marmara, Balıkesir",
      addressEn: "Avşa Island, Marmara, Balıkesir",
      publicTransport:
        "Erdek veya Tekirdağ'dan Avşa Adası'na İDO ve özel feribotlar kalkar (1-2 saat). Yaz aylarında İstanbul Yenikapı'dan da sefer vardır.",
      publicTransportEn:
        "IDO and private ferries from Erdek or Tekirdağ to Avşa Island (1-2 hours). Summer ferries also from Istanbul Yenikapı.",
      isFeatured: true,
    },
    {
      name: "Erdek Plajı ve Ocaklar Plajı",
      nameEn: "Erdek Beach & Ocaklar Beach",
      description:
        "Kapıdağ Yarımadası'nın en büyük yerleşimi Erdek'in sahil turizmi merkezleri. Ocaklar Plajı ince kumlu sığ deniziyle çocuklu ailelerin bir numaralı çekim merkezi. Erdek Plajı geniş oteller bölgesini kapsar. Bölgesel aile turizminin kalbi.",
      descriptionEn:
        "Coastal tourism centers of Erdek, the largest settlement on the Kapıdağ Peninsula. Ocaklar Beach is the number one attraction for families with children thanks to its fine sand and shallow sea. Erdek Beach covers the wide hotel zone. The heart of regional family tourism.",
      shortDesc: "Aile dostu ince kumlu plajlar",
      shortDescEn: "Family-friendly fine sand beaches",
      latitude: 40.3833,
      longitude: 27.8,
      categoryId: beach.id,
      images: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1024&q=80",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Erdek, Balıkesir",
      addressEn: "Erdek, Balıkesir",
      accessibility: "Engelli erişimi mevcut",
      publicTransport:
        "Bandırma'dan Erdek dolmuşları sık sefer yapar (45 dk). Balıkesir otogarından Bandırma aktarmalı ulaşılır.",
      publicTransportEn:
        "Frequent minibuses from Bandırma to Erdek (45 min). Transfer via Balıkesir-Bandırma bus.",
    },
    {
      name: "Paşalimanı Adası",
      nameEn: "Paşalimanı Island",
      description:
        "Avşa'nın dinamik turizmine tezat oluşturan sakin eko-turizm vahası. El değmemiş doğası, sessiz atmosferi ve karakteristik rüzgarlarıyla ünlenen üzüm bağlarıyla bilinir. Erdek'ten arabalı feribotlarla ulaşılır. Doğayla baş başa konaklama arayanların tercihi.",
      descriptionEn:
        "A tranquil eco-tourism oasis contrasting Avşa's dynamic tourism. Known for its untouched nature, quiet atmosphere, and vineyards famous for their characteristic winds. Accessible by car ferries from Erdek. Preferred by those seeking accommodation in harmony with nature.",
      shortDesc: "Sakin eko-turizm adası, üzüm bağları",
      shortDescEn: "Tranquil eco-tourism island, vineyards",
      latitude: 40.5333,
      longitude: 27.6167,
      categoryId: beach.id,
      images: [
        "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1024&q=80",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Paşalimanı Adası, Marmara, Balıkesir",
      addressEn: "Paşalimanı Island, Marmara, Balıkesir",
      publicTransport:
        "Erdek'ten Paşalimanı Adası'na arabalı feribot kalkar (1 saat). Yaz aylarında sefer sayısı artar.",
      publicTransportEn:
        "Car ferry from Erdek to Paşalimanı Island (1 hour). More frequent services in summer.",
    },
    {
      name: "Sarımsaklı Plajı",
      nameEn: "Sarımsaklı Beach",
      description:
        "Ayvalık'ın en uzun ve en popüler plajı. Mavi Bayraklı sahili, ince kumu ve berrak deniziyle yaz turizminin merkezi. Sahil boyunca oteller, restoranlar ve su sporları tesisleri bulunur.",
      descriptionEn:
        "Ayvalık's longest and most popular beach. A Blue Flag beach that is the center of summer tourism with its fine sand and crystal-clear sea. Hotels, restaurants, and water sports facilities along the coast.",
      shortDesc: "Ayvalık'ın Mavi Bayraklı uzun plajı",
      shortDescEn: "Ayvalık's Blue Flag long beach",
      latitude: 39.2833,
      longitude: 26.6333,
      categoryId: beach.id,
      images: [
        "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1024&q=80",
      ],
      visitHours: "Her zaman açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Sarımsaklı, Ayvalık, Balıkesir",
      addressEn: "Sarımsaklı, Ayvalık, Balıkesir",
      publicTransport:
        "Ayvalık merkezden Sarımsaklı'ya dolmuş sık sefer yapar (15 dk). Balıkesir veya İzmir'den Ayvalık otobüsü ile ulaşılır.",
      publicTransportEn:
        "Frequent minibuses from Ayvalık center to Sarımsaklı (15 min). Accessible via bus from Balıkesir or İzmir to Ayvalık.",
      isFeatured: true,
    },

    // ═══════════════════════════════════════
    // GASTRONOMY
    // ═══════════════════════════════════════
    {
      name: "Ayvalık Tost Sokağı",
      nameEn: "Ayvalık Toast Street",
      description:
        "Ayvalık'ın meşhur tostunun doğduğu ve en otantik halinin sunulduğu sokak. Kaşar peyniri, sucuk, domates ve turşu ile hazırlanan Ayvalık tostu, Türkiye'nin en bilinen sokak lezzetlerinden biridir.",
      descriptionEn:
        "The street where Ayvalık's famous toast was born and served in its most authentic form. Ayvalık toast, prepared with kashkaval cheese, sucuk, tomato, and pickles, is one of Turkey's most well-known street foods.",
      shortDesc: "Meşhur Ayvalık tostunun doğduğu sokak",
      shortDescEn: "Birthplace of the famous Ayvalık toast",
      latitude: 39.3167,
      longitude: 26.6944,
      categoryId: gastronomy.id,
      images: [
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1024&q=80",
      ],
      visitHours: "Her gün 08:00-23:00",
      fee: "Ücretsiz giriş",
      feeEn: "Free entry",
      address: "Ayvalık Merkez, Balıkesir",
      addressEn: "Ayvalık Center, Balıkesir",
      publicTransport:
        "Ayvalık merkezde yürüyerek ulaşılır. Balıkesir veya İzmir'den Ayvalık otobüsü ile gelin.",
      publicTransportEn:
        "Walkable in Ayvalık center. Take bus from Balıkesir or İzmir to Ayvalık.",
      isFeatured: true,
    },
    {
      name: "Edremit Zeytinyağlı Mutfak Rotası",
      nameEn: "Edremit Olive Oil Cuisine Route",
      description:
        "Edremit Körfezi'nin zeytinyağı kültürünü keşfetmek için oluşturulmuş gastronomi rotası. Zeytinyağı fabrikaları, tadım merkezleri ve geleneksel zeytinyağlı yemeklerin sunulduğu restoranları kapsar. Bölge, Türkiye'nin en kaliteli zeytinyağı üretim merkezlerinden biridir.",
      descriptionEn:
        "A gastronomy route created to explore the olive oil culture of the Gulf of Edremit. Covers olive oil factories, tasting centers, and restaurants serving traditional olive oil dishes. The region is one of Turkey's highest quality olive oil production centers.",
      shortDesc: "Zeytinyağı fabrikaları ve tadım rotası",
      shortDescEn: "Olive oil factories and tasting route",
      latitude: 39.596,
      longitude: 27.024,
      categoryId: gastronomy.id,
      images: [
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1024&q=80",
      ],
      visitHours: "Fabrikalar: Pazartesi-Cumartesi 09:00-17:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Edremit, Balıkesir",
      addressEn: "Edremit, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Edremit otobüsü (1.5 saat). Edremit merkezden dolmuş veya taksi ile fabrikalara ulaşılır.",
      publicTransportEn:
        "Bus from Balıkesir to Edremit (1.5 hours). Minibus or taxi from Edremit center to factories.",
    },
    {
      name: "Gönen Kaymağı ve Yöresel Lezzetler",
      nameEn: "Gönen Cream & Local Flavors",
      description:
        "Gönen'in meşhur kaymağı ve yöresel mutfağının tadılabileceği geleneksel lokantalar. Gönen kaymağı, termal suların beslediği otlaklarda yetişen hayvanların sütünden üretilir. Höşmerim, keşkek ve yöresel hamur işleri de bölgenin gastronomi zenginlikleri arasındadır.",
      descriptionEn:
        "Traditional restaurants where you can taste Gönen's famous cream and local cuisine. Gönen cream is produced from milk of animals raised on pastures fed by thermal waters. Höşmerim, keşkek, and local pastries are among the region's gastronomic riches.",
      shortDesc: "Meşhur Gönen kaymağı ve yöresel lezzetler",
      shortDescEn: "Famous Gönen cream and local flavors",
      latitude: 40.1167,
      longitude: 27.65,
      categoryId: gastronomy.id,
      images: [
        "https://images.unsplash.com/photo-1486427944544-d2c246c4df4e?w=1024&q=80",
      ],
      visitHours: "Her gün 07:00-22:00",
      fee: "Ücretsiz giriş",
      feeEn: "Free entry",
      address: "Gönen Merkez, Balıkesir",
      addressEn: "Gönen Center, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Gönen otobüsü (1 saat). Gönen merkezde yürüyerek ulaşılır.",
      publicTransportEn:
        "Bus from Balıkesir to Gönen (1 hour). Walkable in Gönen center.",
    },
    {
      name: "Bandırma Balık Hali ve Sahil Restoranları",
      nameEn: "Bandırma Fish Market & Coastal Restaurants",
      description:
        "Marmara Denizi'nin taze balıklarının sunulduğu Bandırma Balık Hali ve sahil boyunca uzanan deniz ürünleri restoranları. Palamut, lüfer, çinekop ve karides başta olmak üzere mevsimsel balık çeşitleri ile ünlüdür.",
      descriptionEn:
        "Bandırma Fish Market offering fresh fish from the Marmara Sea and seafood restaurants along the coast. Famous for seasonal fish varieties including bonito, bluefish, baby bluefish, and shrimp.",
      shortDesc: "Marmara'nın taze deniz ürünleri",
      shortDescEn: "Fresh seafood from the Marmara Sea",
      latitude: 40.35,
      longitude: 27.9667,
      categoryId: gastronomy.id,
      images: [
        "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=1024&q=80",
      ],
      visitHours: "Her gün 08:00-23:00",
      fee: "Ücretsiz giriş",
      feeEn: "Free entry",
      address: "Bandırma Sahil, Balıkesir",
      addressEn: "Bandırma Coast, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Bandırma otobüsü (1.5 saat). İstanbul'dan İDO feribotu ile de ulaşılır. Bandırma sahilden yürüyerek 5 dk.",
      publicTransportEn:
        "Bus from Balıkesir to Bandırma (1.5 hours). Also IDO ferry from Istanbul. 5 min walk from Bandırma coast.",
    },

    // ═══════════════════════════════════════
    // THERMAL & GEOPARK
    // ═══════════════════════════════════════
    {
      name: "Gönen Kaplıcaları",
      nameEn: "Gönen Thermal Springs",
      description:
        "2000 yılı aşkın geçmişe sahip, Roma döneminden beri kullanılan şifalı termal kaynaklar. 82°C sıcaklığındaki termal sular romatizma, cilt hastalıkları ve solunum yolu rahatsızlıklarına iyi gelmektedir. Modern termal tesisler, oteller ve kür merkezleri bulunmaktadır. Türkiye'nin en önemli termal turizm merkezlerinden biridir.",
      descriptionEn:
        "Healing thermal springs with over 2000 years of history, used since the Roman period. Thermal waters at 82°C are beneficial for rheumatism, skin diseases, and respiratory ailments. Features modern thermal facilities, hotels, and cure centers. One of Turkey's most important thermal tourism centers.",
      shortDesc: "2000 yıllık Roma dönemi termal kaynakları",
      shortDescEn: "2000-year-old Roman-era thermal springs",
      latitude: 40.1167,
      longitude: 27.65,
      categoryId: thermal.id,
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1024&q=80",
      ],
      visitHours: "Her gün 06:00-22:00",
      fee: "Tesise göre değişir",
      feeEn: "Varies by facility",
      address: "Gönen, Balıkesir",
      addressEn: "Gönen, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Gönen otobüsü (1 saat). Gönen merkezden kaplıca tesislerine dolmuş veya yürüyerek 10 dk.",
      publicTransportEn:
        "Bus from Balıkesir to Gönen (1 hour). Minibus or 10 min walk from Gönen center to thermal facilities.",
      isFeatured: true,
    },
    {
      name: "Sındırgı Hisaralan Kaplıcaları",
      nameEn: "Sındırgı Hisaralan Thermal Springs",
      description:
        "Sındırgı ilçesinde yer alan doğal termal kaynaklar. 96°C'ye ulaşan suları ile Türkiye'nin en sıcak termal kaynaklarından biridir. Romatizmal hastalıklar, deri rahatsızlıkları ve sinir sistemi sorunlarına faydalıdır. Termal oteller ve kaplıca tesisleri mevcuttur.",
      descriptionEn:
        "Natural thermal springs in Sındırgı district. One of Turkey's hottest thermal springs with waters reaching 96°C. Beneficial for rheumatic diseases, skin disorders, and nervous system issues. Thermal hotels and spa facilities available.",
      shortDesc: "96°C ile Türkiye'nin en sıcak termal kaynağı",
      shortDescEn: "Turkey's hottest thermal spring at 96°C",
      latitude: 39.2333,
      longitude: 28.1667,
      categoryId: thermal.id,
      images: [
        "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=1024&q=80",
      ],
      visitHours: "Her gün 07:00-22:00",
      fee: "Tesise göre değişir",
      feeEn: "Varies by facility",
      address: "Hisaralan, Sındırgı, Balıkesir",
      addressEn: "Hisaralan, Sındırgı, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Sındırgı otobüsü (1.5 saat), ardından Hisaralan dolmuşu (20 dk). Bazı termal oteller transfer hizmeti sunar.",
      publicTransportEn:
        "Bus from Balıkesir to Sındırgı (1.5 hours), then minibus to Hisaralan (20 min). Some thermal hotels offer transfer service.",
      isFeatured: true,
    },
    {
      name: "Kepsut Jeotermal Alanı",
      nameEn: "Kepsut Geothermal Area",
      description:
        "Kepsut ilçesinde keşfedilen jeotermal kaynaklar. Bölge, termal turizm potansiyeli açısından gelişmekte olan bir destinasyondur. Doğal sıcak su kaynakları ve çevresindeki doğal güzelliklerle dikkat çeker.",
      descriptionEn:
        "Geothermal resources discovered in Kepsut district. The area is an emerging destination in terms of thermal tourism potential. Notable for its natural hot water springs and surrounding natural beauty.",
      shortDesc: "Gelişen jeotermal turizm destinasyonu",
      shortDescEn: "Emerging geothermal tourism destination",
      latitude: 39.6833,
      longitude: 28.1333,
      categoryId: thermal.id,
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1024&q=80",
      ],
      visitHours: "Her gün",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Kepsut, Balıkesir",
      addressEn: "Kepsut, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Kepsut dolmuşları günde birkaç sefer (45 dk). Kepsut merkezden jeotermal alana taksi önerilir.",
      publicTransportEn:
        "Several daily minibuses from Balıkesir to Kepsut (45 min). Taxi recommended from Kepsut center to geothermal area.",
    },

    // ═══════════════════════════════════════
    // RELIGIOUS SITES
    // ═══════════════════════════════════════
    {
      name: "Taksiyarhis Kilisesi (Cunda)",
      nameEn: "Taksiyarhis Church (Cunda)",
      description:
        "1873 yılında inşa edilen Rum Ortodoks kilisesi. Cunda Adası'nın en önemli tarihi yapılarından biridir. Restore edilerek kültür merkezi ve sergi alanı olarak hizmet vermektedir. Taş işçiliği ve iç mekan freskleriyle mimari açıdan büyük değer taşır.",
      descriptionEn:
        "A Greek Orthodox church built in 1873. One of the most important historical structures on Cunda Island. Restored and serving as a cultural center and exhibition space. Architecturally valuable for its stonework and interior frescoes.",
      shortDesc: "1873 Rum Ortodoks kilisesi, kültür merkezi",
      shortDescEn: "1873 Greek Orthodox church, cultural center",
      latitude: 39.3267,
      longitude: 26.705,
      categoryId: religious.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Cunda_church_07832.jpg/1280px-Cunda_church_07832.jpg",
      ],
      visitHours: "Salı-Pazar 09:00-17:00",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Cunda Adası, Ayvalık, Balıkesir",
      addressEn: "Cunda Island, Ayvalık, Balıkesir",
      publicTransport:
        "Ayvalık merkezden Cunda'ya dolmuş (10 dk). Cunda içinde yürüyerek 5 dk.",
      publicTransportEn:
        "Minibus from Ayvalık center to Cunda (10 min). 5 min walk within Cunda.",
      isFeatured: true,
    },
    {
      name: "Yıldırım Bayezid Camii (Edremit)",
      nameEn: "Yıldırım Bayezid Mosque (Edremit)",
      description:
        "14. yüzyılda Osmanlı Sultanı Yıldırım Bayezid döneminde inşa edilen tarihi cami. Erken Osmanlı mimarisinin Edremit'teki en önemli temsilcisidir. Taş işçiliği ve mihrap süslemeleriyle dikkat çeker.",
      descriptionEn:
        "A historic mosque built during the reign of Ottoman Sultan Yıldırım Bayezid in the 14th century. The most important representative of Early Ottoman architecture in Edremit. Notable for its stonework and mihrab decorations.",
      shortDesc: "14. yüzyıl Erken Osmanlı camii",
      shortDescEn: "14th-century Early Ottoman mosque",
      latitude: 39.596,
      longitude: 27.024,
      categoryId: religious.id,
      images: [
        "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1024&q=80",
      ],
      visitHours: "Namaz saatleri dışında ziyarete açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Edremit, Balıkesir",
      addressEn: "Edremit, Balıkesir",
      publicTransport:
        "Balıkesir otogarından Edremit otobüsü (1.5 saat). Edremit merkezden yürüyerek 5 dk.",
      publicTransportEn:
        "Bus from Balıkesir to Edremit (1.5 hours). 5 min walk from Edremit center.",
    },
    {
      name: "Balıkesir Ulu Camii",
      nameEn: "Balıkesir Grand Mosque",
      description:
        "Balıkesir'in en büyük ve en eski camilerinden biri. Osmanlı döneminde inşa edilmiş, çeşitli dönemlerde restore edilmiştir. Şehrin dini ve kültürel yaşamının merkezi konumundadır. Ahşap işçiliği ve hat sanatı örnekleriyle zenginleştirilmiş iç mekanı görülmeye değerdir.",
      descriptionEn:
        "One of Balıkesir's largest and oldest mosques. Built during the Ottoman period and restored in various periods. Central to the city's religious and cultural life. Its interior enriched with woodwork and calligraphy art is worth seeing.",
      shortDesc: "Balıkesir'in tarihi merkez camii",
      shortDescEn: "Balıkesir's historic central mosque",
      latitude: 39.6486,
      longitude: 27.883,
      categoryId: religious.id,
      images: [
        "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1024&q=80",
      ],
      visitHours: "Namaz saatleri dışında ziyarete açık",
      fee: "Ücretsiz",
      feeEn: "Free",
      address: "Merkez, Balıkesir",
      addressEn: "Center, Balıkesir",
      publicTransport:
        "Balıkesir merkez belediye otobüsleri ile Çarşı durağında inin. Otogardan yürüyerek 10 dk.",
      publicTransportEn:
        "Take city buses to Çarşı stop. 10 min walk from bus station.",
    },
  ];

  // ── Create all locations ──
  for (const loc of locations) {
    await prisma.location.create({ data: loc });
  }

  console.log(`✅ ${categories.length} kategori oluşturuldu`);
  console.log(`✅ ${locations.length} lokasyon oluşturuldu`);

  // ── Admin User ──
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.admin.create({
    data: {
      email: "admin@balikesir.gov.tr",
      password: hashedPassword,
      name: "Sistem Yöneticisi",
      role: "SYSTEM_ADMIN",
    },
  });
  console.log("✅ Admin kullanıcı oluşturuldu");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
