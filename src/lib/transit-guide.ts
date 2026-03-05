/**
 * Dynamic Transit Guide Engine
 *
 * Generates context-aware public transport directions based on:
 * - User's current position
 * - Target location coordinates & district
 * - Balıkesir's real transport network (bus, minibus, ferry)
 * - Distance & region analysis
 */

// ── Known transport hubs ──
interface TransportHub {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  type: "otogar" | "iskele" | "durak" | "terminal";
}

const HUBS: TransportHub[] = [
  {
    name: "Balıkesir Otogarı",
    nameEn: "Balıkesir Bus Station",
    lat: 39.639,
    lng: 27.875,
    type: "otogar",
  },
  {
    name: "Bandırma Otogarı",
    nameEn: "Bandırma Bus Station",
    lat: 40.352,
    lng: 27.97,
    type: "otogar",
  },
  {
    name: "Edremit Otogarı",
    nameEn: "Edremit Bus Station",
    lat: 39.596,
    lng: 27.02,
    type: "otogar",
  },
  {
    name: "Ayvalık Otogarı",
    nameEn: "Ayvalık Bus Station",
    lat: 39.313,
    lng: 26.693,
    type: "otogar",
  },
  {
    name: "Erdek İskelesi",
    nameEn: "Erdek Ferry Port",
    lat: 40.397,
    lng: 27.795,
    type: "iskele",
  },
  {
    name: "Bandırma İskelesi",
    nameEn: "Bandırma Ferry Port",
    lat: 40.354,
    lng: 27.978,
    type: "iskele",
  },
  {
    name: "Gönen Otogarı",
    nameEn: "Gönen Bus Station",
    lat: 40.11,
    lng: 27.647,
    type: "otogar",
  },
];

// ── District zones for smart routing ──
interface DistrictZone {
  name: string;
  nameEn: string;
  centerLat: number;
  centerLng: number;
  radius: number; // km
  nearestHub: string;
  busFromBalikesir?: string;
  busFromBalikesirEn?: string;
  busFrequency?: string;
  busFrequencyEn?: string;
  busDuration?: string;
  busDurationEn?: string;
}

const DISTRICTS: DistrictZone[] = [
  {
    name: "Balıkesir Merkez",
    nameEn: "Balıkesir Center",
    centerLat: 39.6484,
    centerLng: 27.8826,
    radius: 8,
    nearestHub: "Balıkesir Otogarı",
    busFromBalikesir: "Şehir içi belediye otobüsleri",
    busFromBalikesirEn: "City municipal buses",
    busFrequency: "10-15 dk arayla",
    busFrequencyEn: "Every 10-15 min",
    busDuration: "5-20 dk",
    busDurationEn: "5-20 min",
  },
  {
    name: "Edremit",
    nameEn: "Edremit",
    centerLat: 39.596,
    centerLng: 27.024,
    radius: 12,
    nearestHub: "Edremit Otogarı",
    busFromBalikesir: "Balıkesir-Edremit otobüsü",
    busFromBalikesirEn: "Balıkesir-Edremit bus",
    busFrequency: "30 dk arayla",
    busFrequencyEn: "Every 30 min",
    busDuration: "1.5 saat",
    busDurationEn: "1.5 hours",
  },
  {
    name: "Altınoluk",
    nameEn: "Altınoluk",
    centerLat: 39.5794,
    centerLng: 26.7372,
    radius: 8,
    nearestHub: "Edremit Otogarı",
    busFromBalikesir: "Balıkesir-Edremit otobüsü + Altınoluk dolmuşu",
    busFromBalikesirEn: "Balıkesir-Edremit bus + Altınoluk minibus",
    busFrequency: "Dolmuş 15 dk arayla",
    busFrequencyEn: "Minibus every 15 min",
    busDuration: "2 saat",
    busDurationEn: "2 hours",
  },
  {
    name: "Ayvalık",
    nameEn: "Ayvalık",
    centerLat: 39.3167,
    centerLng: 26.6944,
    radius: 10,
    nearestHub: "Ayvalık Otogarı",
    busFromBalikesir: "Balıkesir-Ayvalık otobüsü",
    busFromBalikesirEn: "Balıkesir-Ayvalık bus",
    busFrequency: "Günde 6-8 sefer",
    busFrequencyEn: "6-8 daily",
    busDuration: "3 saat",
    busDurationEn: "3 hours",
  },
  {
    name: "Cunda Adası",
    nameEn: "Cunda Island",
    centerLat: 39.3267,
    centerLng: 26.705,
    radius: 4,
    nearestHub: "Ayvalık Otogarı",
    busFromBalikesir: "Ayvalık otobüsü + Cunda dolmuşu",
    busFromBalikesirEn: "Ayvalık bus + Cunda minibus",
    busFrequency: "Dolmuş 10 dk arayla",
    busFrequencyEn: "Minibus every 10 min",
    busDuration: "3 saat 15 dk",
    busDurationEn: "3 hours 15 min",
  },
  {
    name: "Bandırma",
    nameEn: "Bandırma",
    centerLat: 40.35,
    centerLng: 27.9667,
    radius: 10,
    nearestHub: "Bandırma Otogarı",
    busFromBalikesir: "Balıkesir-Bandırma otobüsü",
    busFromBalikesirEn: "Balıkesir-Bandırma bus",
    busFrequency: "30 dk arayla",
    busFrequencyEn: "Every 30 min",
    busDuration: "1.5 saat",
    busDurationEn: "1.5 hours",
  },
  {
    name: "Erdek",
    nameEn: "Erdek",
    centerLat: 40.3833,
    centerLng: 27.8,
    radius: 8,
    nearestHub: "Erdek İskelesi",
    busFromBalikesir: "Bandırma otobüsü + Erdek dolmuşu",
    busFromBalikesirEn: "Bandırma bus + Erdek minibus",
    busFrequency: "Dolmuş sık sefer",
    busFrequencyEn: "Frequent minibuses",
    busDuration: "2 saat 15 dk",
    busDurationEn: "2 hours 15 min",
  },
  {
    name: "Gönen",
    nameEn: "Gönen",
    centerLat: 40.1167,
    centerLng: 27.65,
    radius: 8,
    nearestHub: "Gönen Otogarı",
    busFromBalikesir: "Balıkesir-Gönen otobüsü",
    busFromBalikesirEn: "Balıkesir-Gönen bus",
    busFrequency: "Günde 10+ sefer",
    busFrequencyEn: "10+ daily",
    busDuration: "1 saat",
    busDurationEn: "1 hour",
  },
  {
    name: "Sındırgı",
    nameEn: "Sındırgı",
    centerLat: 39.2333,
    centerLng: 28.1667,
    radius: 10,
    nearestHub: "Balıkesir Otogarı",
    busFromBalikesir: "Balıkesir-Sındırgı otobüsü",
    busFromBalikesirEn: "Balıkesir-Sındırgı bus",
    busFrequency: "Günde 8-10 sefer",
    busFrequencyEn: "8-10 daily",
    busDuration: "1.5 saat",
    busDurationEn: "1.5 hours",
  },
  {
    name: "Havran",
    nameEn: "Havran",
    centerLat: 39.5833,
    centerLng: 27.2167,
    radius: 6,
    nearestHub: "Balıkesir Otogarı",
    busFromBalikesir: "Balıkesir-Havran dolmuşu",
    busFromBalikesirEn: "Balıkesir-Havran minibus",
    busFrequency: "30 dk arayla",
    busFrequencyEn: "Every 30 min",
    busDuration: "30 dk",
    busDurationEn: "30 min",
  },
  {
    name: "Burhaniye",
    nameEn: "Burhaniye",
    centerLat: 39.5,
    centerLng: 26.97,
    radius: 8,
    nearestHub: "Edremit Otogarı",
    busFromBalikesir: "Balıkesir-Edremit otobüsü (Burhaniye aktarma)",
    busFromBalikesirEn: "Balıkesir-Edremit bus (Burhaniye transfer)",
    busFrequency: "30 dk arayla",
    busFrequencyEn: "Every 30 min",
    busDuration: "1.5 saat",
    busDurationEn: "1.5 hours",
  },
  {
    name: "Bigadiç",
    nameEn: "Bigadiç",
    centerLat: 39.3833,
    centerLng: 28.1333,
    radius: 6,
    nearestHub: "Balıkesir Otogarı",
    busFromBalikesir: "Balıkesir-Bigadiç otobüsü",
    busFromBalikesirEn: "Balıkesir-Bigadiç bus",
    busFrequency: "Günde 6-8 sefer",
    busFrequencyEn: "6-8 daily",
    busDuration: "1 saat",
    busDurationEn: "1 hour",
  },
  {
    name: "Kepsut",
    nameEn: "Kepsut",
    centerLat: 39.6833,
    centerLng: 28.1333,
    radius: 6,
    nearestHub: "Balıkesir Otogarı",
    busFromBalikesir: "Balıkesir-Kepsut dolmuşu",
    busFromBalikesirEn: "Balıkesir-Kepsut minibus",
    busFrequency: "Günde birkaç sefer",
    busFrequencyEn: "Several daily",
    busDuration: "45 dk",
    busDurationEn: "45 min",
  },
  {
    name: "Manyas",
    nameEn: "Manyas",
    centerLat: 40.05,
    centerLng: 27.98,
    radius: 8,
    nearestHub: "Bandırma Otogarı",
    busFromBalikesir: "Bandırma otobüsü + Manyas dolmuşu",
    busFromBalikesirEn: "Bandırma bus + Manyas minibus",
    busFrequency: "Dolmuş sık sefer",
    busFrequencyEn: "Frequent minibuses",
    busDuration: "1.5 saat",
    busDurationEn: "1.5 hours",
  },
  {
    name: "Marmara Adası",
    nameEn: "Marmara Island",
    centerLat: 40.6167,
    centerLng: 27.6167,
    radius: 8,
    nearestHub: "Erdek İskelesi",
    busFromBalikesir: "Bandırma + Erdek dolmuşu + Feribot",
    busFromBalikesirEn: "Bandırma + Erdek minibus + Ferry",
    busFrequency: "Feribot günde 2-4 sefer",
    busFrequencyEn: "Ferry 2-4 daily",
    busDuration: "4-5 saat",
    busDurationEn: "4-5 hours",
  },
  {
    name: "Avşa Adası",
    nameEn: "Avşa Island",
    centerLat: 40.5167,
    centerLng: 27.5833,
    radius: 5,
    nearestHub: "Erdek İskelesi",
    busFromBalikesir: "Bandırma + Erdek + Feribot",
    busFromBalikesirEn: "Bandırma + Erdek + Ferry",
    busFrequency: "Feribot günde 2-4 sefer",
    busFrequencyEn: "Ferry 2-4 daily",
    busDuration: "3.5-4 saat",
    busDurationEn: "3.5-4 hours",
  },
];

// ── Ferry routes ──
interface FerryRoute {
  from: string;
  fromEn: string;
  to: string;
  toEn: string;
  operator: string;
  duration: string;
  durationEn: string;
  frequency: string;
  frequencyEn: string;
  seasonal?: boolean;
}

const FERRY_ROUTES: FerryRoute[] = [
  {
    from: "Erdek",
    fromEn: "Erdek",
    to: "Avşa Adası",
    toEn: "Avşa Island",
    operator: "İDO / Özel",
    duration: "1-1.5 saat",
    durationEn: "1-1.5 hours",
    frequency: "Günde 2-4 sefer",
    frequencyEn: "2-4 daily",
  },
  {
    from: "Erdek",
    fromEn: "Erdek",
    to: "Marmara Adası",
    toEn: "Marmara Island",
    operator: "İDO / Özel",
    duration: "1.5-2 saat",
    durationEn: "1.5-2 hours",
    frequency: "Günde 2-3 sefer",
    frequencyEn: "2-3 daily",
  },
  {
    from: "Erdek",
    fromEn: "Erdek",
    to: "Paşalimanı Adası",
    toEn: "Paşalimanı Island",
    operator: "Arabalı feribot",
    duration: "1 saat",
    durationEn: "1 hour",
    frequency: "Günde 3-5 sefer",
    frequencyEn: "3-5 daily",
  },
  {
    from: "Tekirdağ",
    fromEn: "Tekirdağ",
    to: "Avşa Adası",
    toEn: "Avşa Island",
    operator: "İDO",
    duration: "2 saat",
    durationEn: "2 hours",
    frequency: "Yaz sezonu",
    frequencyEn: "Summer season",
    seasonal: true,
  },
];

// ── Utility functions ──
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findDistrict(lat: number, lng: number): DistrictZone | null {
  let closest: DistrictZone | null = null;
  let minDist = Infinity;
  for (const d of DISTRICTS) {
    const dist = haversineKm(lat, lng, d.centerLat, d.centerLng);
    if (dist < d.radius && dist < minDist) {
      closest = d;
      minDist = dist;
    }
  }
  return closest;
}

function findNearestHub(lat: number, lng: number): TransportHub {
  let nearest = HUBS[0];
  let minDist = Infinity;
  for (const h of HUBS) {
    const dist = haversineKm(lat, lng, h.lat, h.lng);
    if (dist < minDist) {
      nearest = h;
      minDist = dist;
    }
  }
  return nearest;
}

// ── Transit step types ──
export interface TransitStep {
  icon: "bus" | "minibus" | "ferry" | "walk" | "transfer";
  title: string;
  titleEn: string;
  detail: string;
  detailEn: string;
  duration?: string;
  durationEn?: string;
  tip?: string;
  tipEn?: string;
}

export interface TransitGuide {
  summary: string;
  summaryEn: string;
  totalEstimate: string;
  totalEstimateEn: string;
  steps: TransitStep[];
  needsFerry: boolean;
  distanceKm: number;
}

// ── Main guide generator ──
export function generateTransitGuide(
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number,
  locationPublicTransport?: string | null,
  locationPublicTransportEn?: string | null,
): TransitGuide {
  const totalDist = haversineKm(userLat, userLng, destLat, destLng);
  const userDistrict = findDistrict(userLat, userLng);
  const destDistrict = findDistrict(destLat, destLng);
  const steps: TransitStep[] = [];
  let needsFerry = false;

  // Check if destination requires ferry
  const islandDistricts = ["Marmara Adası", "Avşa Adası"];
  const destIsIsland =
    destDistrict && islandDistricts.includes(destDistrict.name);
  // Also check Paşalimanı by coordinates
  const isPasalimani = haversineKm(destLat, destLng, 40.5333, 27.6167) < 6;

  if (destIsIsland || isPasalimani) {
    needsFerry = true;
  }

  // ── CASE 1: Very close (< 2km) - just walk ──
  if (totalDist < 2) {
    steps.push({
      icon: "walk",
      title: "Yürüyerek gidin",
      titleEn: "Walk there",
      detail: `Hedefiniz sadece ${totalDist.toFixed(1)} km uzaklıkta. Yürüyerek yaklaşık ${Math.round(totalDist * 12)} dakikada ulaşabilirsiniz.`,
      detailEn: `Your destination is only ${totalDist.toFixed(1)} km away. You can walk there in about ${Math.round(totalDist * 12)} minutes.`,
      duration: `~${Math.round(totalDist * 12)} dk`,
      durationEn: `~${Math.round(totalDist * 12)} min`,
    });
    return {
      summary: "Yürüme mesafesinde",
      summaryEn: "Walking distance",
      totalEstimate: `~${Math.round(totalDist * 12)} dk`,
      totalEstimateEn: `~${Math.round(totalDist * 12)} min`,
      steps,
      needsFerry: false,
      distanceKm: totalDist,
    };
  }

  // ── CASE 2: Same district (< 10km) ──
  if (userDistrict && destDistrict && userDistrict.name === destDistrict.name) {
    const walkToStop = Math.min(totalDist * 0.3, 1.5);
    steps.push({
      icon: "walk",
      title: "En yakın durağa yürüyün",
      titleEn: "Walk to nearest stop",
      detail: `Yaklaşık ${Math.round(walkToStop * 12)} dk yürüyüş ile en yakın ${userDistrict.name} durağına gidin.`,
      detailEn: `Walk about ${Math.round(walkToStop * 12)} min to the nearest ${userDistrict.nameEn} stop.`,
      duration: `~${Math.round(walkToStop * 12)} dk`,
      durationEn: `~${Math.round(walkToStop * 12)} min`,
    });
    steps.push({
      icon: "bus",
      title: `${userDistrict.name} şehir içi otobüs/dolmuş`,
      titleEn: `${userDistrict.nameEn} local bus/minibus`,
      detail:
        userDistrict.busFromBalikesir ||
        "Belediye otobüsü veya dolmuş ile gidin.",
      detailEn:
        userDistrict.busFromBalikesirEn || "Take municipal bus or minibus.",
      duration: `~${Math.round(totalDist * 2.5)} dk`,
      durationEn: `~${Math.round(totalDist * 2.5)} min`,
      tip: userDistrict.busFrequency
        ? `Sefer sıklığı: ${userDistrict.busFrequency}`
        : undefined,
      tipEn: userDistrict.busFrequencyEn
        ? `Frequency: ${userDistrict.busFrequencyEn}`
        : undefined,
    });
    const totalMin = Math.round(walkToStop * 12 + totalDist * 2.5);
    return {
      summary: `${userDistrict.name} içi ulaşım`,
      summaryEn: `Within ${userDistrict.nameEn}`,
      totalEstimate: `~${totalMin} dk`,
      totalEstimateEn: `~${totalMin} min`,
      steps,
      needsFerry: false,
      distanceKm: totalDist,
    };
  }

  // ── CASE 3: Different districts - intercity routing ──
  let totalMinutes = 0;

  // Step 1: Get to nearest hub from user position
  const userHub = findNearestHub(userLat, userLng);
  const distToUserHub = haversineKm(userLat, userLng, userHub.lat, userHub.lng);

  if (distToUserHub > 1.5) {
    const walkMin = Math.round(Math.min(distToUserHub, 2) * 12);
    steps.push({
      icon: "walk",
      title: `${userHub.name}'na gidin`,
      titleEn: `Get to ${userHub.nameEn}`,
      detail:
        distToUserHub < 3
          ? `Yürüyerek ${walkMin} dk mesafede.`
          : `Dolmuş veya taksi ile ${userHub.name}'na ulaşın (${distToUserHub.toFixed(0)} km).`,
      detailEn:
        distToUserHub < 3
          ? `${walkMin} min walk.`
          : `Take minibus or taxi to ${userHub.nameEn} (${distToUserHub.toFixed(0)} km).`,
      duration:
        distToUserHub < 3
          ? `~${walkMin} dk`
          : `~${Math.round(distToUserHub * 1.5)} dk`,
      durationEn:
        distToUserHub < 3
          ? `~${walkMin} min`
          : `~${Math.round(distToUserHub * 1.5)} min`,
    });
    totalMinutes +=
      distToUserHub < 3 ? walkMin : Math.round(distToUserHub * 1.5);
  }

  // Step 2: Intercity bus to destination district
  if (destDistrict) {
    // Check if we need to go through Balıkesir first
    const userInBalikesir = userDistrict?.name === "Balıkesir Merkez";
    const destNeedsTransfer =
      !userInBalikesir && destDistrict.nearestHub !== userHub.name;

    if (destNeedsTransfer && userHub.name !== "Balıkesir Otogarı") {
      // Need to transfer through Balıkesir
      steps.push({
        icon: "bus",
        title: "Balıkesir Otogarı'na otobüs",
        titleEn: "Bus to Balıkesir Station",
        detail: `${userHub.name}'ndan Balıkesir Otogarı'na otobüs alın.`,
        detailEn: `Take bus from ${userHub.nameEn} to Balıkesir Bus Station.`,
        duration: `~${Math.round(distToUserHub > 30 ? 90 : 60)} dk`,
        durationEn: `~${Math.round(distToUserHub > 30 ? 90 : 60)} min`,
      });
      totalMinutes += distToUserHub > 30 ? 90 : 60;

      steps.push({
        icon: "transfer",
        title: "Aktarma",
        titleEn: "Transfer",
        detail: "Balıkesir Otogarı'nda aktarma yapın.",
        detailEn: "Transfer at Balıkesir Bus Station.",
        duration: "~15 dk",
        durationEn: "~15 min",
        tip: "Bekleme süresi sefer saatine göre değişir",
        tipEn: "Wait time varies by schedule",
      });
      totalMinutes += 15;
    }

    // Main intercity leg
    if (destDistrict.busFromBalikesir) {
      steps.push({
        icon: needsFerry ? "bus" : "bus",
        title: `${destDistrict.name} yönüne otobüs`,
        titleEn: `Bus towards ${destDistrict.nameEn}`,
        detail: destDistrict.busFromBalikesir,
        detailEn:
          destDistrict.busFromBalikesirEn || destDistrict.busFromBalikesir,
        duration: destDistrict.busDuration,
        durationEn: destDistrict.busDurationEn,
        tip: destDistrict.busFrequency
          ? `Sefer sıklığı: ${destDistrict.busFrequency}`
          : undefined,
        tipEn: destDistrict.busFrequencyEn
          ? `Frequency: ${destDistrict.busFrequencyEn}`
          : undefined,
      });
      // Parse duration estimate
      const durStr = destDistrict.busDuration || "";
      const hourMatch = durStr.match(/(\d+(?:\.\d+)?)\s*saat/);
      const minMatch = durStr.match(/(\d+)\s*dk/);
      totalMinutes +=
        (hourMatch ? parseFloat(hourMatch[1]) * 60 : 0) +
        (minMatch ? parseInt(minMatch[1]) : 0);
      if (!hourMatch && !minMatch) totalMinutes += 60;
    }

    // Ferry step if needed
    if (needsFerry) {
      const ferryRoute = FERRY_ROUTES.find(
        (f) =>
          destDistrict &&
          (f.to === destDistrict.name ||
            (isPasalimani && f.to === "Paşalimanı Adası")),
      );
      if (ferryRoute) {
        steps.push({
          icon: "ferry",
          title: `${ferryRoute.from} → ${ferryRoute.to} feribotu`,
          titleEn: `${ferryRoute.fromEn} → ${ferryRoute.toEn} ferry`,
          detail: `${ferryRoute.operator} feribotu ile ${ferryRoute.duration}.`,
          detailEn: `${ferryRoute.operator} ferry, ${ferryRoute.durationEn}.`,
          duration: ferryRoute.duration,
          durationEn: ferryRoute.durationEn,
          tip: ferryRoute.seasonal
            ? `⚠️ Sezonluk sefer (${ferryRoute.frequency})`
            : `Sefer: ${ferryRoute.frequency}`,
          tipEn: ferryRoute.seasonal
            ? `⚠️ Seasonal service (${ferryRoute.frequencyEn})`
            : `Schedule: ${ferryRoute.frequencyEn}`,
        });
        const fDurMatch = ferryRoute.duration.match(/(\d+(?:\.\d+)?)/);
        totalMinutes += fDurMatch ? parseFloat(fDurMatch[1]) * 60 : 90;
      }
    }
  } else {
    // Unknown district - use generic routing
    steps.push({
      icon: "bus",
      title: "İlçeler arası otobüs",
      titleEn: "Intercity bus",
      detail: `Balıkesir Otogarı'ndan hedefe en yakın ilçeye otobüs alın (${totalDist.toFixed(0)} km).`,
      detailEn: `Take bus from Balıkesir Station to the nearest district (${totalDist.toFixed(0)} km).`,
      duration: `~${Math.round(totalDist * 1.2)} dk`,
      durationEn: `~${Math.round(totalDist * 1.2)} min`,
    });
    totalMinutes += Math.round(totalDist * 1.2);
  }

  // Step 3: Last mile from hub/stop to destination
  const destHub = findNearestHub(destLat, destLng);
  const lastMile = haversineKm(destLat, destLng, destHub.lat, destHub.lng);
  if (lastMile > 1) {
    const lastMin = Math.round(Math.min(lastMile, 3) * 12);
    steps.push({
      icon: lastMile > 3 ? "minibus" : "walk",
      title: lastMile > 3 ? "Son etap: dolmuş/taksi" : "Son etap: yürüyüş",
      titleEn: lastMile > 3 ? "Last mile: minibus/taxi" : "Last mile: walk",
      detail:
        lastMile > 3
          ? `Varış noktasına dolmuş veya taksi ile ${lastMile.toFixed(1)} km.`
          : `Varış noktasına yürüyerek ${lastMin} dk.`,
      detailEn:
        lastMile > 3
          ? `${lastMile.toFixed(1)} km to destination by minibus or taxi.`
          : `${lastMin} min walk to destination.`,
      duration:
        lastMile > 3 ? `~${Math.round(lastMile * 2)} dk` : `~${lastMin} dk`,
      durationEn:
        lastMile > 3 ? `~${Math.round(lastMile * 2)} min` : `~${lastMin} min`,
    });
    totalMinutes += lastMile > 3 ? Math.round(lastMile * 2) : lastMin;
  }

  // Add location-specific tip if available
  if (locationPublicTransport) {
    steps.push({
      icon: "bus",
      title: "Yerel ulaşım bilgisi",
      titleEn: "Local transport info",
      detail: locationPublicTransport,
      detailEn: locationPublicTransportEn || locationPublicTransport,
      tip: "Bu bilgi mekan tarafından sağlanmıştır",
      tipEn: "This info is provided by the venue",
    });
  }

  // Format total estimate
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  const totalEst =
    hours > 0 ? `~${hours} sa ${mins > 0 ? mins + " dk" : ""}` : `~${mins} dk`;
  const totalEstEn =
    hours > 0 ? `~${hours}h ${mins > 0 ? mins + " min" : ""}` : `~${mins} min`;

  const summary = needsFerry
    ? "Otobüs + Feribot ile ulaşım"
    : totalDist > 50
      ? "Şehirler arası otobüs ile ulaşım"
      : "İlçeler arası otobüs/dolmuş ile ulaşım";
  const summaryEn = needsFerry
    ? "Bus + Ferry route"
    : totalDist > 50
      ? "Intercity bus route"
      : "District bus/minibus route";

  return {
    summary,
    summaryEn,
    totalEstimate: totalEst,
    totalEstimateEn: totalEstEn,
    steps,
    needsFerry,
    distanceKm: totalDist,
  };
}
