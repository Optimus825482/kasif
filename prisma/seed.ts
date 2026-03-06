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
        "Zağnos Paşa Camii, 1461 yılında Fatih Sultan Mehmed'in sadrazamı ve İstanbul'un fethinde kilit rol oynayan Arnavut kökenli komutan Zağnos Paşa tarafından yaptırılmıştır. Balıkesir'in en büyük camisi olan yapı, kesme taş işçiliğiyle inşa edilmiş olup bir ana kubbe ve dört yan kubbeden oluşur. Külliye bünyesinde türbe, hamam ve şadırvanlar bulunmaktadır. 1897 depreminde hasar gören cami, 1908'de Mutasarrıf Ömer Ali Bey tarafından yeniden inşa edilmiştir. Mustafa Kemal Atatürk, 7 Şubat 1923'te bu camide ünlü 'Balıkesir Hutbesi'ni okumuş olup yapı, Türk Kurtuluş Savaşı tarihinin önemli sembollerinden biridir.",
      descriptionEn:
        "Zagan Pasha Mosque was built in 1461 by Zagan Pasha, an Ottoman Grand Vizier of Albanian origin who played a crucial role in the Conquest of Constantinople under Sultan Mehmed II. It is the largest mosque in Balıkesir, constructed in ashlar masonry with one main dome and four side domes. The complex includes a tomb, a hammam, and ornamental fountains. Damaged in the 1897 earthquake, it was rebuilt in 1908. Notably, Mustafa Kemal Atatürk delivered his famous 'Balıkesir Khutbah' here on February 7, 1923, making it a significant symbol of the Turkish War of Independence.",
      shortDesc: "1461 Erken Osmanlı başyapıtı, Balıkesir Hutbesi mekanı",
      shortDescEn:
        "1461 Early Ottoman masterpiece, site of historic Balıkesir Sermon",
      latitude: 39.6488,
      longitude: 27.88,
      categoryId: historical.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Za%C4%9Fnos_Pa%C5%9Fa_Camii.jpg/800px-Za%C4%9Fnos_Pa%C5%9Fa_Camii.jpg",
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
        "Balıkesir Saat Kulesi, 1827 yılında Osmanlı döneminde inşa edilmiş olup şehrin en tanınmış simgelerinden biridir. Yaklaşık 20 metre yüksekliğindeki kule, klasik Osmanlı mimari üslubunda tasarlanmıştır. Şehir merkezinde konumlanan yapı, yüzyıllar boyunca Balıkesir'in nabzını tutan bir zaman ölçer olarak hizmet vermiştir. Günümüzde iyi korunmuş durumda olan kule, kent meydanının odak noktası olmaya devam etmektedir.",
      descriptionEn:
        "The Balıkesir Clock Tower was built in 1827 during the Ottoman era and stands as one of the city's most recognizable landmarks. Rising approximately 20 meters high, the tower was designed in the classical Ottoman architectural style. Situated in the heart of the city center, it has served as a timekeeper for Balıkesir for nearly two centuries. The well-preserved tower remains a focal point of the city square and a popular meeting point for locals and visitors alike.",
      shortDesc: "1827'den kalma şehir simgesi",
      shortDescEn: "City symbol dating from 1827",
      latitude: 39.6453,
      longitude: 27.8792,
      categoryId: historical.id,
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Bal%C4%B1kesir_Clock_Tower_front_view%2C_Bal%C4%B1kesir%2C_2023.jpg/800px-Bal%C4%B1kesir_Clock_Tower_front_view%2C_Bal%C4%B1kesir%2C_2023.jpg",
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
        "Havran Terzizade Konağı, 19. yüzyıl Osmanlı sivil mimarisinin Havran'daki en görkemli örneklerinden biridir. Geleneksel Türk konak formunun kırsal uyarlaması olan yapı, Gazi Mustafa Kemal Atatürk ile Çanakkale kahramanı Havranlı Seyit Onbaşı'nın tarihi buluşmasına ev sahipliği yapmıştır. Balıkesir Büyükşehir Belediyesi tarafından aslına uygun restore edilerek 2023'te Cumhuriyet'in 100. yılında 'Atatürk ve Seyit Onbaşı Müzesi' olarak ziyarete açılmıştır. Müzede Kurtuluş Savaşı belgeleri, fotoğraflar ve dönem eşyaları sergilenmektedir.",
      descriptionEn:
        "Havran Terzizade Mansion is one of the most magnificent examples of 19th-century Ottoman civil architecture in Havran. A rural adaptation of the traditional Turkish mansion form, the building hosted the historic meeting between Mustafa Kemal Atatürk and Çanakkale war hero Seyit Onbaşı from Havran. Faithfully restored by Balıkesir Metropolitan Municipality, it was opened to visitors in 2023 as the 'Atatürk and Seyit Onbaşı Museum' for the Republic's centennial. The museum displays War of Independence documents, photographs, and period artifacts.",
      shortDesc: "Atatürk-Seyit Onbaşı buluşma mekanı, 2023 müze",
      shortDescEn: "Atatürk-Seyit Onbaşı meeting place, 2023 museum",
      latitude: 39.5572,
      longitude: 27.0989,
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
        "Sındırgı Kışla Müze Han, kesme taş mimarisiyle hayranlık uyandıran tarihi bir yapıdır. 1957-1998 yılları arasında askerlik şubesi olarak kullanılmıştır. Yapı köşelerindeki geleneksel kurşun dökme sistemi sayesinde büyük depremleri minimum hasarla atlatmıştır. Balıkesir Valiliği, Üniversitesi ve Sındırgı Belediyesi ortaklığıyla restore edilerek 8 odalı butik otele ve kültür kompleksine dönüştürülmüştür. Odalar Sındırgı'nın kültürel değerlerinin isimleriyle adlandırılmış olup, yapı Sındırgı'nın UNESCO Küresel Jeopark adaylık sürecinin kültürel vitrinlerinden biridir.",
      descriptionEn:
        "Sındırgı Kışla Museum Inn is a historic building admired for its cut-stone architecture. It served as a military recruitment office from 1957 to 1998. Its traditional lead-casting corner system helped it survive major earthquakes with minimal damage. Restored through a partnership between Balıkesir Governorate, University, and Sındırgı Municipality, it has been transformed into an 8-room boutique hotel and cultural complex. Rooms are named after Sındırgı's cultural heritage values, and the building serves as one of the cultural showcases of Sındırgı's UNESCO Global Geopark candidacy.",
      shortDesc: "Tarihi askeri yapı, butik otel ve kültür kompleksi",
      shortDescEn:
        "Historic military building, boutique hotel & cultural complex",
      latitude: 39.3208,
      longitude: 28.1756,
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
        "Antandros, Kazdağları'nın güney eteklerinde, 215 metre yüksekliğindeki Kaletaşı tepesinde kurulmuş antik bir Troas kentidir. MÖ 7. yüzyılda Lelegler tarafından kurulduğu rivayet edilen kent, Troya Savaşı sonrası Aeneas'ın donanmasını inşa ettiği yer olarak Vergilius'un Aeneis destanında anılmaktadır. 'İkinci Efes' olarak nitelendirilen yamaç evleri, Anadolu'da Efes'ten sonra en iyi korunmuş duvar freskleri ve zemin mozaiklerine sahiptir. 1842'de Heinrich Kiepert tarafından keşfedilen kent, günümüzde aktif arkeolojik kazılarla gün yüzüne çıkarılmaya devam etmektedir.",
      descriptionEn:
        "Antandros is an ancient Troad city situated on the 215-meter-high Kaletaşı hilltop on the southern slopes of Mount Ida, 2.5 km east of Altınoluk. According to tradition, the city was founded by the Leleges in the 7th century BC, and it is mentioned in Virgil's Aeneid as the place where Aeneas built his fleet after the fall of Troy. Its hillside houses, dubbed 'Second Ephesus', have the best-preserved wall frescoes and floor mosaics in Anatolia after Ephesus. First identified by Heinrich Kiepert in 1842, the site continues to be actively excavated today.",
      shortDesc: "İkinci Efes: Roma freskleri ve mozaikleri",
      shortDescEn: "Second Ephesus: Roman frescoes and mosaics",
      latitude: 39.5758,
      longitude: 26.7906,
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
        "Adramytteion, Burhaniye'nin 4 km batısında Ören sahil mahallesinde, Edremit Körfezi kıyısında kurulmuş antik bir Aiolis kentidir. MÖ 4. yüzyıldan itibaren önemli bir ticaret ve denizcilik merkezi olan kent, Roma ve Bizans dönemlerinde de varlığını sürdürmüştür. 2020 ve 2025 yıllarında deniz seviyesinin düşmesiyle antik limanın kalıntıları gün yüzüne çıkmış ve drone görüntüleriyle belgelenmiştir. Günümüzde aktif arkeolojik kazıların sürdüğü Adramytteion, Ege kıyısının en önemli antik yerleşimlerinden biridir.",
      descriptionEn:
        "Adramytteion is an ancient Aeolian city located at the coastal neighborhood of Ören in Burhaniye, on the shores of the Gulf of Edremit. A significant center of trade and maritime activity from the 4th century BC onward, the city continued to thrive through the Roman and Byzantine periods. In 2020 and 2025, receding sea levels dramatically revealed the ancient port remains, documented by drone footage that attracted international attention. Active archaeological excavations continue, making it one of the most important ancient settlements on the Aegean coast.",
      shortDesc: "Antik liman kenti, Ege ticaret düğüm noktası",
      shortDescEn: "Ancient port city, Aegean trade hub",
      latitude: 39.5007,
      longitude: 26.9327,
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
        "Daskyleion, Manyas Gölü'nün güneybatı kıyısında, Bandırma Ergili köyü yakınlarında yer alan antik bir Anadolu kentidir. Tunç Çağı'ndan itibaren yerleşim gören kent, MÖ 6. yüzyılda Pers İmparatorluğu'nun Hellespontos Phrygia satraplığının başkenti olmuştur. 1952'de yeniden keşfedilen ve 1954'ten bu yana kazıları süren kentte, Kybele tapınağı temelleri, satraplık dönemi teras duvarları ve çok sayıda Pers dönemi kabartması bulunmuştur. Persepolis ve Pasargad'daki teras duvarlarına benzer mimari kalıntılarıyla Anadolu'daki Pers varlığının en önemli kanıtlarından birini sunmaktadır.",
      descriptionEn:
        "Daskyleion is an ancient Anatolian city located near the village of Ergili in Bandırma, on the southwestern shore of Lake Manyas. Settled since the Bronze Age, it became the capital of the Persian satrapy of Hellespontine Phrygia in the mid-6th century BC. Rediscovered in 1952 and excavated since 1954, the site has yielded foundations of a Cybele temple, satrapal-era terrace walls, and numerous Persian-period reliefs. Its architectural remains, resembling the terrace walls of Persepolis and Pasargadae, provide some of the most important evidence of Persian presence in Anatolia.",
      shortDesc: "MÖ 7. yüzyıl Pers satraplık merkezi",
      shortDescEn: "7th century BC Persian satrapy center",
      latitude: 40.1327,
      longitude: 28.0519,
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
        "Kyzikos, Kapıdağ Yarımadası'nın kara tarafında kurulmuş, Mysia bölgesinin en önemli antik Yunan kentlerinden biridir. Antik dünyanın en büyük Greko-Romen tapınağı olan İmparator Hadrianus Tapınağı burada inşa edilmiş olup sütunları 21,35 metre yüksekliğiyle Baalbek'tekileri bile aşmaktadır. Kyzikos altın sikkeleri (cyzicenus) antik dünyada temel para birimi olarak kullanılmıştır. MÖ 410'daki Kyzikos Deniz Muharebesi'nde Atina donanması Sparta'yı burada yenmiştir. Kent, 443'ten 1063'e kadar süren deprem serisiyle tahrip olmuş, kalıntıları Bizans İmparatoru Justinianus tarafından Ayasofya'nın inşasında kullanılmıştır.",
      descriptionEn:
        "Kyzikos is one of the most important ancient Greek cities of the Mysia region, located on the shoreward side of the Kapıdağ Peninsula near Erdek. The city housed the Temple of Emperor Hadrian — the largest Greco-Roman temple ever built — with columns reaching 21.35 meters, surpassing even those at Baalbek. The gold staters of Cyzicus served as a staple currency throughout the ancient world. In 410 BC, the Athenian fleet defeated Sparta in the famous Battle of Cyzicus here. The city was devastated by earthquakes from 443 to 1063 AD, and its monuments were quarried by Emperor Justinian for the construction of Hagia Sophia.",
      shortDesc: "Hadrian Tapınağı ve antik darphane kenti",
      shortDescEn: "Temple of Hadrian and ancient mint city",
      latitude: 40.3878,
      longitude: 27.8706,
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
        "Saraylar Açık Hava Müzesi, Marmara Adası'nın kuzeydoğusundaki Saraylar beldesinde, antik Prokonnesos mermer ocaklarının bulunduğu alanda yer almaktadır. Roma İmparatorluğu döneminden kalma yarım kalmış heykeller, lahitler ve mimari parçalar açık havada sergilenmektedir. Adanın mermeri, İstanbul'daki Ayasofya, Sultanahmet Camii ve Roma'daki Büyük Ludovisi Lahdi gibi dünyaca ünlü yapılarda kullanılmıştır. Saraylar adı, Bizans döneminde aristokratların yaptırdığı saraylardan gelmektedir.",
      descriptionEn:
        "The Saraylar Open Air Museum is located in the ancient Proconnesian marble quarries on the northeast coast of Marmara Island, the largest island in the Sea of Marmara. The site displays unfinished Roman-era sculptures, sarcophagi, and architectural elements left in situ at the quarry. Proconnesian marble from these quarries was used in world-famous structures including Hagia Sophia, the Blue Mosque in Istanbul, and the Great Ludovisi Sarcophagus now in Rome. The village name 'Saraylar' derives from the Byzantine aristocratic summer residences that once dotted the area.",
      shortDesc: "Antik mermer ocakları ve heykeltıraşlık atölyeleri",
      shortDescEn: "Ancient marble quarries and sculpture workshops",
      latitude: 40.6555,
      longitude: 27.654,
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
        "Balıkesir Kuva-yi Milliye Müzesi, 1840 yılında Karesi Sancağı defterdarı Giridizade Mehmet Paşa için inşa edilen tarihi bir konakta yer almaktadır. 15 Mayıs 1919'da İzmir'in işgalinin ertesi günü, Balıkesirli ileri gelenler bu konakta toplanarak Kuva-yi Milliye'yi kurmuş ve Kurtuluş Savaşı'nın önemli bir direniş merkezi haline gelmiştir. Müze 1996'da açılmış olup, zemin katta 41 vatanseverin belgeleri, fotoğrafları ve kişisel eşyaları, üst katta ise arkeolojik ve etnografik eserler sergilenmektedir. Koleksiyonda 4.979 kayıtlı eser ve yaklaşık 45.500 inceleme objesi mevcuttur.",
      descriptionEn:
        "The Museum of the Nationalist Forces is housed in a historic Ottoman mansion built in 1840 for Giridizade Mehmet Pasha, treasurer of the Karasi Sanjak. On May 16, 1919, the day after the Greek occupation of Smyrna, prominent citizens of Balıkesir gathered here to form the Kuva-yi Milliye, making it a pivotal center of resistance during the Turkish War of Independence. Opened in 1996, the ground floor displays documents, photographs, and personal belongings of the 41 citizens who pioneered the nationalist movement. The collection includes 4,979 registered items and approximately 45,500 study objects.",
      shortDesc: "Kurtuluş Savaşı ve Kuvayi Milliye belgeleri",
      shortDescEn: "War of Independence and National Forces documents",
      latitude: 39.6458,
      longitude: 27.8794,
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
        "Edremit Zeytinyağı Müzesi, Türkiye'nin ilk ve tek zeytinyağı müzesi olarak Edremit'in binlerce yıllık zeytin kültürünü yaşatmaktadır. Müzede geleneksel taş baskı yağhanelerden modern üretim tekniklerine kadar zeytinyağı üretiminin tüm aşamaları sergilenmektedir. Zeytin ağacının Akdeniz medeniyetlerindeki kültürel ve ekonomik önemini anlatan interaktif bölümler, tadım alanları ve eğitim atölyeleri bulunmaktadır. Edremit zeytinyağının AB Coğrafi İşaret tescili hikayesi de müzenin öne çıkan bölümlerindendir.",
      descriptionEn:
        "Edremit Olive Oil Museum is Turkey's first and only olive oil museum, preserving Edremit's thousands-of-years-old olive culture. The museum exhibits all stages of olive oil production from traditional stone-press mills to modern techniques. It features interactive sections explaining the cultural and economic importance of the olive tree in Mediterranean civilizations, tasting areas, and educational workshops. The story of Edremit olive oil's EU Protected Geographical Indication certification is among the museum's highlights.",
      shortDesc: "Türkiye'nin ilk zeytinyağı müzesi",
      shortDescEn: "Turkey's first olive oil museum",
      latitude: 39.5935,
      longitude: 27.0164,
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
        "Tahtakuşlar Etnografya Müzesi, Kazdağları'nın eteklerinde, Edremit'e bağlı Tahtakuşlar köyünde yer alan özel bir müzedir. 1991 yılında emekli ilkokul öğretmeni Alibey Kudar tarafından kurulan müze, Oğuz Türklerinin bir kolu olan Tahtacı Türkmenlerinin yaşam kültürünü, ev eşyalarını, geleneksel kıyafetlerini, kilimlerini ve takılarını sergilemektedir. 1992'de ressam ve heykeltıraş Selim Turan'ın sanat galerisi, 1994'te ise bir kütüphane müzeye eklenmiştir. Koleksiyonda ayrıca 197 cm uzunluğunda dev bir deniz kaplumbağası kabuğu da bulunmaktadır.",
      descriptionEn:
        "The Tahtakuşlar Ethnography Museum is a private museum in Tahtakuşlar village at the foothills of Mount Ida, founded in 1991 by retired teacher Alibey Kudar. Dedicated to preserving the lifestyle of the Tahtacı Turkmen, a branch of the Oghuz Turks, exhibits include traditional household furniture, local attire, rugs, tents, and ornaments reflecting centuries of nomadic culture. An art gallery featuring works by painter and sculptor Selim Turan was added in 1992, and a library in 1994. The collection also includes a remarkable giant sea turtle shell measuring 197 cm.",
      shortDesc: "Yörük kültürü ve göçebe yaşam müzesi",
      shortDescEn: "Yörük culture and nomadic life museum",
      latitude: 39.5911,
      longitude: 26.8583,
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
        "Bandırma Arkeoloji Müzesi, 2003 yılında açılmış olup Güney Marmara bölgesinin en önemli arkeoloji müzelerinden biridir. Müzede, antik Kyzikos, Daskyleion ve çevre yerleşimlerden çıkarılan Roma, Bizans ve Osmanlı dönemlerine ait lahitler, heykeller, sikkeler, seramikler ve mimari parçalar sergilenmektedir. Bandırma, Marmara Denizi'nin güneyinde stratejik bir liman kenti olarak tarih boyunca önemli bir ticaret ve ulaşım merkezi olmuştur.",
      descriptionEn:
        "The Bandırma Archaeological Museum, opened in 2003, is one of the most significant archaeological museums in the Southern Marmara region. It houses sarcophagi, sculptures, coins, ceramics, and architectural fragments from the Roman, Byzantine, and Ottoman periods, excavated from the ancient cities of Kyzikos, Daskyleion, and surrounding settlements. Bandırma has served as a strategic port city on the southern coast of the Sea of Marmara throughout history.",
      shortDesc: "Pers ve antik dönem arkeolojik eserleri",
      shortDescEn: "Persian and ancient period archaeological artifacts",
      latitude: 40.3472,
      longitude: 27.9533,
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
        "Gönen Mozaik Müzesi, antik dönemin incelikli zemin döşemelerinin modern küratöryel tekniklerle sergilendiği özel bir müzedir. Bölgedeki Roma dönemi villalarından çıkarılan mozaik sanatının en seçkin örneklerini barındırır. Mitolojik sahneler, geometrik desenler ve doğa motifleriyle bezeli mozaikler, Güney Marmara'nın antik dönemdeki kültürel zenginliğini gözler önüne serer. Gönen'in termal turizmiyle birleştiğinde bölgeye kültürel bir derinlik katmaktadır.",
      descriptionEn:
        "Gönen Mosaic Museum is a specialized museum exhibiting exquisite ancient floor mosaics using modern curatorial techniques. It houses the finest examples of Roman-period mosaic art excavated from villas in the region. Mosaics adorned with mythological scenes, geometric patterns, and nature motifs reveal the cultural richness of the southern Marmara region in antiquity. Combined with Gönen's thermal tourism, it adds cultural depth to the area.",
      shortDesc: "Roma dönemi mozaik sanatı koleksiyonu",
      shortDescEn: "Roman-period mosaic art collection",
      latitude: 40.1058,
      longitude: 27.6533,
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
        "Rahmi M. Koç Müzesi Cunda, Ayvalık Cunda Adası'nda tarihi bir zeytinyağı fabrikasında konumlanan özel bir endüstri müzesidir. İstanbul'daki ana müzenin uzantısı olan bu şube, endüstriyel miras, iletişim ve ulaşım tarihine odaklanmaktadır. Koleksiyonda antika otomobiller, denizcilik araçları, telgraf makineleri ve erken dönem sanayi ekipmanları yer almaktadır. Zeytinyağı fabrikasının orijinal taş duvarları ve ahşap çatı strüktürü korunarak müze mekanına dönüştürülmüştür.",
      descriptionEn:
        "Rahmi M. Koç Museum Cunda is a private industrial museum located in a historic olive oil factory on Cunda Island, Ayvalık. An extension of the main museum in Istanbul, this branch focuses on industrial heritage, communication, and transportation history. The collection includes antique automobiles, maritime vessels, telegraph machines, and early industrial equipment. The original stone walls and wooden roof structure of the olive oil factory have been preserved in the museum conversion.",
      shortDesc: "Endüstriyel miras ve ulaşım tarihi müzesi",
      shortDescEn: "Industrial heritage and transportation history museum",
      latitude: 39.3196,
      longitude: 26.6948,
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
        "Bigadiç Müze ve Kültür Evi, ilçe ölçeğindeki yerel kimliğin, Bigadiç Kalesi'nin stratejik askeri tarihiyle bütünleşerek halka sunulduğu entegre bir kültür alanıdır. Müzede Bigadiç ve çevresinden toplanan arkeolojik buluntular, etnografik eserler ve yerel el sanatları sergilenmektedir. Bigadiç Kalesi'nin tarihçesi ve bölgenin Osmanlı öncesi dönemine ait belgeler de koleksiyonun önemli parçalarıdır. İlçenin bor madeni zenginliği ve doğal güzellikleriyle birlikte kültürel turizm potansiyelini artırmaktadır.",
      descriptionEn:
        "Bigadiç Museum and Culture House is an integrated cultural space where local identity is presented to the public, combined with the strategic military history of Bigadiç Castle. The museum displays archaeological finds, ethnographic artifacts, and local handicrafts collected from Bigadiç and its surroundings. The history of Bigadiç Castle and documents from the pre-Ottoman period are important parts of the collection. Together with the district's boron mineral wealth and natural beauty, it enhances the cultural tourism potential of the area.",
      shortDesc: "Yerel kimlik ve kale tarihi",
      shortDescEn: "Local identity and castle history",
      latitude: 39.3926,
      longitude: 28.1331,
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
        "Kazdağları (İda Dağı), Antik Yunan mitolojisinde Zeus'un Truva Savaşı'nı izlediği, Paris'in ünlü güzellik yarışmasını yönettiği kutsal dağdır. 1.774 metre zirve noktasıyla Biga Yarımadası'nın en yüksek kütlesi olup, Buzul Çağı'ndan kalma endemik bitki türleriyle dünyada eşsiz bir biyoçeşitliliğe sahiptir; özellikle Kazdağı göknarı (Abies equi-trojani) burada yetişen nadir türlerdendir. 1993 yılında milli park ilan edilen bölge, oksijen oranı yüksek ormanları ve şifalı bitki örtüsüyle 'Dünyanın oksijen deposu' olarak anılır. Zeytinliklerle kaplı güney yamaçları 'Zeytin Rivierası' olarak bilinir.",
      descriptionEn:
        "Mount Ida (Kazdağı) is a sacred mountain of ancient Greek mythology where Zeus watched the Trojan War and Paris judged the famous beauty contest among three goddesses. Rising to 1,774 meters, it is the highest massif of the Biga Peninsula, harboring extraordinary endemic flora surviving since the Ice Age, including the rare Trojan fir (Abies equi-trojani) found nowhere else on Earth. Designated a national park in 1993, its oxygen-rich forests have earned it the nickname 'oxygen reservoir of the world.' The southern slopes, known as the 'Olive Riviera,' descend through ancient olive groves to the Aegean coast.",
      shortDesc: "Mitolojik Tanrıların Dağı, zengin biyoçeşitlilik",
      shortDescEn: "Mythological Mountain of the Gods, rich biodiversity",
      latitude: 39.7,
      longitude: 26.833,
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
        "Manyas Kuş Cenneti, 1959 yılında Türkiye'nin ilk milli parklarından biri olarak ilan edilen ve Avrupa Konseyi'nden A Sınıfı Diploma alan nadir doğa koruma alanlarındandır. Kuş Gölü'nün kuzeydoğu kıyısında yer alan park, Asya, Avrupa ve Afrika kıtaları arasındaki kuş göç yolları üzerinde kritik bir konumdadır. Her yıl 239 kuş türünden 2-3 milyon kuş bu bölgeyi ziyaret eder; tepeli pelikan, flamingo, kaşıkçı ve balıkçıl gibi türler burada ürer. 1938'de Alman zoolog Curt Kosswig tarafından keşfedilen bölge, 1994'te Ramsar Sözleşmesi kapsamında uluslararası öneme sahip sulak alan olarak tescil edilmiştir.",
      descriptionEn:
        "Manyas Bird Paradise, established in 1959 as one of Turkey's first national parks, is a rare conservation area that received the Council of Europe's Class A Diploma. Located on the northeastern shore of Lake Kuş, the park sits at a critical junction on bird migration routes between Asia, Europe, and Africa. Each year, 2-3 million birds from 239 species visit the area, including breeding populations of Dalmatian pelicans, flamingos, spoonbills, and herons. First discovered by German zoologist Curt Kosswig in 1938, the site was registered as a Ramsar Wetland of International Importance in 1994.",
      shortDesc: "239+ kuş türü, UNESCO geçici listesi, göç yolu",
      shortDescEn: "239+ bird species, UNESCO tentative list, migration route",
      latitude: 40.23,
      longitude: 27.97,
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
        "Ayvalık Adaları Tabiat Parkı, Ege Denizi'nde 22 ada ve çok sayıda kayalıktan oluşan eşsiz bir takımada ekosistemidir. Antik Yunanca'da 'Hekatonnesoi' olarak bilinen bu adalar, binlerce yıllık yerleşim tarihine sahiptir. En büyük ada olan Cunda Adası, Osmanlı ve Rum mimarisinin iç içe geçtiği taş evleri ve balıkçı restoranlarıyla ünlüdür. Karşısında Yunanistan'ın Midilli Adası'nın silueti görülen takımada, berrak suları, bakir koyları ve zengin deniz yaşamıyla dalış ve tekne turları için ideal bir destinasyondur.",
      descriptionEn:
        "Ayvalık Islands Nature Park is a unique archipelago ecosystem in the Aegean Sea comprising 22 islands and numerous rocky islets. Known in antiquity as 'Hekatonnesoi', these islands carry thousands of years of settlement history. The largest island, Cunda, is famous for its stone houses blending Ottoman and Greek architecture. With the silhouette of Greece's Lesbos Island visible across the strait, the archipelago offers crystal-clear waters, pristine coves, and rich marine life ideal for diving and boat tours.",
      shortDesc: "Deniz-kara ekosistemi, endemik türler",
      shortDescEn: "Marine-land ecosystem, endemic species",
      latitude: 39.3475,
      longitude: 26.6217,
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
        "Ayvalık'ın tarihi sokakları, Osmanlı dönemi Rum mimarisinin en iyi korunmuş örneklerini barındıran açık hava müzesi niteliğinde bir kentsel dokuya sahiptir. 1923 öncesinde ağırlıklı olarak Rum nüfusun yaşadığı kasaba, taş evleri, dar arnavut kaldırımlı sokakları ve eski zeytinyağı fabrikalarının bacalarıyla karakteristik bir siluet çizer. Antik Yunanca'da 'Kydonies' olarak bilinen yerleşim, yüzyıllardır zeytinyağı üretimiyle ünlüdür. Günümüzde butik oteller, sanat galerileri ve kafelerle dönüştürülen tarihi yapılar, Ege'nin en atmosferik kasaba merkezlerinden birini oluşturur.",
      descriptionEn:
        "The historic streets of Ayvalık form an open-air museum showcasing some of the best-preserved examples of Ottoman-era Greek architecture. Before 1923, the town was predominantly Greek, and its stone houses, narrow cobblestone streets, and old olive oil factory chimneys create a distinctive skyline. Known in antiquity as 'Kydonies', the settlement has been famous for olive oil production for centuries. Today, historic buildings transformed into boutique hotels, art galleries, and cafés make it one of the most atmospheric town centers on the Aegean coast.",
      shortDesc: "19. yüzyıl taş sokaklar ve kültürel yaşam",
      shortDescEn: "19th-century stone streets and cultural life",
      latitude: 39.3193,
      longitude: 26.6934,
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
        "Cunda Adası, Ayvalık Adaları takımadasının en büyük adası olup 26,8 km² yüzölçümüne sahiptir. Antik çağlardan beri yerleşim yeri olan ada, Nasos, Pordoselene ve Chalkis gibi antik yerleşimlere ev sahipliği yapmıştır. 1923 nüfus mübadelesine kadar tamamen Rum nüfusun yaşadığı adada, Osmanlı ve Rum mimarisinin izleri taş evlerde ve kiliselerde hâlâ görülmektedir. Ada, 1960'larda inşa edilen Türkiye'nin ilk boğaz köprüsüyle anakaraya bağlanmıştır.",
      descriptionEn:
        "Cunda Island is the largest of the Ayvalık Islands archipelago, covering 26.8 km². The island has been inhabited since antiquity, hosting ancient settlements such as Nasos, Pordoselene, and Chalkis. Until the 1923 population exchange, it was entirely Greek-populated, and traces of Ottoman and Greek architecture remain visible in its stone houses and churches. Connected to the mainland by Turkey's first strait bridge built in the 1960s, Cunda is renowned for its seafood restaurants and bohemian atmosphere.",
      shortDesc: "Tarihi ada, bohemik atmosfer ve gastronomi",
      shortDescEn: "Historic island, bohemian atmosphere and gastronomy",
      latitude: 39.3606,
      longitude: 26.6428,
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
        "Şeytan Sofrası, Ayvalık'ın 8 km güneyinde, denizden yaklaşık 354 metre yükseklikte yer alan efsanevi bir seyir tepesidir. Efsaneye göre şeytan bu tepeden Midilli Adası'na atlamış ve kayada dev bir ayak izi bırakmıştır. Türkiye'nin en güzel gün batımı noktalarından biri olarak kabul edilen tepeden, Ayvalık Adaları takımadası, Ege'nin masmavi suları ve karşıda Yunanistan'ın Midilli Adası'nın panoramik manzarası izlenebilir. Özellikle gün batımında gökyüzünün kızıla boyanmasıyla birlikte adaların siluetleri unutulmaz bir tablo oluşturur.",
      descriptionEn:
        "Şeytan Sofrası (Devil's Table) is a legendary hilltop viewpoint approximately 354 meters above sea level, located 8 km south of Ayvalık. According to local legend, the devil leaped from this hilltop to the Greek island of Lesbos, leaving a giant footprint embedded in the rock. Widely regarded as one of Turkey's most spectacular sunset spots, the summit offers panoramic views of the Ayvalık archipelago, the deep blue Aegean waters, and the silhouette of Lesbos across the strait. As the sky turns crimson at sunset, the island silhouettes create an unforgettable tableau.",
      shortDesc: "Volkanik seyir terası, 360° ada manzarası",
      shortDescEn: "Volcanic viewing terrace, 360° island panorama",
      latitude: 39.2892,
      longitude: 26.6432,
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
        "Sütüven Şelalesi, Kazdağları'nın güney yamaçlarında, Edremit'in Zeytinli köyü yakınlarında yer alan büyüleyici bir doğa harikasıdır. Adını suyun kayalardan süt gibi beyaz akışından alan şelale, yemyeşil orman örtüsü içinde yaklaşık 15 metre yükseklikten dökülür. Kazdağları'nın oksijen bakımından zengin serin ormanlarının kalbinde bulunan şelale, yaz aylarında bile serinletici bir atmosfer sunar. Şelalenin altındaki doğal havuzlarda yüzmek mümkündür. Hasan Boğuldu Gölü ile birlikte Kazdağları'nın en popüler doğa gezisi rotalarından birini oluşturur.",
      descriptionEn:
        "Sütüven Waterfall is an enchanting natural wonder on the southern slopes of Mount Ida, near the village of Zeytinli in Edremit. Named for its milk-white cascade over the rocks, the waterfall drops approximately 15 meters through lush forest cover. Nestled in the heart of Mount Ida's oxygen-rich cool forests, it offers a refreshing atmosphere even during the hottest summer months. Visitors can swim in the natural pools beneath the falls. Together with Hasan Boğuldu Lake, it forms one of the most popular nature excursion routes in the Kazdağları region.",
      shortDesc: "Kaz Dağları'nın muhteşem şelalesi",
      shortDescEn: "Magnificent waterfall of Mount Ida",
      latitude: 39.715,
      longitude: 26.83,
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
        "Şahinderesi Kanyonu, Kazdağları'nın en etkileyici doğal oluşumlarından biri olup, derin vadileri ve yüksek kayalık duvarlarıyla nefes kesici bir manzara sunar. Adını bölgede yaşayan şahinlerden alan kanyon, Kazdağları'nın endemik bitki örtüsüyle kaplı yamaçları arasından geçer. Kanyon boyunca akan dere, binlerce yıl boyunca kayaları oyarak bu muhteşem jeolojik yapıyı oluşturmuştur. Trekking ve doğa fotoğrafçılığı için ideal olan kanyon, Kazdağı göknarı ormanları ve zengin yaban hayatıyla bozulmamış bir doğa deneyimi sunar.",
      descriptionEn:
        "Şahinderesi Canyon is one of the most impressive natural formations of Mount Ida, offering breathtaking scenery with its deep valleys and towering rock walls. Named after the hawks that inhabit the area, the canyon cuts through slopes covered with Mount Ida's endemic vegetation. The stream flowing through the canyon has carved this magnificent geological structure over thousands of years. Ideal for trekking and nature photography, the canyon provides visitors with an unspoiled wilderness experience amid Trojan fir forests and rich wildlife.",
      shortDesc: "Kaz Dağları'nın oksijen dolu kanyonu",
      shortDescEn: "Oxygen-rich canyon of Mount Ida",
      latitude: 39.6627,
      longitude: 26.8125,
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
        "Kapıdağ Yarımadası, Marmara Denizi'ne uzanan ve antik çağda 'Arctonnesus' adıyla bilinen tarihi bir tombolo coğrafyasıdır. Efsaneye göre Büyük İskender tarafından anakaraya bağlanan yarımada, antik Kyzikos kentinin bulunduğu yerdir. Doğusunda Bandırma Körfezi, batısında Erdek Körfezi yer alır. Engebeli jeolojisi, yaprak dökmeyen ormanları ve geniş zeytinlikleriyle kaplı yarımada, 1960'lardan beri popüler bir tatil destinasyonudur.",
      descriptionEn:
        "Kapıdağ Peninsula is a historic tombolo extending into the Sea of Marmara, known in antiquity as 'Arctonnesus.' According to legend, it was connected to the mainland by Alexander the Great, and was the site of the ancient city of Cyzicus. The Gulf of Bandırma lies to its east and the Gulf of Erdek to its west. With its rugged geology, evergreen forests, and extensive olive groves, the peninsula has been a popular holiday destination since the 1960s.",
      shortDesc: "Deniz ve dağ turizmi, alternatif tatil",
      shortDescEn: "Sea and mountain tourism, alternative vacation",
      latitude: 40.4595,
      longitude: 27.8517,
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
        "Akçay, Edremit Körfezi'nin kuzeydoğu Ege kıyısında, Yunan adası Midilli'nin karşısında yer alan popüler bir sahil beldesidir. Edremit'in 10 km batısında konumlanan Akçay, uzun kumsalı ve berrak deniziyle yerli turistlerin en çok tercih ettiği yazlık yerleşimlerden biridir. Yeraltından denize karışan soğuk su kaynakları, yaz boyunca denizi serinletir ve bölgeye özgü bir özellik kazandırır. Kazdağları'nın eteklerinde yer alan Akçay, hem deniz hem de doğa turizmi için ideal bir konumdadır.",
      descriptionEn:
        "Akçay is a popular seaside resort on the northeastern Aegean coast in the Edremit Bay, directly across from the Greek island of Lesbos. Located 10 km west of Edremit, it is one of the most favored summer destinations for domestic tourists. Cool groundwater flowing into the sea keeps the water refreshingly fresh throughout summer. Nestled at the foothills of Mount Ida, Akçay offers an ideal combination of beach and nature tourism.",
      shortDesc: "Edremit Körfezi'nin popüler aile plajı",
      shortDescEn: "Popular family beach of the Gulf of Edremit",
      latitude: 39.5858,
      longitude: 26.9239,
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
        "Avşa Adası (eski adıyla Türkeli), Marmara Denizi'nin güneyinde yaklaşık 20,6 km² yüzölçümüne sahip bir Türk adasıdır. Antik çağda Aphousia olarak bilinen ada, Bizans döneminde sürgün yeri olarak kullanılmıştır. Özellikle İstanbullu tatilciler arasında çok popüler bir yaz destinasyonudur. Kışın yaklaşık 2.000 olan nüfusu, yaz aylarında 40-50 bine kadar çıkmaktadır.",
      descriptionEn:
        "Avşa Island (formerly Türkeli) is a Turkish island in the southern Sea of Marmara with an area of about 20.6 km². Known as Aphousia in classical and Byzantine times, it served as a place of exile during the Byzantine period. An extremely popular domestic tourist destination, especially for visitors from Istanbul. Its resident population of around 2,000 swells to 40,000-50,000 during summer.",
      shortDesc: "Marmara'nın en popüler adası, tarihi ve plajları",
      shortDescEn: "Marmara's most popular island, history and beaches",
      latitude: 40.5119,
      longitude: 27.4986,
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
        "Erdek, Marmara Denizi'nin güneyinde Kapıdağ Yarımadası üzerinde konumlanan tarihi bir sahil ilçesidir. Antik çağda Hitit döneminde Artukka, daha sonra Milet kolonisi olarak bilinen Erdek, 1960'larda Bodrum ve Marmaris popüler olmadan önce İstanbulluların gözde tatil beldesi olmuştur. Ocaklar Halk Plajı, 2023 yılında Mavi Bayrak sertifikası almış olup sığ ve sakin deniziyle aileler için idealdir.",
      descriptionEn:
        "Erdek is a historic coastal district on the Kapıdağ Peninsula at the southern shore of the Sea of Marmara. Known as Artukka during the Hittite era and later as a colony of Miletus. In the 1960s, before Bodrum and Marmaris became popular, Erdek was a fashionable holiday resort for Istanbul residents. Ocaklar Public Beach, awarded Blue Flag certification in 2023, features shallow and calm waters ideal for families.",
      shortDesc: "Aile dostu ince kumlu plajlar",
      shortDescEn: "Family-friendly fine sand beaches",
      latitude: 40.4066,
      longitude: 27.7861,
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
        "Paşalimanı Adası, Marmara Denizi'nin güneyinde yer alan Türkiye'nin beşinci büyük adası olup 26,2 km² yüzölçümüne sahiptir. Antik adı Halone olan ada, Kalkolitik Çağ'dan beri yerleşim görmüştür. Hitit kaynaklarına göre MÖ 1300'lerde Troya egemenliğinde olan adaya, MÖ 844'te Milet'ten gelen İon koloniciler yerleşmiştir. Osmanlı döneminde 1923'e kadar Rumlar ve Türkler birlikte yaşamıştır.",
      descriptionEn:
        "Paşalimanı Island, anciently known as Halone, is the fifth largest island of Turkey at 26.2 km², located in the southern Sea of Marmara. First inhabited during the Chalcolithic age, the island was under the rule of Troy during the 1300s BC. Ionian colonizers from Miletus settled here in 844 BC. Under Ottoman rule, Greeks and Turks lived together peacefully until the 1923 population exchange.",
      shortDesc: "Sakin eko-turizm adası, üzüm bağları",
      shortDescEn: "Tranquil eco-tourism island, vineyards",
      latitude: 40.4894,
      longitude: 27.6089,
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
        "Sarımsaklı Plajı, Ayvalık'ın güneyinde yer alan Türkiye'nin en uzun kumsallarından biridir. 7 kilometre uzunluğunda ve 100 metre genişliğindeki altın sarısı kumsalıyla her yıl yüz binlerce yerli ve yabancı turisti ağırlamaktadır. Akdeniz ikliminin hâkim olduğu bölgede, berrak deniz suyu ve ince kum yapısı plajı aileler ve su sporları tutkunları için ideal kılmaktadır.",
      descriptionEn:
        "Sarımsaklı Beach, located south of Ayvalık, is one of the longest beaches in Turkey. Stretching 7 kilometers in length and up to 100 meters in width, its golden sandy shore attracts hundreds of thousands of tourists annually. The Mediterranean climate ensures warm, dry summers ideal for beach activities, while the crystal-clear waters and fine sand make it perfect for families and water sports enthusiasts.",
      shortDesc: "Ayvalık'ın Mavi Bayraklı uzun plajı",
      shortDescEn: "Ayvalık's Blue Flag long beach",
      latitude: 39.2767,
      longitude: 26.6382,
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
        "Ayvalık Tost Sokağı, Ayvalık şehir merkezinde yer alan ve ünlü Ayvalık tostunun doğduğu ikonik sokaktır. Ayvalık tostu, özel ekmek arasına sucuk, sosis, kaşar peyniri, domates, turşu ve çeşitli malzemeler konularak hazırlanan, Türk sokak yemek kültürünün en sevilen lezzetlerinden biridir. Dar sokak boyunca sıralanan tostçu dükkânları, onlarca yıldır aynı geleneksel tariflerle hizmet vermektedir.",
      descriptionEn:
        "Ayvalık Tost Sokağı (Toast Street) is an iconic street in the heart of Ayvalık, famous as the birthplace of the beloved Ayvalık toast. The Ayvalık toast is a Turkish street food staple made with special bread filled with sucuk, cheese, tomatoes, pickles, and various toppings. The narrow street is lined with toast shops that have been serving traditional recipes for decades.",
      shortDesc: "Meşhur Ayvalık tostunun doğduğu sokak",
      shortDescEn: "Birthplace of the famous Ayvalık toast",
      latitude: 39.3189,
      longitude: 26.6939,
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
        "Edremit, binlerce yıllık zeytin kültürünün yaşatıldığı Kuzey Ege'nin en önemli zeytinyağı üretim merkezlerinden biridir. Edremit zeytinyağı, Avrupa Birliği tarafından Coğrafi İşaret tescili almış nadir Türk ürünlerinden biri olup, bölgede yaklaşık 10 milyon zeytin ağacı bulunmaktadır. Zeytinyağlı mutfak rotası boyunca geleneksel taş baskı yağhaneler, zeytin bahçeleri ve yöresel zeytinyağlı yemeklerin sunulduğu köy lokantaları ziyaret edilebilir.",
      descriptionEn:
        "Edremit is one of the most important olive oil production centers in the northern Aegean, with a tradition spanning thousands of years. Edremit olive oil has received EU Protected Geographical Indication status, with approximately 10 million olive trees in the region. The olive oil gastronomy route features traditional stone-press mills, olive groves, and village restaurants serving authentic olive oil-based dishes.",
      shortDesc: "Zeytinyağı fabrikaları ve tadım rotası",
      shortDescEn: "Olive oil factories and tasting route",
      latitude: 39.5936,
      longitude: 27.0244,
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
        "Gönen, Güney Marmara'nın verimli ovalarında pirinç üretimi ve hayvancılığıyla ünlü bir ilçedir. Gönen kaymağı, yörenin zengin süt hayvancılığı geleneğinin en bilinen lezzeti olup, koyu kıvamlı ve yoğun aromasıyla Türkiye genelinde tanınır. İlçede ayrıca Gönen pirinci, ev yapımı erişte, yöresel peynir çeşitleri ve geleneksel Balıkesir mutfağının özgün tatları keşfedilebilir.",
      descriptionEn:
        "Gönen is a district in the southern Marmara region renowned for its rice production and dairy farming traditions. Gönen kaymak (clotted cream) is the most celebrated local delicacy, known throughout Turkey for its thick texture and rich flavor. The district also offers Gönen rice dishes, homemade noodles, local cheese varieties, and authentic Balıkesir cuisine.",
      shortDesc: "Meşhur Gönen kaymağı ve yöresel lezzetler",
      shortDescEn: "Famous Gönen cream and local flavors",
      latitude: 40.1064,
      longitude: 27.6536,
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
        "Bandırma, Marmara Denizi'nin güneyinde konumlanan Türkiye'nin beşinci büyük limanına ev sahipliği yapan önemli bir liman kentidir. Balık hali, her sabah taze avlanan Marmara balıklarının satışa sunulduğu canlı bir pazar yeridir. Sahil boyunca uzanan restoranlar, palamut, lüfer, çinekop ve karides başta olmak üzere günlük taze deniz ürünlerini geleneksel tariflerle sunar.",
      descriptionEn:
        "Bandırma is a major port city on the southern coast of the Sea of Marmara, home to Turkey's fifth-largest port. The fish market is a vibrant marketplace where fresh Marmara Sea catches are sold every morning. Waterfront restaurants along the coast serve daily-fresh seafood including bonito, bluefish, and shrimp prepared with traditional recipes.",
      shortDesc: "Marmara'nın taze deniz ürünleri",
      shortDescEn: "Fresh seafood from the Marmara Sea",
      latitude: 40.3544,
      longitude: 27.9722,
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
        "Gönen Kaplıcaları, Roma döneminden bu yana bilinen ve Balıkesir'in en eski termal kaynaklarından biridir. 78°C sıcaklığa ulaşan termal sular, romatizma, cilt hastalıkları ve solunum yolu rahatsızlıklarına şifa arayanlarca yüzyıllardır tercih edilmektedir. Modern termal tesisler ve oteller, geleneksel hamam kültürüyle çağdaş spa hizmetlerini bir arada sunar.",
      descriptionEn:
        "Gönen Hot Springs have been known since the Roman era and are among the oldest thermal sources in Balıkesir. The thermal waters reach temperatures of 78°C and have been sought for centuries by those seeking relief from rheumatism, skin conditions, and respiratory ailments. Modern thermal facilities combine traditional Turkish bath culture with contemporary spa services.",
      shortDesc: "2000 yıllık Roma dönemi termal kaynakları",
      shortDescEn: "2000-year-old Roman-era thermal springs",
      latitude: 40.1131,
      longitude: 27.6492,
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
        "Sındırgı Hisaralan Kaplıcaları, Balıkesir'in Sındırgı ilçesinde yer alan ve 96°C'ye ulaşan suyu ile Türkiye'nin en sıcak termal kaynaklarından biridir. Antik çağlardan beri bilinen bu termal sular, yüksek mineral içeriğiyle romatizmal hastalıklar, deri rahatsızlıkları ve sinir sistemi sorunlarına faydalıdır. Bölgede modern termal oteller ve geleneksel kaplıca tesisleri bir arada hizmet vermektedir. Sındırgı'nın UNESCO Küresel Jeopark adaylığı kapsamında jeotermal miras alanı olarak da değerlendirilmektedir.",
      descriptionEn:
        "Sındırgı Hisaralan Thermal Springs, located in the Sındırgı district of Balıkesir, is one of Turkey's hottest thermal sources with waters reaching 96°C. Known since antiquity, these mineral-rich thermal waters are beneficial for rheumatic diseases, skin disorders, and nervous system issues. The area features both modern thermal hotels and traditional spa facilities. It is also being evaluated as a geothermal heritage site within Sındırgı's UNESCO Global Geopark candidacy.",
      shortDesc: "96°C ile Türkiye'nin en sıcak termal kaynağı",
      shortDescEn: "Turkey's hottest thermal spring at 96°C",
      latitude: 39.237,
      longitude: 28.175,
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
        "Kepsut Jeotermal Alanı, Balıkesir'in Kepsut ilçesinde keşfedilen ve gelişmekte olan bir termal turizm destinasyonudur. Bölgedeki jeotermal kaynaklar, sera ısıtması ve termal turizm potansiyeli açısından araştırılmaktadır. Doğal sıcak su kaynakları ve çevresindeki bozulmamış kırsal peyzajıyla dikkat çeken alan, Balıkesir'in termal turizm ağının yeni halkası olarak konumlandırılmaktadır.",
      descriptionEn:
        "Kepsut Geothermal Area is an emerging thermal tourism destination in the Kepsut district of Balıkesir. The geothermal resources in the region are being researched for greenhouse heating and thermal tourism potential. Notable for its natural hot water springs and unspoiled rural landscape, the area is being positioned as the newest link in Balıkesir's thermal tourism network.",
      shortDesc: "Gelişen jeotermal turizm destinasyonu",
      shortDescEn: "Emerging geothermal tourism destination",
      latitude: 39.6889,
      longitude: 28.1522,
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
        "Taksiyarhis Kilisesi, 1873 yılında Cunda Adası'ndaki Rum Ortodoks cemaati tarafından Başmelek Mihail'e adanarak inşa edilmiş anıtsal bir kilisedir. Neoklasik üslupta tasarlanan yapı, etkileyici taş işçiliği, yüksek kubbesi ve iç mekanındaki fresklerle Ayvalık bölgesinin en önemli dini miraslarından biridir. 1923 nüfus mübadelesinin ardından terk edilen kilise, uzun yıllar bakımsız kalmıştır. Kapsamlı bir restorasyon sürecinin ardından kültür merkezi ve sergi alanı olarak yeniden işlevlendirilmiştir.",
      descriptionEn:
        "Taksiyarhis Church was built in 1873 by the Greek Orthodox community of Cunda Island, dedicated to Archangel Michael. Designed in the Neoclassical style, the building features impressive stonework, a tall dome, and interior frescoes, making it one of the most important religious heritage sites in the Ayvalık region. Abandoned after the 1923 population exchange, the church fell into disrepair for decades. Following comprehensive restoration, it has been repurposed as a cultural center and exhibition space.",
      shortDesc: "1873 Rum Ortodoks kilisesi, kültür merkezi",
      shortDescEn: "1873 Greek Orthodox church, cultural center",
      latitude: 39.3275,
      longitude: 26.687,
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
        "Yıldırım Bayezid Camii, 14. yüzyılın sonlarında Osmanlı Sultanı I. Bayezid (Yıldırım) döneminde inşa edilmiş olup Edremit'teki Erken Osmanlı mimarisinin en önemli temsilcisidir. Kesme taş ve tuğla almaşık tekniğiyle inşa edilen cami, tek kubbeli plan şemasıyla klasik Osmanlı cami geleneğinin erken örneklerinden biridir. Mihrap ve minber süslemeleri dönemin taş işçiliği ustalığını yansıtır. Yüzyıllar boyunca çeşitli onarımlar geçiren yapı, Edremit'in dini ve kültürel yaşamının merkezi olmaya devam etmektedir.",
      descriptionEn:
        "Yıldırım Bayezid Mosque was built in the late 14th century during the reign of Ottoman Sultan Bayezid I (Thunderbolt) and stands as the most important representative of Early Ottoman architecture in Edremit. Constructed using alternating courses of cut stone and brick, the mosque features a single-dome plan typical of early Ottoman mosque tradition. The mihrab and minbar decorations reflect the mastery of stone carving of the period. Having undergone various restorations over the centuries, the structure continues to serve as the center of Edremit's religious and cultural life.",
      shortDesc: "14. yüzyıl Erken Osmanlı camii",
      shortDescEn: "14th-century Early Ottoman mosque",
      latitude: 39.5962,
      longitude: 27.0243,
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
        "Balıkesir Ulu Camii, şehrin en büyük ve en eski camilerinden biri olup Osmanlı döneminde inşa edilmiştir. Çeşitli dönemlerde kapsamlı restorasyonlar geçiren yapı, Balıkesir'in dini ve kültürel yaşamının merkezi konumundadır. Ahşap işçiliği, hat sanatı örnekleri ve geleneksel Osmanlı cami mimarisiyle zenginleştirilmiş iç mekanı görülmeye değerdir. Zağnos Paşa Külliyesi ile birlikte şehrin tarihi cami mirasının en önemli iki yapısından birini oluşturur.",
      descriptionEn:
        "Balıkesir Grand Mosque is one of the city's largest and oldest mosques, built during the Ottoman period. Having undergone comprehensive restorations in various periods, the structure remains central to Balıkesir's religious and cultural life. Its interior, enriched with woodwork, calligraphy art, and traditional Ottoman mosque architecture, is well worth visiting. Together with the Zağnos Pasha Complex, it forms one of the two most important structures of the city's historic mosque heritage.",
      shortDesc: "Balıkesir'in tarihi merkez camii",
      shortDescEn: "Balıkesir's historic central mosque",
      latitude: 39.648,
      longitude: 27.88,
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
      username: "admin",
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
