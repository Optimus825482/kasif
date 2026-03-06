import "dotenv/config";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CAT = {
  historical: "cmmeb7hix0000wggs5c7xu9ts",
  ancient: "cmmeb7hiy0001wggsy8gvlym2",
  museum: "cmmeb7hiy0002wggs47udtty6",
  nature: "cmmeb7hiy0003wggsswxn6s8a",
  beach: "cmmeb7hiy0004wggsotlrimf3",
  cultural: "cmmeb7hiy0005wggsmeees7he",
  gastronomy: "cmmeb7hiy0006wggsisa53vjt",
  thermal: "cmmeb7hiy0007wggs6xwnlz7m",
  religious: "cmmeb7hiy0008wggsqnrh95nf",
};

const locations = [
  // ═══════════════════════════════════════════════
  // TERMAL & JEOPARK (12)
  // ═══════════════════════════════════════════════
  {
    name: "Pamukçu Kaplıcaları",
    nameEn: "Pamukçu Thermal Springs",
    description:
      "Balıkesir il merkezine 15 km uzaklıktaki Pamukçu beldesinde bulunan kaplıcalar. 30-58°C sıcaklıkta, bor ve flüorür içeren sodyumlu, sülfatlı, klorürlü termal sular. Romatizmal hastalıklar, eklem hastalıkları, ortopedik operasyonlar sonrası ve stres bozukluğunda destekleyici tedavi.",
    descriptionEn:
      "Thermal springs in Pamukçu town, 15 km from Balıkesir center. 30-58°C sodium sulfate chloride thermal waters containing boron and fluoride. Supportive treatment for rheumatic diseases, joint disorders, post-orthopedic operations and stress.",
    shortDesc: "30-58°C termal sular, romatizma tedavisi",
    shortDescEn: "30-58°C thermal waters, rheumatism treatment",
    lat: 39.58,
    lng: 27.95,
    categoryId: CAT.thermal,
    isFeatured: true,
    address: "Pamukçu Beldesi, Balıkesir Merkez",
    addressEn: "Pamukçu Town, Balıkesir Center",
  },
  {
    name: "Kiraz Kaplıcaları",
    nameEn: "Kiraz Thermal Springs",
    description:
      "Balıkesir Organize Sanayi Bölgesine 10 km uzaklıkta Kiraz Köyü sınırları içinde 40°C sıcaklığındaki kaplıca.",
    descriptionEn:
      "Thermal spring at 40°C located within Kiraz Village, 10 km from Balıkesir Organized Industrial Zone.",
    shortDesc: "40°C doğal kaplıca",
    shortDescEn: "40°C natural thermal spring",
    lat: 39.62,
    lng: 27.92,
    categoryId: CAT.thermal,
    address: "Kiraz Köyü, Balıkesir Merkez",
    addressEn: "Kiraz Village, Balıkesir Center",
  },
  {
    name: "Bostancı Köyü Kaplıcaları",
    nameEn: "Bostancı Village Thermal Springs",
    description:
      "Edremit-Burhaniye karayolu üzerinde Bostancı Köyü sınırlarında bulunan kaplıcalar. 40-57°C sıcaklıkta sodyum sülfatlı oligametalik sular. Hareket sistemi rahatsızlıkları, romatizmal hastalıklar, cilt hastalıkları tedavisinde kullanılır.",
    descriptionEn:
      "Thermal springs in Bostancı Village on the Edremit-Burhaniye highway. 40-57°C sodium sulfate oligometallic waters for musculoskeletal disorders, rheumatic and skin diseases.",
    shortDesc: "40-57°C, hareket sistemi ve cilt tedavisi",
    shortDescEn: "40-57°C, musculoskeletal and skin treatment",
    lat: 39.58,
    lng: 26.98,
    categoryId: CAT.thermal,
    address: "Bostancı Köyü, Edremit, Balıkesir",
    addressEn: "Bostancı Village, Edremit, Balıkesir",
  },
  {
    name: "Derman Ilıcası",
    nameEn: "Derman Hot Spring",
    description:
      "Edremit-Burhaniye yol kavşağı üzerinde, Akçaya 12 km, Edremite 3 km uzaklıkta. 48-58°C sıcaklıkta sular romatizma, lumbago, filibit ve kadın hastalıklarına iyi gelir.",
    descriptionEn:
      "On the Edremit-Burhaniye junction, 12 km from Akçay, 3 km from Edremit. 48-58°C waters beneficial for rheumatism, lumbago, phlebitis and gynecological conditions.",
    shortDesc: "48-58°C, romatizma ve kadın hastalıkları",
    shortDescEn: "48-58°C, rheumatism and gynecological conditions",
    lat: 39.59,
    lng: 27.0,
    categoryId: CAT.thermal,
    address: "Edremit-Burhaniye Kavşağı, Edremit",
    addressEn: "Edremit-Burhaniye Junction, Edremit",
  },
  {
    name: "Ekşidere Dağ Ilıcası",
    nameEn: "Ekşidere Mountain Hot Spring",
    description:
      'Gönen ilçe merkezine 13 km mesafede bulunan termal turizm merkezi. 38-46°C sıcaklıkta sülfat klorürlü sodyum kalsiyum oligometalik sular. Radyoaktif özelliği nedeniyle "gençlik suyu" olarak anılır.',
    descriptionEn:
      'Thermal tourism center 13 km from Gönen. 38-46°C sulfate chloride sodium calcium oligometallic waters. Known as "youth water" due to radioactive properties.',
    shortDesc: '"Gençlik suyu", radyoaktif termal',
    shortDescEn: '"Youth water", radioactive thermal',
    lat: 40.13,
    lng: 27.6,
    categoryId: CAT.thermal,
    isFeatured: true,
    address: "Ekşidere, Gönen, Balıkesir",
    addressEn: "Ekşidere, Gönen, Balıkesir",
  },
  {
    name: "Manyas Kızıkköy Kaplıcaları",
    nameEn: "Manyas Kızıkköy Thermal Springs",
    description:
      "Manyas ilçesine 6 km uzaklıkta, Kızık Köyü İbrahim Tepe Mevkiinde. 45-50°C sıcaklıkta sodyumlu, kalsiyumlu, klorürlü ve bikarbonatlı sular. Sindirim organları, böbrek taşları, romatizma, kemik erimesi ve cilt hastalıklarına iyi gelir.",
    descriptionEn:
      "Located 6 km from Manyas, in Kızık Village. 45-50°C sodium calcium chloride bicarbonate waters. Beneficial for digestive organs, kidney stones, rheumatism, osteoporosis and skin diseases.",
    shortDesc: "45-50°C, sindirim ve cilt tedavisi",
    shortDescEn: "45-50°C, digestive and skin treatment",
    lat: 40.05,
    lng: 28.0,
    categoryId: CAT.thermal,
    address: "Kızık Köyü, Manyas, Balıkesir",
    addressEn: "Kızık Village, Manyas, Balıkesir",
  },
  {
    name: "Susurluk Kepekler (Ilıca Boğazı) Kaplıcası",
    nameEn: "Susurluk Kepekler Thermal Springs",
    description:
      "Susurluk ilçesi 20 km kuzeyinde, Ilıca Boğazı Köyü sınırlarında. 58°C sıcaklıkta sodyumlu klorürlü bikarbonatlı sular. Banyo tedavisi romatizma, nevralji, felçler ve kadın hastalıklarına; çamur tedavisi tüm romatizma çeşitlerine iyi gelir.",
    descriptionEn:
      "Located 20 km north of Susurluk, in Ilıca Boğazı Village. 58°C sodium chloride bicarbonate waters. Bath therapy for rheumatism, neuralgia, paralysis; mud therapy for all rheumatic conditions.",
    shortDesc: "58°C, çamur tedavisi merkezi",
    shortDescEn: "58°C, mud therapy center",
    lat: 39.98,
    lng: 28.15,
    categoryId: CAT.thermal,
    address: "Ilıca Boğazı Köyü, Susurluk, Balıkesir",
    addressEn: "Ilıca Boğazı Village, Susurluk, Balıkesir",
  },
  {
    name: "Susurluk Yıldız (Yellice Tepe) Kaplıcası",
    nameEn: "Susurluk Yıldız Thermal Springs",
    description:
      "Yıldız Köyünün 3.5 km kuzeydoğusunda. 56-68°C sıcaklıkta flüorür içeren sodyumlu, bikarbonatlı, sülfatlı sular. Romatizmal hastalıklar, eklem hastalıkları, yumuşak doku hastalıkları, spor yaralanmaları ve cilt hastalıklarında etkili.",
    descriptionEn:
      "3.5 km northeast of Yıldız Village. 56-68°C fluoride-containing sodium bicarbonate sulfate waters. Effective for rheumatic diseases, joint disorders, soft tissue diseases, sports injuries and skin conditions.",
    shortDesc: "56-68°C, spor yaralanmaları tedavisi",
    shortDescEn: "56-68°C, sports injury treatment",
    lat: 39.95,
    lng: 28.2,
    categoryId: CAT.thermal,
    address: "Yıldız Köyü, Susurluk, Balıkesir",
    addressEn: "Yıldız Village, Susurluk, Balıkesir",
  },
  {
    name: "Balya Dağ Ilıcası",
    nameEn: "Balya Mountain Hot Spring",
    description:
      "Balya yerleşim merkezinin 25 km kuzeydoğusunda. 51-60°C sıcaklıkta sular romatizma, siyatik, kireçlenme ve bazı cilt hastalıklarına iyi gelir.",
    descriptionEn:
      "25 km northeast of Balya center. 51-60°C waters beneficial for rheumatism, sciatica, calcification and certain skin diseases.",
    shortDesc: "51-60°C, romatizma ve siyatik tedavisi",
    shortDescEn: "51-60°C, rheumatism and sciatica treatment",
    lat: 39.78,
    lng: 27.65,
    categoryId: CAT.thermal,
    address: "Balya, Balıkesir",
    addressEn: "Balya, Balıkesir",
  },
  {
    name: "Bigadiç Hisarköy Kaplıcaları",
    nameEn: "Bigadiç Hisarköy Thermal Springs",
    description:
      "Bigadiç ilçe merkezine 17 km mesafede Hisarköy yerleşim merkezinde. 85-92°C sıcaklıkta fluorürlü sodyum ve bikarbonat içeren sular. Kadın hastalıkları, romatizmal hastalıklar, kronik bel ağrısı, inme, astım ve kronik bronşit tedavisinde kullanılır.",
    descriptionEn:
      "17 km from Bigadiç center in Hisarköy. 85-92°C fluoride sodium bicarbonate waters. Used for gynecological conditions, rheumatic diseases, chronic back pain, stroke, asthma and chronic bronchitis.",
    shortDesc: "85-92°C, Balıkesirin en sıcak kaplıcası",
    shortDescEn: "85-92°C, hottest thermal spring in Balıkesir",
    lat: 39.42,
    lng: 28.25,
    categoryId: CAT.thermal,
    isFeatured: true,
    address: "Hisarköy, Bigadiç, Balıkesir",
    addressEn: "Hisarköy, Bigadiç, Balıkesir",
  },
  {
    name: "Sındırgı Emendere Kaplıcası",
    nameEn: "Sındırgı Emendere Thermal Springs",
    description:
      "Sındırgı ilçesine 7 km uzaklıktaki Ilıcalı Köyünde. 33°C sıcaklıkta sular gut hastalarına, böbrek taşlarına, cilt ve mide hastalıklarına, özellikle sedef, mantar, yara, uyuz ve egzamaya iyi gelir.",
    descriptionEn:
      "In Ilıcalı Village, 7 km from Sındırgı. 33°C waters beneficial for gout, kidney stones, skin and stomach diseases, especially psoriasis, fungal infections, wounds and eczema.",
    shortDesc: "33°C, cilt hastalıkları uzmanı",
    shortDescEn: "33°C, skin disease specialist",
    lat: 39.28,
    lng: 28.22,
    categoryId: CAT.thermal,
    address: "Ilıcalı Köyü, Sındırgı, Balıkesir",
    addressEn: "Ilıcalı Village, Sındırgı, Balıkesir",
  },
  {
    name: "Dursunbey Aşağımusalar Ilıcası",
    nameEn: "Dursunbey Aşağımusalar Hot Spring",
    description:
      'Dursunbeyin Aşağımusalar Köyüne 5 km uzaklıkta, Alaçam Dağları doğa güzelliğinin içinde. 29°C sıcaklıkta sular cilt hastalıklarına iyi geldiği için "güzellik suyu" olarak bilinir.',
    descriptionEn:
      'Located 5 km from Aşağımusalar Village in Dursunbey, amid the natural beauty of Alaçam Mountains. 29°C waters known as "beauty water" for their beneficial effects on skin diseases.',
    shortDesc: '29°C "güzellik suyu", cilt bakımı',
    shortDescEn: '29°C "beauty water", skin care',
    lat: 39.55,
    lng: 28.6,
    categoryId: CAT.thermal,
    address: "Aşağımusalar Köyü, Dursunbey, Balıkesir",
    addressEn: "Aşağımusalar Village, Dursunbey, Balıkesir",
  },

  // ═══════════════════════════════════════════════
  // PLAJLAR & ADALAR (5) - BALK.TXT
  // ═══════════════════════════════════════════════
  {
    name: "Şahinkaya (Badavut) Plajı",
    nameEn: "Şahinkaya (Badavut) Beach",
    description:
      "Sarımsaklı plajlarının devamı olup, ince ve temiz kuma sahiptir. Ayvalık'ın en güzel sahillerinden biridir.",
    descriptionEn:
      "Continuation of Sarımsaklı beaches with fine, clean sand. One of the most beautiful shores of Ayvalık.",
    shortDesc: "İnce kumlu, temiz sahil",
    shortDescEn: "Fine sand, clean beach",
    lat: 39.28,
    lng: 26.65,
    categoryId: CAT.beach,
    address: "Badavut Mevkii, Ayvalık, Balıkesir",
    addressEn: "Badavut Area, Ayvalık, Balıkesir",
  },
  {
    name: "Altınova Plajı (Ayvalık)",
    nameEn: "Altınova Beach (Ayvalık)",
    description:
      "Ayvalık ilçesinin şirin mahallesi Altınova, temiz sahillere sahiptir. İlçe merkezine 13 km uzaklıkta, piknik ve gezi yerleriyle orman içinde dinlenmeye olanak sağlar.",
    descriptionEn:
      "Altınova, a charming neighborhood of Ayvalık, has clean beaches. 13 km from the center, offering picnic areas and forest relaxation.",
    shortDesc: "Temiz sahil, orman içi dinlenme",
    shortDescEn: "Clean beach, forest relaxation",
    lat: 39.37,
    lng: 26.67,
    categoryId: CAT.beach,
    address: "Altınova, Ayvalık, Balıkesir",
    addressEn: "Altınova, Ayvalık, Balıkesir",
  },
  {
    name: "Ali Çetinkaya (Armutçuk) Plajı",
    nameEn: "Ali Çetinkaya (Armutçuk) Beach",
    description:
      "Ayvalık ilçesinin kuzey kıyısında temiz, ince kumuyla halka açık bir plajdır.",
    descriptionEn:
      "A public beach on the northern coast of Ayvalık with clean, fine sand.",
    shortDesc: "Halka açık, ince kumlu plaj",
    shortDescEn: "Public beach, fine sand",
    lat: 39.34,
    lng: 26.68,
    categoryId: CAT.beach,
    address: "Ali Çetinkaya, Ayvalık, Balıkesir",
    addressEn: "Ali Çetinkaya, Ayvalık, Balıkesir",
  },
  {
    name: "Duba Mevkii Plajı",
    nameEn: "Duba Beach Area",
    description:
      "Alibey Adası yolu üzerinde bulunan doğal plaj alanı. Ayvalık'ın sakin ve doğal koylarından biridir.",
    descriptionEn:
      "Natural beach area on the road to Alibey Island. One of the quiet, natural coves of Ayvalık.",
    shortDesc: "Cunda yolu üzeri doğal plaj",
    shortDescEn: "Natural beach on Cunda road",
    lat: 39.31,
    lng: 26.67,
    categoryId: CAT.beach,
    address: "Duba Mevkii, Ayvalık, Balıkesir",
    addressEn: "Duba Area, Ayvalık, Balıkesir",
  },
  {
    name: "Gömeç Artur Koyları",
    nameEn: "Gömeç Artur Coves",
    description:
      "Gömeç ilçesi Artur mevkiinde bulunan Güvercin, Martı ve Gemi Yatağı Koyları. Doğal güzellikleriyle görülmeye değer sahil alanları.",
    descriptionEn:
      "Güvercin, Martı and Gemi Yatağı Coves in Artur area of Gömeç. Coastal areas worth visiting for their natural beauty.",
    shortDesc: "Güvercin, Martı, Gemi Yatağı koyları",
    shortDescEn: "Güvercin, Martı, Gemi Yatağı coves",
    lat: 39.22,
    lng: 26.78,
    categoryId: CAT.beach,
    address: "Artur Mevkii, Gömeç, Balıkesir",
    addressEn: "Artur Area, Gömeç, Balıkesir",
  },

  // ═══════════════════════════════════════════════
  // DİNİ YAPILAR / CAMİLER (18) - BALK.TXT
  // ═══════════════════════════════════════════════
  {
    name: "Alaca Mescit Camisi",
    nameEn: "Alaca Mescit Mosque",
    description:
      "Kitabesi günümüze ulaşamadığından yapım tarihi ve banisi belli değildir. Son onarımını 1911'de geçirmiştir. Tarihi yönden önemli olan camide Balıkesir'deki Kuvay-i Milliye Hareketi'nin ilk kararları alınmıştır (1919).",
    descriptionEn:
      "Construction date and patron unknown as inscription has not survived. Last restored in 1911. Historically significant as the first decisions of the Kuvay-i Milliye Movement in Balıkesir were made here (1919).",
    shortDesc: "Kuvay-i Milliye kararlarının alındığı tarihi cami",
    shortDescEn: "Historic mosque where Kuvay-i Milliye decisions were made",
    lat: 39.6486,
    lng: 27.8826,
    categoryId: CAT.religious,
    address: "Balıkesir Merkez",
    addressEn: "Balıkesir Center",
  },
  {
    name: "Tahtalı Cami",
    nameEn: "Tahtalı Mosque",
    description:
      "Dinkçiler Mahallesi'ndeki cami, 1452 yılında yapılmıştır. Günümüze bu ilk yapıdan yalnızca minaresi gelebilmiştir. 1513 depreminde yıkılmış ve sonra yenilenmiştir. Dikdörtgen planlı bir yapıdır.",
    descriptionEn:
      "Built in 1452 in Dinkçiler Quarter. Only the minaret survives from the original structure. Destroyed in the 1513 earthquake and later rebuilt. Rectangular plan.",
    shortDesc: "1452 tarihli, orijinal minaresi korunmuş",
    shortDescEn: "Dated 1452, original minaret preserved",
    lat: 39.649,
    lng: 27.883,
    categoryId: CAT.religious,
    address: "Dinkçiler Mahallesi, Balıkesir Merkez",
    addressEn: "Dinkçiler Quarter, Balıkesir Center",
  },
  {
    name: "Kasaplar Camisi",
    nameEn: "Kasaplar Mosque",
    description:
      "Kasaplar Mahallesi'nde bulunmaktadır. Kitabesine göre 1649 yılında yapılmış, depremlerden zarar görmüş, 1811, 1894 ve 1901 yıllarında onarılmıştır. Kare planlı küçük bir cami olup, zemindeki klasik tuğla döşemeler ilk yapıldığı dönemden kalmıştır.",
    descriptionEn:
      "Located in Kasaplar Quarter. Built in 1649 according to inscription, damaged by earthquakes, restored in 1811, 1894 and 1901. Small square-plan mosque with original classic brick flooring.",
    shortDesc: "1649 tarihli, orijinal tuğla döşemeli",
    shortDescEn: "Dated 1649, original brick flooring",
    lat: 39.648,
    lng: 27.8835,
    categoryId: CAT.religious,
    address: "Kasaplar Mahallesi, Balıkesir Merkez",
    addressEn: "Kasaplar Quarter, Balıkesir Center",
  },
  {
    name: "Şeyh Lütfullah Camisi",
    nameEn: "Şeyh Lütfullah Mosque",
    description:
      "Lütfullah Mahallesi'nde yer almaktadır. 1429'da yapılmıştır. Hacı Bayram-ı Veli'nin arkadaşlarından Şeyh Lütfullah tarafından yaptırıldığı sanılmaktadır. 1907'de yenilenmiştir. Dikdörtgen planlı kesme taş yapı.",
    descriptionEn:
      "Located in Lütfullah Quarter. Built in 1429, believed to be commissioned by Şeyh Lütfullah, a companion of Hacı Bayram-ı Veli. Renovated in 1907. Rectangular cut-stone structure.",
    shortDesc: "1429 tarihli, Hacı Bayram-ı Veli dönemi",
    shortDescEn: "Dated 1429, Hacı Bayram-ı Veli era",
    lat: 39.6495,
    lng: 27.884,
    categoryId: CAT.religious,
    address: "Lütfullah Mahallesi, Balıkesir Merkez",
    addressEn: "Lütfullah Quarter, Balıkesir Center",
  },
  {
    name: "Omurbey (Umurbey) Camisi",
    nameEn: "Omurbey (Umurbey) Mosque",
    description:
      "Omurbey Mahallesi'ndedir. Hacı Omur Bey tarafından 1413'te yaptırılmış, 1635 ve 1925'te iki büyük onarım geçirmiştir. Son cemaat yeri olmayan cami kesme taş ve tuğladan yapılmıştır.",
    descriptionEn:
      "In Omurbey Quarter. Built by Hacı Omur Bey in 1413, underwent major restorations in 1635 and 1925. Cut stone and brick mosque without a narthex.",
    shortDesc: "1413 tarihli, erken Osmanlı dönemi",
    shortDescEn: "Dated 1413, early Ottoman period",
    lat: 39.6475,
    lng: 27.882,
    categoryId: CAT.religious,
    address: "Omurbey Mahallesi, Balıkesir Merkez",
    addressEn: "Omurbey Quarter, Balıkesir Center",
  },
  {
    name: "İbrahimbey Camisi (Hacı Arifağa Camisi)",
    nameEn: "İbrahimbey Mosque (Hacı Arifağa Mosque)",
    description:
      "Hisar İçi Mahallesi'nde Alaca Sokak'tadır. 1465'te Zağnos Paşa'nın oğlu Mehmet Çelebi tarafından yaptırılmıştır. 1739'da İbrahim Bey tarafından yenilenmiş, 1899'da Hacı Arif Ağa tarafından onarılmıştır. Avlu girişinde ampir üslubunda güzel bezemeli taş kapısı bulunmaktadır.",
    descriptionEn:
      "On Alaca Street in Hisar İçi Quarter. Built in 1465 by Mehmet Çelebi, son of Zağnos Paşa. Renewed by İbrahim Bey in 1739, restored by Hacı Arif Ağa in 1899. Features a beautifully decorated Empire-style stone gate.",
    shortDesc: "1465 tarihli, ampir üslup taş kapı",
    shortDescEn: "Dated 1465, Empire-style stone gate",
    lat: 39.6488,
    lng: 27.8815,
    categoryId: CAT.religious,
    address: "Hisar İçi Mahallesi, Balıkesir Merkez",
    addressEn: "Hisar İçi Quarter, Balıkesir Center",
  },
  {
    name: "Yeşilli Cami (Hisariçi Camisi)",
    nameEn: "Yeşilli Mosque (Hisariçi Mosque)",
    description:
      "Eski Kuyumcular Mahallesi'ndeki cami, 1786'da onarıldığı bilinmektedir. Dikdörtgen planlı, ahşap çatılı küçük bir yapıdır. Yeşil renge boyandığından Yeşilli Cami ismiyle tanınır. Minaresinin altında mukarnas dizileri dikkati çeker.",
    descriptionEn:
      "In Eski Kuyumcular Quarter, known to have been restored in 1786. Small rectangular wooden-roofed structure. Known as Green Mosque due to its green paint. Notable muqarnas rows beneath the minaret.",
    shortDesc: "Yeşil boyalı tarihi cami, mukarnas minareli",
    shortDescEn: "Green-painted historic mosque, muqarnas minaret",
    lat: 39.6492,
    lng: 27.881,
    categoryId: CAT.religious,
    address: "Eski Kuyumcular Mahallesi, Balıkesir Merkez",
    addressEn: "Eski Kuyumcular Quarter, Balıkesir Center",
  },
  {
    name: "Hakkı Çavuş Camisi",
    nameEn: "Hakkı Çavuş Mosque",
    description:
      "1352 tarihinde yapılmıştır. Balıkesir'in en eski camilerinden biridir. Günümüze orijinal durumda ulaşamamıştır.",
    descriptionEn:
      "Built in 1352. One of the oldest mosques in Balıkesir. Has not survived in its original condition.",
    shortDesc: "1352 tarihli, Balıkesir'in en eski camilerinden",
    shortDescEn: "Dated 1352, one of Balıkesir's oldest mosques",
    lat: 39.6485,
    lng: 27.8845,
    categoryId: CAT.religious,
    address: "Balıkesir Merkez",
    addressEn: "Balıkesir Center",
  },
  {
    name: "Hacı Ali (Alibey) Camisi",
    nameEn: "Hacı Ali (Alibey) Mosque",
    description:
      "1319'da yapılmış, 1952'de onarım görmüştür. Balıkesir'in en eski ibadethanelerinden biridir.",
    descriptionEn:
      "Built in 1319, restored in 1952. One of the oldest places of worship in Balıkesir.",
    shortDesc: "1319 tarihli, Balıkesir'in en eski camisi",
    shortDescEn: "Dated 1319, Balıkesir's oldest mosque",
    lat: 39.6483,
    lng: 27.885,
    categoryId: CAT.religious,
    address: "Balıkesir Merkez",
    addressEn: "Balıkesir Center",
  },
  {
    name: "Karaoğlan Camisi",
    nameEn: "Karaoğlan Mosque",
    description:
      "Karaoğlan Mahallesi'ndedir. Gazi Süleyman Paşa ile Rumeli'ye geçen Karaoğlan isimli birinin 1356'da yaptırdığı söylenmektedir. Bugünkü yapı 1908 yıllarına aittir.",
    descriptionEn:
      "In Karaoğlan Quarter. Said to have been built in 1356 by someone named Karaoğlan who crossed to Rumelia with Gazi Süleyman Paşa. Current structure dates to 1908.",
    shortDesc: "1356 tarihli, Rumeli gazisi eseri",
    shortDescEn: "Dated 1356, built by Rumelia veteran",
    lat: 39.6478,
    lng: 27.8855,
    categoryId: CAT.religious,
    address: "Karaoğlan Mahallesi, Balıkesir Merkez",
    addressEn: "Karaoğlan Quarter, Balıkesir Center",
  },
  {
    name: "Oruç Bey Mescidi",
    nameEn: "Oruç Bey Masjid",
    description:
      "Kayabey Mahallesi'ndedir. Rumeli'ye geçen Osmanlı komutanlarından Oruç Bey adına 1471 yılında yapılmıştır. Çeşitli onarımlarla özgün biçimini kaybetmiştir.",
    descriptionEn:
      "In Kayabey Quarter. Built in 1471 in the name of Ottoman commander Oruç Bey who crossed to Rumelia. Has lost its original form through various restorations.",
    shortDesc: "1471 tarihli, Osmanlı komutanı eseri",
    shortDescEn: "Dated 1471, Ottoman commander's work",
    lat: 39.647,
    lng: 27.886,
    categoryId: CAT.religious,
    address: "Kayabey Mahallesi, Balıkesir Merkez",
    addressEn: "Kayabey Quarter, Balıkesir Center",
  },
  {
    name: "Saatli Kilise Camisi (Ayvalık)",
    nameEn: "Clock Church Mosque (Ayvalık)",
    description:
      "İsmet Paşa Mahallesi'ndedir. XIX. yüzyılın ikinci yarısında yerli Rumlar tarafından kilise olarak yapılmış, 1928'den sonra camiye dönüştürülmüştür. Haç düzeninde plan, orta bölüm kubbe ile örtülüdür. Çan kulesi saat kulesine dönüştürülmüştür.",
    descriptionEn:
      "In İsmet Paşa Quarter. Built as a church by local Greeks in the second half of the 19th century, converted to mosque after 1928. Cross-plan with central dome. Bell tower converted to clock tower.",
    shortDesc: "Kiliseden camiye dönüştürülmüş, saat kuleli",
    shortDescEn: "Church converted to mosque, with clock tower",
    lat: 39.3125,
    lng: 26.6935,
    categoryId: CAT.religious,
    isFeatured: true,
    address: "İsmet Paşa Mahallesi, Ayvalık, Balıkesir",
    addressEn: "İsmet Paşa Quarter, Ayvalık, Balıkesir",
  },
  {
    name: "AliBey (Çınarlı) Camisi (Ayvalık)",
    nameEn: "AliBey (Çınarlı) Mosque (Ayvalık)",
    description:
      "Hamdi Bey Mahallesi'ndedir. XIX. yüzyılda yerli Rumlar tarafından kilise olarak yapılmış, Cumhuriyetin ilk yıllarında camiye çevrilmiştir. Haç planlı, kompozit başlıklı kalın sütunlar dikkati çeker.",
    descriptionEn:
      "In Hamdi Bey Quarter. Built as a church by local Greeks in the 19th century, converted to mosque in early Republic years. Cross-plan with notable thick composite-capital columns.",
    shortDesc: "Kiliseden cami, kompozit sütunlu",
    shortDescEn: "Church to mosque, composite columns",
    lat: 39.313,
    lng: 26.694,
    categoryId: CAT.religious,
    address: "Hamdi Bey Mahallesi, Ayvalık, Balıkesir",
    addressEn: "Hamdi Bey Quarter, Ayvalık, Balıkesir",
  },
  {
    name: "Yeni Cami (Ayvalık)",
    nameEn: "Yeni Mosque (Ayvalık)",
    description:
      "Hayrettin Paşa Mahallesi'ndedir. XVIII. yüzyılın ikinci yarısında yapılmış, kiliseden camiye çevrilmiştir. Çan kulesinin kaidesi günümüze gelebilmiştir.",
    descriptionEn:
      "In Hayrettin Paşa Quarter. Built in the second half of the 18th century, converted from church to mosque. The base of the bell tower has survived.",
    shortDesc: "18. yy kiliseden dönüşüm",
    shortDescEn: "18th century church conversion",
    lat: 39.3135,
    lng: 26.693,
    categoryId: CAT.religious,
    address: "Hayrettin Paşa Mahallesi, Ayvalık, Balıkesir",
    addressEn: "Hayrettin Paşa Quarter, Ayvalık, Balıkesir",
  },
  {
    name: "Biberli Cami (Ayvalık)",
    nameEn: "Biberli Mosque (Ayvalık)",
    description:
      "Kasım Paşa Mahallesi'nde, Altunova Caddesi'ndedir. XIX. yüzyılda yapılmış bir kiliseden camiye çevrilmiştir. Haç planlı yapının girişindeki altı sütun dikkati çeker.",
    descriptionEn:
      "On Altunova Street in Kasım Paşa Quarter. 19th century church converted to mosque. Notable six columns at the entrance of this cross-plan structure.",
    shortDesc: "Altı sütunlu giriş, kiliseden dönüşüm",
    shortDescEn: "Six-column entrance, church conversion",
    lat: 39.312,
    lng: 26.6945,
    categoryId: CAT.religious,
    address: "Kasım Paşa Mahallesi, Ayvalık, Balıkesir",
    addressEn: "Kasım Paşa Quarter, Ayvalık, Balıkesir",
  },
  {
    name: "Hamidiye Camisi (Ayvalık)",
    nameEn: "Hamidiye Mosque (Ayvalık)",
    description:
      "Sakarya Mahallesi'ndedir. Ayvalık'ta cami olarak yapılmış tek özgün yapıdır. XIX. yüzyılın ikinci yarısında Sultan II. Abdülhamid tarafından eklektik üslupta yaptırılmıştır. Kırmızı kesme taştan, tek kubbeli.",
    descriptionEn:
      "In Sakarya Quarter. The only original mosque built as a mosque in Ayvalık. Commissioned by Sultan Abdülhamid II in eclectic style in the second half of the 19th century. Red cut stone, single dome.",
    shortDesc: "Ayvalık'ın tek özgün camisi, Sultan II. Abdülhamid eseri",
    shortDescEn: "Ayvalık's only original mosque, Sultan Abdülhamid II",
    lat: 39.3115,
    lng: 26.695,
    categoryId: CAT.religious,
    address: "Sakarya Mahallesi, Ayvalık, Balıkesir",
    addressEn: "Sakarya Quarter, Ayvalık, Balıkesir",
  },
  {
    name: "Hacı Bayram Camisi (Ayvalık)",
    nameEn: "Hacı Bayram Mosque (Ayvalık)",
    description:
      "Ayvalık'ın Altınova bucak merkezindedir. 1490-1491 yılında yapıldığı öğrenilmiştir. Kare planlı, kaba yontma taş ve tuğla kullanılmıştır. İki sıra taşı üç sıra tuğla tamamlamıştır.",
    descriptionEn:
      "In Altınova center of Ayvalık. Built in 1490-1491. Square plan, rough-hewn stone and brick construction. Two rows of stone completed by three rows of brick.",
    shortDesc: "1490 tarihli, taş-tuğla karışık yapı",
    shortDescEn: "Dated 1490, mixed stone-brick construction",
    lat: 39.371,
    lng: 26.672,
    categoryId: CAT.religious,
    address: "Altınova, Ayvalık, Balıkesir",
    addressEn: "Altınova, Ayvalık, Balıkesir",
  },
  {
    name: "Kadı Camii (Ayvalık)",
    nameEn: "Kadı Mosque (Ayvalık)",
    description:
      "Ayvalık Altınova Bucağında bulunan Kadı Camisi'nin kitabesi günümüze gelememiştir. Küçük Cami olarak da isimlendirilen yapı 9.80x9.80 m ölçüsünde kare planlı olup, sekizgen kasnağın taşıdığı bir kubbe ile örtülmüştür.",
    descriptionEn:
      "In Altınova, Ayvalık. Inscription has not survived. Also known as Small Mosque, 9.80x9.80m square plan covered by a dome on octagonal drum.",
    shortDesc: "Küçük kubbeli kare cami",
    shortDescEn: "Small domed square mosque",
    lat: 39.3715,
    lng: 26.6725,
    categoryId: CAT.religious,
    address: "Altınova, Ayvalık, Balıkesir",
    addressEn: "Altınova, Ayvalık, Balıkesir",
  },

  // ═══════════════════════════════════════════════
  // DOĞAL ALANLAR - KTB Kaynaklı (20+)
  // ═══════════════════════════════════════════════
  {
    name: "Babakaya Kalesi (Gönen)",
    nameEn: "Babakaya Castle (Gönen)",
    description:
      "Gönen çevresinde, yüksek bir kayalık üzerinde yer alan tarihi kale kalıntılarıdır. Çevresindeki doğal güzellik ve panoramik manzarasıyla hem tarih hem doğa meraklılarının ilgisini çekmektedir.",
    descriptionEn:
      "Historic castle ruins on a high rock near Gönen. Attracts both history and nature enthusiasts with its surrounding natural beauty and panoramic views.",
    shortDesc: "Kayalık üzeri tarihi kale, panoramik manzara",
    shortDescEn: "Hilltop historic castle, panoramic views",
    lat: 40.08,
    lng: 27.68,
    categoryId: CAT.nature,
    address: "Gönen, Balıkesir",
    addressEn: "Gönen, Balıkesir",
  },
  {
    name: "Eybek Kulesi (Havran)",
    nameEn: "Eybek Tower (Havran)",
    description:
      "Havran'da, Eybek Dağı üzerinde yer alan tarihi bir gözetleme kulesidir. Tepeden çevrenin panoramik manzarası görülebilir. Doğa yürüyüşü rotaları üzerinde yer almaktadır.",
    descriptionEn:
      "A historic watchtower on Eybek Mountain in Havran. Panoramic views of the surroundings from the top. Located on nature hiking routes.",
    shortDesc: "Eybek Dağı gözetleme kulesi",
    shortDescEn: "Eybek Mountain watchtower",
    lat: 39.55,
    lng: 27.1,
    categoryId: CAT.nature,
    address: "Eybek Dağı, Havran, Balıkesir",
    addressEn: "Eybek Mountain, Havran, Balıkesir",
  },
  {
    name: "Havutçu Yaylası (İvrindi)",
    nameEn: "Havutçu Plateau (İvrindi)",
    description:
      "İvrindi'nin yüksek kesimlerinde yer alan bir yayla mesire alanıdır. Serin havası, doğal güzellikleri ve yaylacılık geleneğiyle dikkat çeker. Yaz aylarında piknik ve doğa yürüyüşü için tercih edilmektedir.",
    descriptionEn:
      "A highland recreation area in the upper elevations of İvrindi. Notable for its cool climate, natural beauty and pastoral traditions. Popular for picnics and nature walks in summer.",
    shortDesc: "Serin yayla, doğa yürüyüşü",
    shortDescEn: "Cool highland, nature walks",
    lat: 39.6,
    lng: 27.5,
    categoryId: CAT.nature,
    address: "Havutçu Yaylası, İvrindi, Balıkesir",
    addressEn: "Havutçu Plateau, İvrindi, Balıkesir",
  },
  {
    name: "Kocakatran Ormanları (İvrindi)",
    nameEn: "Kocakatran Forests (İvrindi)",
    description:
      "İvrindi çevresinde, geniş bir alanı kaplayan doğal ormanlardır. Çeşitli ağaç türleri ve zengin bitki örtüsüyle doğa turizmi açısından önemli bir potansiyele sahiptir.",
    descriptionEn:
      "Natural forests covering a large area around İvrindi. Significant potential for nature tourism with diverse tree species and rich vegetation.",
    shortDesc: "Geniş doğal orman alanı",
    shortDescEn: "Vast natural forest area",
    lat: 39.58,
    lng: 27.48,
    categoryId: CAT.nature,
    address: "İvrindi, Balıkesir",
    addressEn: "İvrindi, Balıkesir",
  },
  {
    name: "Simav Çayı Vadisi (Sındırgı)",
    nameEn: "Simav River Valley (Sındırgı)",
    description:
      "Sındırgı'dan geçen Simav Çayı'nın oluşturduğu doğal vadidir. Yeşil bitki örtüsü, akan su ve çevresindeki doğal güzelliklerle yürüyüş ve piknik için uygundur.",
    descriptionEn:
      "Natural valley formed by the Simav River passing through Sındırgı. Suitable for hiking and picnics with green vegetation, flowing water and surrounding natural beauty.",
    shortDesc: "Nehir vadisi, yürüyüş ve piknik",
    shortDescEn: "River valley, hiking and picnics",
    lat: 39.25,
    lng: 28.18,
    categoryId: CAT.nature,
    address: "Sındırgı, Balıkesir",
    addressEn: "Sındırgı, Balıkesir",
  },
  {
    name: "Manyas Gölü",
    nameEn: "Manyas Lake",
    description:
      "Türkiye'nin önemli tatlı su göllerinden biridir. Balıkçılık, kuş gözlemi ve doğa fotoğrafçılığı için ideal bir ortam sunar. Göl çevresindeki sazlıklar ve sulak alanlar zengin bir ekosisteme ev sahipliği yapmaktadır.",
    descriptionEn:
      "One of Turkey's important freshwater lakes. Ideal for fishing, birdwatching and nature photography. Surrounding reed beds and wetlands host a rich ecosystem.",
    shortDesc: "Tatlı su gölü, kuş gözlemi",
    shortDescEn: "Freshwater lake, birdwatching",
    lat: 40.2,
    lng: 28.0,
    categoryId: CAT.nature,
    isFeatured: true,
    address: "Manyas, Balıkesir",
    addressEn: "Manyas, Balıkesir",
  },
  {
    name: "Mermer Ocakları (Marmara Adası)",
    nameEn: "Marble Quarries (Marmara Island)",
    description:
      "Marmara Adası, adını verdiği mermer ile ünlüdür. Antik çağlardan beri işletilen mermer ocakları, hem tarihi hem de jeolojik açıdan ilgi çekicidir. Beyaz mermerin çıkarıldığı ocaklar ziyaret edilebilir.",
    descriptionEn:
      "Marmara Island is famous for the marble that gave it its name. Quarries operated since antiquity are interesting both historically and geologically. White marble quarries can be visited.",
    shortDesc: "Antik mermer ocakları, jeolojik miras",
    shortDescEn: "Ancient marble quarries, geological heritage",
    lat: 40.62,
    lng: 27.58,
    categoryId: CAT.nature,
    address: "Marmara Adası, Balıkesir",
    addressEn: "Marmara Island, Balıkesir",
  },
  {
    name: "Ilıca Plajı (Erdek)",
    nameEn: "Ilıca Beach (Erdek)",
    description:
      "Erdek çevresinde, ılık su kaynaklarının denize karıştığı noktada yer alan bir plajdır. Doğal sıcak su ve denizin birleşimi benzersiz bir deneyim sunar.",
    descriptionEn:
      "A beach near Erdek where warm water springs meet the sea. The combination of natural hot water and sea offers a unique experience.",
    shortDesc: "Sıcak su kaynağı ve deniz buluşması",
    shortDescEn: "Hot spring meets the sea",
    lat: 40.4,
    lng: 27.78,
    categoryId: CAT.beach,
    address: "Erdek, Balıkesir",
    addressEn: "Erdek, Balıkesir",
  },
  {
    name: "Çınarlı Köyü (Marmara Adası)",
    nameEn: "Çınarlı Village (Marmara Island)",
    description:
      "Marmara Adası'nda, yaşlı çınar ağaçları ve geleneksel köy dokusuyla bilinen bir yerleşimdir. Sakin atmosferi ve doğal güzelliğiyle adanın en çekici köylerinden biridir.",
    descriptionEn:
      "A settlement on Marmara Island known for its old plane trees and traditional village texture. One of the most attractive villages on the island with its calm atmosphere and natural beauty.",
    shortDesc: "Çınar ağaçlı geleneksel ada köyü",
    shortDescEn: "Traditional island village with plane trees",
    lat: 40.63,
    lng: 27.6,
    categoryId: CAT.nature,
    address: "Çınarlı Köyü, Marmara Adası, Balıkesir",
    addressEn: "Çınarlı Village, Marmara Island, Balıkesir",
  },
  {
    name: "Saraylar Köyü (Marmara Adası)",
    nameEn: "Saraylar Village (Marmara Island)",
    description:
      "Marmara Adası'nın en büyük yerleşim yerlerinden biridir. Tarihi yapıları, sahili ve balıkçı kültürüyle dikkat çeker. Adaya gelen ziyaretçilerin konaklama ve yeme-içme ihtiyaçlarını karşılayan ana merkezdir.",
    descriptionEn:
      "One of the largest settlements on Marmara Island. Notable for its historic buildings, beach and fishing culture. Main center for accommodation and dining for island visitors.",
    shortDesc: "Adanın ana merkezi, tarihi balıkçı köyü",
    shortDescEn: "Island's main center, historic fishing village",
    lat: 40.61,
    lng: 27.55,
    categoryId: CAT.nature,
    address: "Saraylar Köyü, Marmara Adası, Balıkesir",
    addressEn: "Saraylar Village, Marmara Island, Balıkesir",
  },
  {
    name: "Zeytinli (Edremit)",
    nameEn: "Zeytinli (Edremit)",
    description:
      "Edremit'e bağlı tarihi bir beldedir. Rum mimarisi kalıntıları, taş evleri, zeytinlikleri ve sakin atmosferiyle dikkat çeker. Kaz Dağları'na yapılan trekking rotalarının başlangıç noktalarından biridir.",
    descriptionEn:
      "A historic town connected to Edremit. Notable for Greek architectural remnants, stone houses, olive groves and calm atmosphere. One of the starting points for Kaz Mountains trekking routes.",
    shortDesc: "Tarihi taş evler, trekking başlangıcı",
    shortDescEn: "Historic stone houses, trekking start",
    lat: 39.6,
    lng: 26.85,
    categoryId: CAT.nature,
    address: "Zeytinli, Edremit, Balıkesir",
    addressEn: "Zeytinli, Edremit, Balıkesir",
  },
  {
    name: "Zeytinli Altınkum Plajı",
    nameEn: "Zeytinli Altınkum Beach",
    description:
      "Zeytinli beldesine yakın, altın sarısı kumuyla ünlü bir plajdır. Berrak denizi ve doğal çevresiyle yaz aylarında tercih edilen bir sahildir.",
    descriptionEn:
      "A beach near Zeytinli town, famous for its golden sand. A preferred shore in summer with its clear sea and natural surroundings.",
    shortDesc: "Altın sarısı kumlu sahil",
    shortDescEn: "Golden sand beach",
    lat: 39.58,
    lng: 26.82,
    categoryId: CAT.beach,
    address: "Zeytinli, Edremit, Balıkesir",
    addressEn: "Zeytinli, Edremit, Balıkesir",
  },
  {
    name: "Altınoluk Sahili",
    nameEn: "Altınoluk Coast",
    description:
      "Edremit Körfezi'nin batı ucunda yer alan sahil beldesidir. Berrak denizi, zeytinlikleri ve Kaz Dağları eteklerindeki konumuyla ünlüdür. Yaz turizmi açısından bölgenin en popüler noktalarından biridir.",
    descriptionEn:
      "Coastal town at the western end of Edremit Gulf. Famous for its clear sea, olive groves and location at the foot of Kaz Mountains. One of the most popular summer tourism spots.",
    shortDesc: "Kaz Dağları eteklerinde sahil beldesi",
    shortDescEn: "Coastal town at Kaz Mountains foot",
    lat: 39.57,
    lng: 26.73,
    categoryId: CAT.beach,
    isFeatured: true,
    address: "Altınoluk, Edremit, Balıkesir",
    addressEn: "Altınoluk, Edremit, Balıkesir",
  },
  {
    name: "Güre Sahili",
    nameEn: "Güre Coast",
    description:
      "Körfezin bakir bozulmayan doğası içindeki tertemiz denizi Güre'yi en önemli tercih sebebi yapıyor. Tarih, doğa ve sağlığın buluştuğu cennet.",
    descriptionEn:
      "The pristine sea within the unspoiled nature of the gulf makes Güre a top choice. A paradise where history, nature and health meet.",
    shortDesc: "Bakir doğa, tertemiz deniz",
    shortDescEn: "Pristine nature, crystal clear sea",
    lat: 39.6,
    lng: 26.88,
    categoryId: CAT.beach,
    address: "Güre, Edremit, Balıkesir",
    addressEn: "Güre, Edremit, Balıkesir",
  },
  // ═══════════════════════════════════════════════
  // DURSUNBEY EKSİK LOKASYONLAR (6) - KTB
  // ═══════════════════════════════════════════════
  {
    name: "Yayla Mesire Alanı (Dursunbey)",
    nameEn: "Highland Recreation Area (Dursunbey)",
    description:
      "Dursunbey'in yüksek kesimlerinde yer alan yayla mesire alanıdır. Serin havası ve doğal güzelliğiyle yaz aylarında tercih edilmektedir.",
    descriptionEn:
      "Highland recreation area in the upper elevations of Dursunbey. Popular in summer for its cool climate and natural beauty.",
    shortDesc: "Serin yayla, doğa dinlenmesi",
    shortDescEn: "Cool highland, nature relaxation",
    lat: 39.58,
    lng: 28.62,
    categoryId: CAT.nature,
    address: "Dursunbey, Balıkesir",
    addressEn: "Dursunbey, Balıkesir",
  },
  {
    name: "Değirmenek (Dursunbey)",
    nameEn: "Değirmenek (Dursunbey)",
    description:
      "Dursunbey çevresinde, değirmen kalıntıları ve doğal su kaynakları ile bilinen bir mesire alanıdır.",
    descriptionEn:
      "A recreation area near Dursunbey known for its mill remnants and natural water sources.",
    shortDesc: "Değirmen kalıntılı mesire alanı",
    shortDescEn: "Recreation area with mill remnants",
    lat: 39.56,
    lng: 28.58,
    categoryId: CAT.nature,
    address: "Değirmenek, Dursunbey, Balıkesir",
    addressEn: "Değirmenek, Dursunbey, Balıkesir",
  },
  {
    name: "Alaçam (Dursunbey)",
    nameEn: "Alaçam (Dursunbey)",
    description:
      "Dursunbey'e bağlı, yüksek rakımlı bir orman alanıdır. Doğa yürüyüşü ve piknik için uygundur.",
    descriptionEn:
      "A high-altitude forest area connected to Dursunbey. Suitable for nature walks and picnics.",
    shortDesc: "Yüksek rakımlı orman alanı",
    shortDescEn: "High-altitude forest area",
    lat: 39.52,
    lng: 28.55,
    categoryId: CAT.nature,
    address: "Alaçam, Dursunbey, Balıkesir",
    addressEn: "Alaçam, Dursunbey, Balıkesir",
  },
  {
    name: "Candere (Dursunbey)",
    nameEn: "Candere (Dursunbey)",
    description:
      "Dursunbey bölgesinde, dere kenarında yer alan doğal bir dinlenme ve piknik alanıdır.",
    descriptionEn:
      "A natural resting and picnic area by the creek in the Dursunbey region.",
    shortDesc: "Dere kenarı doğal piknik alanı",
    shortDescEn: "Creekside natural picnic area",
    lat: 39.54,
    lng: 28.56,
    categoryId: CAT.nature,
    address: "Candere, Dursunbey, Balıkesir",
    addressEn: "Candere, Dursunbey, Balıkesir",
  },
  {
    name: "Gölcük (Dursunbey)",
    nameEn: "Gölcük (Dursunbey)",
    description:
      "Dursunbey çevresinde bulunan küçük bir göl ve çevresindeki mesire alanıdır. Doğal güzelliği ve sakin ortamıyla dikkat çeker.",
    descriptionEn:
      "A small lake and surrounding recreation area near Dursunbey. Notable for its natural beauty and calm atmosphere.",
    shortDesc: "Küçük göl ve mesire alanı",
    shortDescEn: "Small lake and recreation area",
    lat: 39.5,
    lng: 28.6,
    categoryId: CAT.nature,
    address: "Gölcük, Dursunbey, Balıkesir",
    addressEn: "Gölcük, Dursunbey, Balıkesir",
  },
  {
    name: "Faruk Şeker Tesisleri (Dursunbey)",
    nameEn: "Faruk Şeker Facilities (Dursunbey)",
    description:
      "Dursunbey'de bulunan, çevresindeki doğal alanlarla birlikte ziyaret edilebilen bir tesistir.",
    descriptionEn:
      "A facility in Dursunbey that can be visited along with its surrounding natural areas.",
    shortDesc: "Doğa içi tesis ve mesire",
    shortDescEn: "Facility amid nature",
    lat: 39.57,
    lng: 28.63,
    categoryId: CAT.nature,
    address: "Dursunbey, Balıkesir",
    addressEn: "Dursunbey, Balıkesir",
  },

  // ═══════════════════════════════════════════════
  // KEPSUT, SUSURLUK, SINDIRGI EKSİK (5) - KTB
  // ═══════════════════════════════════════════════
  {
    name: "Emir Sultan Türbesi (Kepsut)",
    nameEn: "Emir Sultan Tomb (Kepsut)",
    description:
      "Kepsut ilçesinde bulunan tarihi türbe ve çevresindeki doğal alandır. Hem dini ziyaret hem de doğal güzellik açısından ziyaretçi çekmektedir.",
    descriptionEn:
      "Historic tomb and surrounding natural area in Kepsut. Attracts visitors for both religious pilgrimage and natural beauty.",
    shortDesc: "Tarihi türbe, doğal çevre",
    shortDescEn: "Historic tomb, natural surroundings",
    lat: 39.68,
    lng: 28.1,
    categoryId: CAT.religious,
    address: "Kepsut, Balıkesir",
    addressEn: "Kepsut, Balıkesir",
  },
  {
    name: "Çamlık Mesire Alanı (Kepsut)",
    nameEn: "Çamlık Recreation Area (Kepsut)",
    description:
      "Kepsut'ta, çam ağaçlarıyla kaplı bir mesire ve piknik alanıdır. Doğal ortamı ve temiz havasıyla dinlenme için idealdir.",
    descriptionEn:
      "A recreation and picnic area covered with pine trees in Kepsut. Ideal for relaxation with its natural environment and clean air.",
    shortDesc: "Çam ormanı mesire alanı",
    shortDescEn: "Pine forest recreation area",
    lat: 39.7,
    lng: 28.12,
    categoryId: CAT.nature,
    address: "Kepsut, Balıkesir",
    addressEn: "Kepsut, Balıkesir",
  },
  {
    name: "Babasultan Türbesi (Susurluk)",
    nameEn: "Babasultan Tomb (Susurluk)",
    description:
      "Susurluk'ta bulunan tarihi türbe ve çevresindeki doğal alandır. Dini ziyaret ve doğal güzellik bir arada sunulmaktadır.",
    descriptionEn:
      "Historic tomb and surrounding natural area in Susurluk. Offers both religious pilgrimage and natural beauty.",
    shortDesc: "Tarihi türbe, doğal alan",
    shortDescEn: "Historic tomb, natural area",
    lat: 39.92,
    lng: 28.16,
    categoryId: CAT.religious,
    address: "Susurluk, Balıkesir",
    addressEn: "Susurluk, Balıkesir",
  },
  {
    name: "Susurluk Ayranı ve Çarşı",
    nameEn: "Susurluk Ayran and Bazaar",
    description:
      "Susurluk, Türkiye genelinde meşhur ayranıyla bilinmektedir. İlçe merkezindeki ayran dükkanları ve geleneksel çarşısı gastronomi turizmi açısından ziyaret edilmeye değerdir.",
    descriptionEn:
      "Susurluk is known nationwide for its famous ayran (yogurt drink). The ayran shops and traditional bazaar in the town center are worth visiting for gastronomy tourism.",
    shortDesc: "Meşhur Susurluk ayranı, geleneksel çarşı",
    shortDescEn: "Famous Susurluk ayran, traditional bazaar",
    lat: 39.91,
    lng: 28.15,
    categoryId: CAT.gastronomy,
    isFeatured: true,
    address: "Susurluk Merkez, Balıkesir",
    addressEn: "Susurluk Center, Balıkesir",
  },
  {
    name: "Sındırgı Yaylaları",
    nameEn: "Sındırgı Highlands",
    description:
      "Sındırgı ilçesinin yüksek kesimlerinde yer alan yaylalardır. Serin havası, doğal güzellikleri ve geleneksel yayla kültürüyle yaz aylarında tercih edilen mesire alanlarıdır.",
    descriptionEn:
      "Highlands in the upper elevations of Sındırgı district. Recreation areas popular in summer for their cool climate, natural beauty and traditional highland culture.",
    shortDesc: "Serin yaylalar, geleneksel kültür",
    shortDescEn: "Cool highlands, traditional culture",
    lat: 39.22,
    lng: 28.2,
    categoryId: CAT.nature,
    address: "Sındırgı, Balıkesir",
    addressEn: "Sındırgı, Balıkesir",
  },

  // ═══════════════════════════════════════════════
  // ZEYTİNLİ ÇAY BAHÇESİ - KTB
  // ═══════════════════════════════════════════════
  {
    name: "Zeytinli Çay Bahçesi",
    nameEn: "Zeytinli Tea Garden",
    description:
      "Zeytinli beldesinde, dere kenarında kurulmuş doğal bir çay bahçesidir. Ağaçların gölgesinde, akan suyun sesiyle huzurlu vakit geçirmek mümkündür.",
    descriptionEn:
      "A natural tea garden by the creek in Zeytinli town. Enjoy peaceful time under the shade of trees with the sound of flowing water.",
    shortDesc: "Dere kenarı doğal çay bahçesi",
    shortDescEn: "Creekside natural tea garden",
    lat: 39.61,
    lng: 26.86,
    categoryId: CAT.cultural,
    address: "Zeytinli, Edremit, Balıkesir",
    addressEn: "Zeytinli, Edremit, Balıkesir",
  },
];

// ═══════════════════════════════════════════════
// CUID GENERATOR & INSERT LOGIC
// ═══════════════════════════════════════════════
import crypto from "crypto";

function generateCuid() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString("hex");
  return `c${timestamp}${random}`;
}

async function main() {
  let inserted = 0;
  let skipped = 0;

  for (const loc of locations) {
    // Duplicate check
    const exists = await pool.query(
      `SELECT id FROM "Location" WHERE name = $1 AND "deletedAt" IS NULL`,
      [loc.name],
    );

    if (exists.rows.length > 0) {
      console.log(`SKIP (exists): ${loc.name}`);
      skipped++;
      continue;
    }

    const id = generateCuid();
    const now = new Date();

    await pool.query(
      `INSERT INTO "Location" (
        id, name, "nameEn", description, "descriptionEn",
        "shortDesc", "shortDescEn", latitude, longitude,
        "categoryId", images, address, "addressEn",
        "isActive", "isFeatured", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17
      )`,
      [
        id,
        loc.name,
        loc.nameEn,
        loc.description,
        loc.descriptionEn,
        loc.shortDesc,
        loc.shortDescEn,
        loc.lat,
        loc.lng,
        loc.categoryId,
        "{}", // empty images array
        loc.address,
        loc.addressEn,
        true, // isActive
        loc.isFeatured || false,
        now,
        now,
      ],
    );

    console.log(`INSERT: ${loc.name}`);
    inserted++;
  }

  // Summary
  console.log(`\n--- SUMMARY ---`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (duplicate): ${skipped}`);
  console.log(`Total in array: ${locations.length}`);

  // Verify final count
  const active = await pool.query(
    `SELECT COUNT(*) as count FROM "Location" WHERE "deletedAt" IS NULL`,
  );
  console.log(`Active locations in DB: ${active.rows[0].count}`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
