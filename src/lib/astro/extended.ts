/**
 * Extended calculations used only by the traditional PDF Kundli report.
 */
import * as A from "astronomy-engine";
import { DASHA_ORDER, NAKSHATRAS, NITYA_YOGAS, PLANET_INFO, SIGNS, TITHIS, type PlanetId } from "./data";
import { ascendantTropical, d10Of, d12Of, d2Of, d30Of, d3Of, d7Of, d9Of, mcTropical, siderealLon, signOf, subPeriods, YEAR_MS, type ChartData, type DashaPeriod } from "./calc";
import { compoundRel, computeShadbala, drishtiValue, naturalRel, SEVEN } from "./shadbala";
import { avakhada, dignity, houseFrom, houseLord, naturalNature, planet } from "./analysis";
import { dashaPrediction } from "./predictions";

const D2R = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;
const pad = (n: number) => String(n).padStart(2, "0");

export const SIGN_ABBR = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];
export const PL_ABBR: Record<PlanetId, string> = { Sun: "Sun", Moon: "Mon", Mars: "Mar", Mercury: "Mer", Jupiter: "Jup", Venus: "Ven", Saturn: "Sat", Rahu: "Rah", Ketu: "Ket" };
export const NAK_SHORT = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigsira", "Ardra", "Punarvsu", "Pushya", "Ashlesha", "Magha", "P Phal", "U Phal", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Moola", "P Shadha", "U Shadha", "Sravana", "Dhanishta", "Shatbhsa", "P Bhadra", "U Bhadra", "Revati"];

/* ---------------- formatting ---------------- */
export function dms(x: number) {
  const neg = x < 0;
  x = Math.abs(x);
  let d = Math.floor(x);
  const mF = (x - d) * 60;
  let m = Math.floor(mF);
  let s = Math.round((mF - m) * 60);
  if (s === 60) {
    s = 0;
    m++;
  }
  if (m === 60) {
    m = 0;
    d++;
  }
  return `${neg ? "-" : ""}${pad(d)}:${pad(m)}:${pad(s)}`;
}
export const clock = (ms: number, offMin: number) => dms((((ms + offMin * 60000) % 86400000) + 86400000) % 86400000 / 3600000);
export const dmy = (ms: number, offMin = 0) => {
  const d = new Date(ms + offMin * 60000);
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
};
export function ymd(years: number) {
  const days = years * 365.25;
  const y = Math.floor(days / 365.25);
  const m = Math.floor((days - y * 365.25) / 30.4375);
  const d = Math.floor(days - y * 365.25 - m * 30.4375);
  return `${y} Years ${m} Months ${d} Days`;
}
export const signDeg = (lon: number) => `${SIGN_ABBR[signOf(lon)]} ${dms(norm(lon) % 30)}`;

/* ---------------- time details ---------------- */
const SEASONS = ["Vasant", "Grishma", "Grishma", "Varsha", "Varsha", "Sharad", "Sharad", "Hemant", "Hemant", "Shishir", "Shishir", "Vasant"];

export function timeDetails(c: ChartData) {
  const utc = Date.parse(c.utc);
  const date = new Date(utc);
  const off = c.tzOffsetMin;
  const zoneDeg = off / 4;
  const locCorrMin = (c.input.lon - zoneDeg) * 4;
  const parts = c.input.time.split(":").map(Number);
  const stdHours = parts[0] + (parts[1] || 0) / 60 + (parts[2] || 0) / 3600;
  const T = (c.jd - 2451545) / 36525;
  const L0 = norm(280.46646 + 36000.76983 * T);
  let eotMin = 0;
  try {
    const eq = A.Equator(A.Body.Sun, date, new A.Observer(c.input.lat, c.input.lon, 0), true, true);
    let e = L0 - 0.0057183 - eq.ra * 15;
    e = ((e + 540) % 360) - 180;
    eotMin = e * 4;
  } catch {
    /* ignore */
  }
  const lst = norm(A.SiderealTime(date) * 15 + c.input.lon) / 15;
  const rise = c.sunTimes?.riseMs ?? null;
  const set = c.sunTimes?.setMs ?? null;
  const sun = c.planets[0];
  const trop = sun.tropLon ?? norm(sun.lon + c.ayanamsa);
  const lat = c.input.lat;
  const lon = c.input.lon;
  return {
    timeStr: `${pad(parts[0])}:${pad(parts[1] || 0)}:${pad(parts[2] || 0)}`,
    ishta: rise !== null ? dms((utc - rise) / 60000 / 24) : "-",
    latStr: `${dms(Math.abs(lat))} ${lat >= 0 ? "N" : "S"}`,
    lonStr: `${dms(Math.abs(lon))} ${lon >= 0 ? "E" : "W"}`,
    zoneStr: `${dms(Math.abs(zoneDeg))} ${zoneDeg >= 0 ? "E" : "W"}`,
    locCorr: dms(locCorrMin / 60),
    warCorr: "00:00:00",
    lmt: dms((((stdHours + locCorrMin / 60) % 24) + 24) % 24),
    eot: dms(eotMin / 60),
    lst: dms(lst),
    sunrise: rise !== null ? clock(rise, off) : "-",
    sunset: set !== null ? clock(set, off) : "-",
    dayDur: rise !== null && set !== null ? dms((set - rise) / 3600000) : "-",
    ayan: trop >= 90 && trop < 270 ? "Dakshinayan" : "Uttarayan",
    gola: trop < 180 ? "Uttar" : "Dakshin",
    season: SEASONS[Math.floor(trop / 30)],
    sunDeg: `${dms(sun.deg)} ${SIGNS[sun.sign].en}`,
    ascDeg: `${dms(c.asc.deg)} ${SIGNS[c.asc.sign].en}`,
  };
}

/* ---------------- Panchang at sunrise with ending times ---------------- */
const LUNAR_MONTHS = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
const moonLon = (t: number) => siderealLon("Moon", new Date(t));
const sunLon = (t: number) => siderealLon("Sun", new Date(t));
const elong = (t: number) => norm(moonLon(t) - sunLon(t));
const yogaSum = (t: number) => norm(moonLon(t) + sunLon(t));
function karanaName(k: number) {
  const mov = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];
  return k === 0 ? "Kimstughna" : k === 57 ? "Shakuni" : k === 58 ? "Chatushpada" : k === 59 ? "Naga" : mov[(k - 1) % 7];
}
function nextChange(fn: (t: number) => number, unit: number, start: number) {
  const idx = Math.floor(fn(start) / unit);
  let a = start;
  let b = start;
  for (let i = 0; i < 80; i++) {
    b = a + 3600000;
    if (Math.floor(fn(b) / unit) !== idx) break;
    a = b;
  }
  for (let i = 0; i < 28; i++) {
    const m = (a + b) / 2;
    if (Math.floor(fn(m) / unit) === idx) a = m;
    else b = m;
  }
  return { idx, end: b };
}

export function sunrisePanchang(c: ChartData) {
  const off = c.tzOffsetMin;
  const birth = Date.parse(c.utc);
  const rise = c.sunTimes?.riseMs ?? birth;
  const base = Math.floor((rise + off * 60000) / 86400000) * 86400000 - off * 60000;
  const rel = (t: number) => dms((t - base) / 3600000);
  const ti = nextChange(elong, 12, rise);
  const nk = nextChange(moonLon, 360 / 27, rise);
  const yg = nextChange(yogaSum, 360 / 27, rise);
  const kr = nextChange(elong, 6, rise);
  let nm: number | null = null;
  try {
    const r = A.SearchMoonPhase(0, new Date(rise), -35);
    if (r) nm = r.date.getTime();
  } catch {
    nm = null;
  }
  if (nm === null) nm = rise - (elong(rise) / 12.19) * 86400000;
  const monthIdx = (signOf(sunLon(nm)) + 1) % 12;
  const local = new Date(birth + off * 60000);
  const gy = local.getUTCFullYear();
  const saka = gy - 78 - (monthIdx >= 9 && local.getUTCMonth() <= 3 ? 1 : 0);
  const tithiNum = ti.idx + 1;
  return {
    samvat: saka + 135,
    saka,
    month: LUNAR_MONTHS[monthIdx],
    paksha: tithiNum <= 15 ? "Shukla" : "Krishna",
    tithi: `${tithiNum <= 15 ? tithiNum : tithiNum - 15} (${tithiNum === 30 ? "Amavasya" : TITHIS[(tithiNum - 1) % 15]})`,
    tithiEnd: rel(ti.end),
    nak: NAKSHATRAS[nk.idx].name,
    nakEnd: rel(nk.end),
    yoga: NITYA_YOGAS[yg.idx],
    yogaEnd: rel(yg.end),
    karana: karanaName(kr.idx),
    karanaEnd: rel(kr.end),
  };
}

/* ---------------- Avakahada extras ---------------- */
const HANSAK: Record<string, string> = { Fire: "Agni", Earth: "Bhoomi", Air: "Vayu", Water: "Jal" };
function nameVarga(syl: string) {
  const s = syl.toLowerCase();
  if (/^[aeiou]/.test(s)) return "Garuda";
  if (/^(k|g)/.test(s)) return "Marjar";
  if (/^(ch|j)/.test(s)) return "Simha";
  if (/^(t|d|n)/.test(s)) return "Sarpa";
  if (/^(p|b|f|m)/.test(s)) return "Mooshak";
  if (/^(y|r|l|v|w)/.test(s)) return "Mriga";
  return "Mesha";
}
export function avakahadaFull(c: ChartData) {
  const a = avakhada(c);
  const moon = planet(c, "Moon");
  const nak = moon.nak;
  const yunja = nak === 26 || nak <= 4 ? "Purva" : nak <= 16 ? "Madhya" : "Antya";
  const pays = ["Swarna (Gold)", "Rajat (Silver)", "Tamra (Copper)", "Loha (Iron)"];
  const nakPaya = pays[(nak + 1) % 4].split(" ")[1].replace(/[()]/g, "");
  const rasiPaya = a.paya.split(" ")[1]?.replace(/[()]/g, "") ?? a.paya;
  const tropSun = c.planets[0].tropLon ?? norm(c.planets[0].lon + c.ayanamsa);
  return {
    ascLord: `${SIGNS[c.asc.sign].en} - ${a.lagnaLord}`,
    rasiLord: `${a.rashi.en} - ${a.rashiLord}`,
    nakCharan: `${a.nakshatra.name} - ${a.pada}`,
    nakLord: a.nakLord,
    yoga: c.panchang.yoga,
    karan: c.panchang.karana,
    gana: a.gana,
    yoni: a.yoni.split(" ")[0],
    nadi: a.nadi,
    varan: a.varna,
    vashya: a.vashya,
    varga: nameVarga(a.syllable),
    yunja,
    hansak: HANSAK[a.tatva] ?? a.tatva,
    nameAlpha: a.syllable,
    paya: `${rasiPaya} - ${nakPaya}`,
    sunWest: SIGNS[signOf(tropSun)].en,
  };
}

/* ---------------- Ghatak Chakra (by Moon sign) ---------------- */
const GHATAK = [
  ["Kartika", "1-6-11", "Sunday", "Magha", "Vishkambha", "Bava", "1", "Aries"],
  ["Margashirsha", "5-10-15", "Saturday", "Hasta", "Shula", "Shakuni", "4", "Taurus"],
  ["Ashadha", "2-7-12", "Monday", "Swati", "Parigha", "Kaulava", "3", "Cancer"],
  ["Pausha", "2-7-12", "Wednesday", "Anuradha", "Vyaghata", "Naga", "1", "Libra"],
  ["Jyeshtha", "3-8-13", "Saturday", "Mula", "Dhriti", "Bava", "1", "Capricorn"],
  ["Bhadrapada", "5-10-15", "Saturday", "Shravana", "Shula", "Kaulava", "1", "Pisces"],
  ["Magha", "4-9-14", "Thursday", "Shatabhisha", "Shukla", "Taitila", "4", "Virgo"],
  ["Ashwin", "1-6-11", "Friday", "Revati", "Vyatipata", "Garaja", "1", "Taurus"],
  ["Shravana", "3-8-13", "Friday", "Bharani", "Vajra", "Taitila", "1", "Gemini"],
  ["Vaishakha", "4-9-14", "Tuesday", "Rohini", "Vaidhriti", "Shakuni", "4", "Aquarius"],
  ["Chaitra", "3-8-13", "Thursday", "Ardra", "Ganda", "Kimstughna", "3", "Sagittarius"],
  ["Phalguna", "5-10-15", "Friday", "Ashlesha", "Vajra", "Chatushpada", "4", "Aquarius"],
];
export function ghatak(c: ChartData) {
  const g = GHATAK[planet(c, "Moon").sign];
  return { month: g[0], tithi: g[1], day: g[2], nakshatra: g[3], yoga: g[4], karan: g[5], prahar: g[6], lagna: g[7] };
}

/* ---------------- KP lords ---------------- */
function subDiv(lord: PlanetId, start: number, span: number, lon: number) {
  const i = DASHA_ORDER.indexOf(lord);
  let s = start;
  for (let k = 0; k < 9; k++) {
    const l = DASHA_ORDER[(i + k) % 9];
    const len = (span * PLANET_INFO[l].years) / 120;
    if (lon < s + len || k === 8) return { lord: l, start: s, span: len };
    s += len;
  }
  return { lord, start, span };
}
export function kpLords(lon: number) {
  lon = norm(lon);
  const ns = 360 / 27;
  const n = Math.floor(lon / ns);
  const nl = NAKSHATRAS[n].lord;
  const sub = subDiv(nl, n * ns, ns, lon);
  const ss = subDiv(sub.lord, sub.start, sub.span, lon);
  return { rl: SIGNS[signOf(lon)].lord, nl, sub: sub.lord, ss: ss.lord };
}

/* ---------------- Outer planets & ascendant speed ---------------- */
export function outerPlanets(c: ChartData) {
  const t = Date.parse(c.utc);
  const ay = c.ayanamsa;
  const bodies: [string, A.Body][] = [
    ["Ura", A.Body.Uranus],
    ["Nep", A.Body.Neptune],
    ["Plu", A.Body.Pluto],
  ];
  return bodies.map(([name, b]) => {
    const at = (x: number) => norm(A.Ecliptic(A.GeoVector(b, new Date(x), true)).elon - ay);
    const lon = at(t);
    let sp = at(t + 43200000) - at(t - 43200000);
    if (sp > 180) sp -= 360;
    if (sp < -180) sp += 360;
    return { name, lon, speed: sp, retro: sp < 0 };
  });
}
export function ascSpeed(c: ChartData) {
  const t = Date.parse(c.utc);
  const a1 = ascendantTropical(new Date(t - 1800000), c.input.lat, c.input.lon);
  const a2 = ascendantTropical(new Date(t + 1800000), c.input.lat, c.input.lon);
  return norm(a2 - a1) * 24;
}

/* ---------------- Houses: Placidus (KP) & Sripati (Chalit) ---------------- */
export function placidusTropical(c: ChartData) {
  const date = new Date(c.utc);
  const lat = c.input.lat;
  const T = (c.jd - 2451545) / 36525;
  const eps = (23.4392911 - 0.0130042 * T) * D2R;
  const ramc = norm(A.SiderealTime(date) * 15 + c.input.lon);
  const asc = ascendantTropical(date, lat, c.input.lon);
  const mc = mcTropical(date, c.input.lon);
  const phi = lat * D2R;
  const cusp = (h: 11 | 12 | 2 | 3) => {
    const above = h === 11 || h === 12;
    const f = h === 11 || h === 3 ? 1 / 3 : 2 / 3;
    let ra = norm(above ? ramc + 30 * (h - 10) : ramc + 180 - 30 * (4 - h));
    for (let i = 0; i < 30; i++) {
      const decl = Math.atan(Math.tan(eps) * Math.sin(ra * D2R));
      const x = Math.max(-1, Math.min(1, Math.tan(phi) * Math.tan(decl)));
      const ad = Math.asin(x) / D2R;
      ra = norm(above ? ramc + f * (90 + ad) : ramc + 180 - f * (90 - ad));
    }
    return norm(Math.atan2(Math.sin(ra * D2R), Math.cos(ra * D2R) * Math.cos(eps)) / D2R);
  };
  const c11 = cusp(11);
  const c12 = cusp(12);
  const c2 = cusp(2);
  const c3 = cusp(3);
  return [asc, c2, c3, norm(mc + 180), norm(c11 + 180), norm(c12 + 180), norm(asc + 180), norm(c2 + 180), norm(c3 + 180), mc, c11, c12];
}

export const kpAyanamsa = (c: ChartData) => c.ayanamsa - 0.1;

export function sripati(c: ChartData) {
  const asc = c.asc.lon;
  const mc = c.mc;
  const ic = norm(mc + 180);
  const desc = norm(asc + 180);
  const mid: number[] = new Array(12);
  const fill = (a: number, b: number, h0: number) => {
    const arc = norm(b - a);
    mid[h0] = a;
    mid[(h0 + 1) % 12] = norm(a + arc / 3);
    mid[(h0 + 2) % 12] = norm(a + (2 * arc) / 3);
  };
  fill(asc, ic, 0);
  fill(ic, desc, 3);
  fill(desc, mc, 6);
  fill(mc, asc, 9);
  const start = mid.map((m, i) => {
    const prev = mid[(i + 11) % 12];
    return norm(prev + norm(m - prev) / 2);
  });
  return { mid, start };
}
export function chalitHouseOf(lon: number, start: number[]) {
  for (let i = 0; i < 12; i++) {
    const a = start[i];
    const b = start[(i + 1) % 12];
    if (norm(lon - a) < norm(b - a)) return i + 1;
  }
  return 1;
}

/* ---------------- Tara Chakra ---------------- */
const TARAS = ["Janma", "Sampat", "Vipat", "Kshema", "Pratyari", "Sadhaka", "Vadha", "Mitra", "Ati-Mitra"];
export function taraChakra(c: ChartData) {
  const n = planet(c, "Moon").nak;
  return TARAS.map((t, i) => ({ tara: t, naks: [0, 9, 18].map((k) => NAKSHATRAS[(n + i + k) % 27].name) }));
}

/* ---------------- Shodashvarga & Vimsopaka ---------------- */
export const VARGAS: [number, string][] = [
  [1, "Rasi"], [2, "Hora"], [3, "Drekkana"], [4, "Chaturthamsa"], [7, "Saptamsa"], [9, "Navamsa"], [10, "Dasamsa"], [12, "Dwadasamsa"],
  [16, "Shodasamsa"], [20, "Vimsamsa"], [24, "Chaturvimsamsa"], [27, "Saptavimsamsa"], [30, "Trimsamsa"], [40, "Khavedamsa"], [45, "Akshavedamsa"], [60, "Shashtiamsa"],
];
export function vargaSign(lon: number, n: number): number {
  const s = signOf(lon);
  const d = norm(lon) % 30;
  switch (n) {
    case 2: return d2Of(lon);
    case 3: return d3Of(lon);
    case 4: return (s + 3 * Math.floor(d / 7.5)) % 12;
    case 7: return d7Of(lon);
    case 9: return d9Of(lon);
    case 10: return d10Of(lon);
    case 12: return d12Of(lon);
    case 16: return ([0, 4, 8][s % 3] + Math.floor(d / (30 / 16))) % 12;
    case 20: return ([0, 8, 4][s % 3] + Math.floor(d / 1.5)) % 12;
    case 24: return ((s % 2 === 0 ? 4 : 3) + Math.floor(d / 1.25)) % 12;
    case 27: return ((s % 4) * 3 + Math.floor(d / (30 / 27))) % 12;
    case 30: return d30Of(lon);
    case 40: return ((s % 2 === 0 ? 0 : 6) + Math.floor(d / 0.75)) % 12;
    case 45: return ([0, 4, 8][s % 3] + Math.floor(d / (30 / 45))) % 12;
    case 60: return (s + Math.floor(d * 2)) % 12;
    default: return s;
  }
}

const VW: Record<string, Record<number, number>> = {
  ShadVarga: { 1: 6, 2: 2, 3: 4, 9: 5, 12: 2, 30: 1 },
  SaptVarga: { 1: 5, 2: 2, 3: 3, 7: 2.5, 9: 4.5, 12: 2, 30: 1 },
  DasaVarga: { 1: 3, 2: 1.5, 3: 1.5, 7: 1.5, 9: 1.5, 10: 1.5, 12: 1.5, 16: 1.5, 30: 1.5, 60: 5 },
  ShodashVarga: { 1: 3.5, 2: 1, 3: 1, 4: 0.5, 7: 0.5, 9: 3, 10: 0.5, 12: 0.5, 16: 2, 20: 0.5, 24: 0.5, 27: 0.5, 30: 1, 40: 0.5, 45: 0.5, 60: 4 },
};
const BHEDA_NAMES: Record<string, string[]> = {
  ShadVarga: ["", "", "Kimsuka", "Vyanjana", "Chamara", "Chatra", "Kundala"],
  SaptVarga: ["", "", "Kimsuka", "Vyanjana", "Chamara", "Chatra", "Kundala", "Mukuta"],
  DasaVarga: ["", "", "Parijata", "Uttama", "Gopura", "Simhasana", "Paravata", "Devaloka", "Brahmaloka", "Airavata", "Sridhama"],
  ShodashVarga: ["", "", "Bhedaka", "Kusuma", "Nagapushpa", "Kanduka", "Kerala", "Kalpavriksha", "Chandanavana", "Purnachandra", "Uchchaisrava", "Dhanvantari", "Suryakanta", "Vidruma", "Indrasana", "Goloka", "Vishnupada"],
};
function vPoints(c: ChartData, id: PlanetId, sign: number) {
  const pi = PLANET_INFO[id];
  const lord = SIGNS[sign].lord;
  if (pi.exalt[0] === sign || lord === id || pi.own.includes(sign)) return { pts: 20, good: true };
  if (SEVEN.includes(id)) {
    const r = compoundRel(c, id, lord);
    return { pts: r === "Great Friend" ? 18 : r === "Friend" ? 15 : r === "Neutral" ? 10 : r === "Enemy" ? 7 : 5, good: false };
  }
  const n = naturalRel(id, lord);
  return { pts: n === 1 ? 15 : n === 0 ? 10 : 7, good: false };
}
export function vimsopaka(c: ChartData) {
  return c.planets.map((p) => {
    const out: Record<string, { score: number; count: number; name: string }> = {};
    for (const [set, w] of Object.entries(VW)) {
      let score = 0;
      let count = 0;
      for (const [div, wt] of Object.entries(w)) {
        const v = vPoints(c, p.id, vargaSign(p.lon, Number(div)));
        score += (wt * v.pts) / 20;
        if (v.good) count++;
      }
      out[set] = { score, count, name: BHEDA_NAMES[set][count] || "-" };
    }
    return { id: p.id, ...out } as { id: PlanetId } & Record<string, { score: number; count: number; name: string }>;
  });
}

/* ---------------- Bhava Bala ---------------- */
export function bhavaBala(c: ChartData) {
  const sb = computeShadbala(c).rows;
  const total = (id: PlanetId) => sb.find((r) => r.id === id)?.total ?? 0;
  const { mid } = sripati(c);
  const rows = mid.map((m, i) => {
    const h = i + 1;
    const lord = houseLord(c, h);
    const adhipati = total(lord);
    const s = signOf(m);
    const dIn = m % 30;
    const strong = [2, 5, 6, 10].includes(s) || (s === 8 && dIn < 15) ? 1 : [3, 11].includes(s) || (s === 9 && dIn >= 15) ? 4 : s === 7 ? 7 : 10;
    const dist = Math.min(Math.abs(h - strong), 12 - Math.abs(h - strong));
    const dig = (6 - dist) * 10;
    let drishti = 0;
    for (const q of c.planets) {
      if (!SEVEN.includes(q.id)) continue;
      const v = drishtiValue(q.id, m - q.lon);
      const ben = naturalNature(c, q.id) === "Benefic";
      const signed = ben ? v : -v;
      drishti += q.id === "Jupiter" || q.id === "Mercury" ? signed : signed / 4;
    }
    const tot = adhipati + dig + drishti;
    return { h, lord, adhipati, dig, drishti, total: tot, rupas: tot / 60, rank: 0 };
  });
  [...rows].sort((a, b) => b.total - a.total).forEach((r, i) => (r.rank = i + 1));
  return rows;
}

/* ---------------- Numerology & favourable points ---------------- */
const digitSum = (n: number): number => {
  while (n > 9) n = String(n).split("").reduce((a, b) => a + Number(b), 0);
  return n;
};
const NUM_PLANET: PlanetId[] = ["Sun", "Sun", "Moon", "Jupiter", "Rahu", "Mercury", "Venus", "Ketu", "Saturn", "Mars"];
const NUM_REL: Record<number, { f: number[]; e: number[] }> = {
  1: { f: [1, 2, 3, 9], e: [6, 8] }, 2: { f: [1, 2, 7], e: [8, 9] }, 3: { f: [1, 3, 6, 9], e: [5, 8] }, 4: { f: [1, 4, 6], e: [3, 7, 8] }, 5: { f: [1, 5, 6], e: [2, 9] },
  6: { f: [3, 5, 6, 9], e: [1, 2] }, 7: { f: [1, 2, 7], e: [8, 9] }, 8: { f: [4, 5, 6, 8], e: [1, 2, 9] }, 9: { f: [1, 3, 9], e: [5, 8] },
};
const FAV_TIME: Record<PlanetId, string> = { Sun: "Morning (sunrise)", Moon: "Night", Mars: "Noon", Mercury: "Morning", Jupiter: "Evening", Venus: "Morning", Saturn: "Evening / Night", Rahu: "Night", Ketu: "Dawn" };
const LIQUID: Record<PlanetId, string> = { Sun: "Honey, saffron water", Moon: "Milk, curd", Mars: "Jaggery water", Mercury: "Green juices", Jupiter: "Ghee, turmeric milk", Venus: "Rose water, perfume", Saturn: "Mustard oil, sesame oil", Rahu: "Coconut water", Ketu: "Blanket & sesame oil" };
const DONATION: Record<PlanetId, string> = { Sun: "Wheat, jaggery, copper, red cloth", Moon: "Rice, milk, silver, white cloth", Mars: "Red lentils, jaggery, copper, red cloth", Mercury: "Green gram, green cloth, books", Jupiter: "Turmeric, chana dal, yellow cloth, gold", Venus: "Rice, white sweets, curd, perfume", Saturn: "Black sesame, iron, mustard oil, blankets", Rahu: "Urad dal, blanket, coconut", Ketu: "Horse gram, blanket, sesame" };

export function favourablePoints(c: ChartData) {
  const [y, m, d] = c.input.date.split("-").map(Number);
  const radical = digitSum(d);
  const lucky = digitSum(String(y) .split("").concat(String(m).split(""), String(d).split("")).reduce((a, b) => a + Number(b), 0));
  const ll = SIGNS[c.asc.sign].lord;
  const l5 = houseLord(c, 5);
  const l9 = houseLord(c, 9);
  const favPlanets = Array.from(new Set([ll, l5, l9]));
  const friends = PLANET_INFO[ll].friends.filter((f) => !["Rahu", "Ketu"].includes(f));
  const friendlySigns = SIGNS.map((s, i) => ({ s, i })).filter(({ s }) => friends.includes(s.lord) || s.lord === ll).map(({ s }) => s.en);
  const friendlyAsc = Array.from(new Set([l5, l9].flatMap((p) => SIGNS.filter((s) => s.lord === p).map((s) => s.en))));
  const goodYears = Array.from({ length: 80 }, (_, i) => i + 1).filter((a) => [radical, lucky].includes(digitSum(a))).slice(0, 14);
  const rel = NUM_REL[radical];
  return {
    radical,
    lucky,
    friendly: rel.f,
    evil: rel.e,
    goodYears,
    favDays: Array.from(new Set([PLANET_INFO[ll].day, PLANET_INFO[NUM_PLANET[radical]].day, PLANET_INFO[l9].day])),
    favPlanets,
    friendlySigns,
    friendlyAsc,
    god: { Sun: "Surya / Lord Rama", Moon: "Lord Shiva", Mars: "Lord Hanuman / Narsingh", Mercury: "Lord Vishnu / Ganesha", Jupiter: "Lord Vishnu (Narsingh)", Venus: "Goddess Lakshmi", Saturn: "Lord Shani / Hanuman", Rahu: "Goddess Durga", Ketu: "Lord Ganesha" }[ll],
    favStone: PLANET_INFO[ll].gem,
    luckyStone: PLANET_INFO[l9].gem,
    metal: PLANET_INFO[ll].metal,
    color: PLANET_INFO[ll].color2,
    direction: PLANET_INFO[ll].direction,
    time: FAV_TIME[ll],
    donation: DONATION[ll],
    cereals: PLANET_INFO[ll].grain,
    liquids: LIQUID[ll],
  };
}

const GEM_DATA: Record<PlanetId, { ratti: string; finger: string; time: string }> = {
  Sun: { ratti: "3 - 5", finger: "Ring", time: "Sunrise" },
  Moon: { ratti: "4 - 6", finger: "Little", time: "Evening" },
  Mars: { ratti: "6 - 9", finger: "Ring", time: "1 hr after sunrise" },
  Mercury: { ratti: "3 - 6", finger: "Little", time: "2 hrs after sunrise" },
  Jupiter: { ratti: "3 - 5", finger: "Index", time: "Morning" },
  Venus: { ratti: "0.5 - 1 ct", finger: "Middle / Little", time: "Morning" },
  Saturn: { ratti: "4 - 6", finger: "Middle", time: "Evening" },
  Rahu: { ratti: "6 - 9", finger: "Middle", time: "Evening" },
  Ketu: { ratti: "3 - 5", finger: "Little", time: "Midnight" },
};
export function gemTable(c: ChartData) {
  const rows: [string, PlanetId][] = [
    ["Life Stone", SIGNS[c.asc.sign].lord],
    ["Lucky (Bhagya) Stone", houseLord(c, 9)],
    ["Punya Stone", houseLord(c, 5)],
  ];
  return rows.map(([label, id]) => {
    const pi = PLANET_INFO[id];
    const naks = NAKSHATRAS.filter((n) => n.lord === id).map((n) => n.name).join(", ");
    const contra = pi.enemies.filter((e) => !["Rahu", "Ketu"].includes(e)).map((e) => PLANET_INFO[e].gem.split(" (")[0]).join(", ") || "-";
    return { label, stone: pi.gem, planet: id, ratti: GEM_DATA[id].ratti, metal: pi.metal, finger: GEM_DATA[id].finger, day: pi.day, time: GEM_DATA[id].time, naks, mantra: pi.mantra, contra, donation: DONATION[id] };
  });
}

/* ---------------- 5-year predictions ---------------- */
const HOUSE_THEME = ["self and health", "wealth and family", "courage and siblings", "home, mother and property", "children, education and romance", "health, debts and competition", "marriage and partnerships", "sudden changes and hidden matters", "fortune, father and dharma", "career and status", "gains and friendships", "expenses, foreign lands and spirituality"];
const J_GOOD = [2, 5, 7, 9, 11];
const S_GOOD = [3, 6, 11];
const R_GOOD = [3, 6, 10, 11];

export function yearlyPredictions(c: ChartData, startYear: number, years = 5) {
  const moonSign = planet(c, "Moon").sign;
  const out = [];
  for (let k = 0; k < years; k++) {
    const yr = startYear + k;
    const t0 = Date.UTC(yr, 0, 1);
    const t1 = Date.UTC(yr + 1, 0, 1);
    const mid = Date.UTC(yr, 6, 1);
    const tr = (id: PlanetId) => signOf(siderealLon(id, new Date(mid)));
    const jH = houseFrom(moonSign, tr("Jupiter"));
    const sH = houseFrom(moonSign, tr("Saturn"));
    const rH = houseFrom(moonSign, tr("Rahu"));
    const periods: { md: DashaPeriod; ad: DashaPeriod; rating: number }[] = [];
    for (const md of c.dashas) {
      if (md.end < t0 || md.start > t1) continue;
      for (const ad of subPeriods(md)) {
        if (ad.end < t0 || ad.start > t1) continue;
        periods.push({ md, ad, rating: dashaPrediction(c, [md.lord, ad.lord], ad, t0).rating });
      }
    }
    const avg = periods.length ? periods.reduce((a, b) => a + b.rating, 0) / periods.length : 3;
    let score = avg * 20 + (J_GOOD.includes(jH) ? 8 : -4) + (S_GOOD.includes(sH) ? 6 : [12, 1, 2, 8].includes(sH) ? -8 : 0) + (R_GOOD.includes(rH) ? 4 : 0);
    score = Math.max(20, Math.min(95, Math.round(score)));
    const sade = [12, 1, 2].includes(sH);
    const main = periods[0];
    const ll = SIGNS[c.asc.sign].lord;
    const careerGood = score >= 60;
    const pText = periods.map((p) => `${p.md.lord}-${p.ad.lord} (${dmy(Math.max(p.ad.start, t0), c.tzOffsetMin)} to ${dmy(Math.min(p.ad.end, t1), c.tzOffsetMin)})`).join(", ");
    const overview = `During ${yr} you will be running ${pText}. Transit Jupiter moves through your ${jH}${ord(jH)} house from the Moon (${HOUSE_THEME[jH - 1]}), ${J_GOOD.includes(jH) ? "a favourable position bringing growth, support from elders and good opportunities" : "a less supportive position, so expansion needs patience and careful planning"}. Saturn transits your ${sH}${ord(sH)} house from the Moon (${HOUSE_THEME[sH - 1]})${sade ? " and Shani Sade Sati is active, demanding discipline, hard work and patience" : S_GOOD.includes(sH) ? ", rewarding steady effort with lasting gains" : ", asking for responsibility and realistic goals"}.`;
    const career = careerGood
      ? `Career prospects are encouraging. ${main ? `The ${main.ad.lord} sub-period activates ${PLANET_INFO[main.ad.lord].karaka.split(",").slice(0, 2).join(" and").toLowerCase()}` : "Planetary periods support progress"}; recognition, new responsibilities or a change for the better are indicated, especially ${J_GOOD.includes(jH) ? "when Jupiter's support peaks" : "in the second half of the year"}.`
      : `Professional life needs steady effort. Avoid hasty job changes and conflicts with seniors; focus on skill-building. Results improve when ${ll}, your Lagna lord, is strengthened through its remedies.`;
    const finance = [2, 11].includes(jH) || score >= 65 ? "Financial inflow is good with chances of savings and gains through your own efforts and network. Investments made with proper advice can prosper." : "Expenses may rise; plan budgets carefully, avoid speculation and lending large sums. Keep an emergency reserve.";
    const health = [6, 8, 12].includes(sH) || sade ? "Pay attention to health, rest and routine. Stress, joint or digestive issues may need care; regular exercise, yoga and timely check-ups are advised." : "Health remains generally stable. Maintain a disciplined diet and exercise routine to keep vitality high.";
    const relations = [5, 7, 9, 11].includes(jH) ? "Relationships and family life are harmonious. Auspicious events, marriage or celebrations in the family are possible; support from friends and elders increases." : "Some misunderstandings in family or partnerships are possible; patient communication and respect for elders keep harmony.";
    const children = [5, 9, 11].includes(jH) ? "Children, education and creative plans receive Jupiter's support. This is favourable for conception planning, examinations and children's progress, subject to the natal 5th house and individual circumstances." : [5].includes(sH) ? "Responsibilities connected with children or education increase. Avoid pressure and give progress enough time." : "Children and education matters remain broadly steady; use consistent guidance rather than force.";
    const competition = S_GOOD.includes(sH) || [3, 6, 10, 11].includes(rH) ? "Career competition, interviews, examinations and disputes can be handled successfully through discipline. Avoid arrogance and document every commitment." : "Competition requires preparation and patience. Avoid unnecessary litigation, office politics and confrontational decisions.";
    const travel = [3, 9, 12].includes(jH) || [3, 9, 12].includes(rH) ? "Long-distance travel, foreign links, pilgrimage or a transfer is possible. Keep documents, visas and schedules ready and avoid rushed bookings." : "Travel remains mostly routine. Transfers are more likely through work requirements than personal choice.";
    const religion = [5, 9, 12].includes(jH) ? "Religious study, pilgrimage, charity and guidance from teachers are favoured. Choose sincere practice over show or superstition." : "Spiritual progress comes through regular prayer, service and self-discipline rather than dramatic rituals.";
    out.push({ year: yr, score, periods: pText, jH, sH, rH, sade, overview, career, finance, health, relations, children, competition, travel, religion });
  }
  return out;
}
function ord(n: number) {
  return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
}

/* ---------------- Life predictions (Physique, Health, Education, ...) ---------------- */
const PHYSIQUE = [
  "medium stature, a lean and muscular body, a wheatish or ruddy complexion, prominent forehead and eyebrows, quick movements and a sharp gaze; minor marks on the head or face are common",
  "a well-built, sturdy body with a broad face, thick neck, attractive eyes and a pleasant smile, with a tendency to gain weight in later years and a graceful, steady walk",
  "a tall, slim and upright body with long arms, expressive hands, bright eyes and youthful looks that last long, along with an active nervous constitution",
  "medium height, a round face, a fair complexion, soft features and expressive eyes, with a tendency to put on weight around the middle",
  "a commanding presence with broad shoulders and chest, a strong bone structure, thick hair, a majestic walk and a confident, radiant face",
  "a slim, well-proportioned body, sharp features and intelligent eyes, neat habits and an appearance younger than the actual age",
  "a tall, graceful and well-balanced body, attractive features, a pleasant smile and refined manners",
  "a compact, strong body, penetrating eyes, thick eyebrows and a magnetic, intense personality with great endurance",
  "a tall, well-developed athletic body, a long face, broad forehead and bright eyes, with an energetic gait and an open, cheerful look",
  "a lean, bony frame with prominent joints, a thin face and a serious expression; you mature early and look younger as years pass",
  "a tall, well-built body with distinctive features, a clear complexion, calm eyes and a friendly yet detached demeanour",
  "short to medium height, a soft body, large expressive eyes, a gentle face and small hands and feet, with a dreamy, kind expression",
];
const EDU_FIELDS: Record<PlanetId, string> = {
  Sun: "administration, political science, medicine and management",
  Moon: "nursing, hospitality, psychology and fine arts",
  Mars: "engineering, defence, surgery, sports and technical subjects",
  Mercury: "commerce, mathematics, accountancy, IT and languages",
  Jupiter: "law, finance, teaching, philosophy and economics",
  Venus: "arts, design, media, fashion and music",
  Saturn: "engineering, history, law, geology and research",
  Rahu: "computer science, aviation, foreign languages and research",
  Ketu: "research, programming, mathematics and occult sciences",
};
const goodH = (h: number) => [1, 2, 4, 5, 7, 9, 10, 11].includes(h);

function periodWindows(c: ChartData, lords: PlanetId[], minAge: number, maxAge: number, max = 4) {
  const birth = Date.parse(c.utc);
  const out: string[] = [];
  for (const md of c.dashas)
    for (const ad of subPeriods(md)) {
      const age = (ad.start - birth) / YEAR_MS;
      if (age < minAge || age > maxAge || !lords.includes(ad.lord)) continue;
      out.push(`${md.lord}-${ad.lord} (${dmy(ad.start, c.tzOffsetMin)} to ${dmy(ad.end, c.tzOffsetMin)})`);
      if (out.length >= max) return out;
    }
  return out;
}

export function lifePredictions(c: ChartData) {
  const L = (h: number) => houseLord(c, h);
  const P = (id: PlanetId) => planet(c, id);
  const asc = c.asc.sign;
  const ll = L(1);
  const llp = P(ll);
  const moon = P("Moon");
  const inH = (h: number) => c.planets.filter((p) => p.house === h).map((p) => p.id);
  const dg = (id: PlanetId) => dignity(id, P(id).sign, P(id).deg, c);
  const strongD = (id: PlanetId) => ["Exalted", "Moolatrikona", "Own Sign", "Great Friend's Sign", "Friend's Sign"].includes(dg(id));
  const female = c.input.gender === "female";
  const sections: { title: string; paras: string[] }[] = [];

  sections.push({
    title: "Physique",
    paras: [
      `With ${SIGNS[asc].en} rising, you are blessed with ${PHYSIQUE[asc]}. Your Lagna lord ${ll} is placed in the ${llp.house}${ord(llp.house)} house in ${SIGNS[llp.sign].en} (${dg(ll)}), ${strongD(ll) ? "which adds vitality, stamina and an impressive appearance" : "so maintaining fitness and posture will enhance your personality"}.`,
      inH(1).length ? `Planets in the Ascendant (${inH(1).join(", ")}) strongly shape your looks: ${inH(1).map((p) => ({ Sun: "a commanding aura", Moon: "a soft, attractive face", Mars: "an athletic build and possible marks on the head", Mercury: "youthful looks", Jupiter: "a dignified, well-fed body", Venus: "charm and beauty", Saturn: "a lean, serious look", Rahu: "an unusual, magnetic appearance", Ketu: "a thin body and piercing eyes" })[p]).join(", ")}.` : "Your Ascendant is free of planets, so the Lagna lord governs your physical appearance.",
    ],
  });

  sections.push({
    title: "Health & Nature",
    paras: [
      `By nature you are ${SIGNS[moon.sign].archetype.charAt(0).toLowerCase() + SIGNS[moon.sign].archetype.slice(1)} Your birth star ${NAKSHATRAS[moon.nak].name} makes you ${NAKSHATRAS[moon.nak].traits.charAt(0).toLowerCase() + NAKSHATRAS[moon.nak].traits.slice(1)}`,
      `Health: sensitive areas are the ${SIGNS[asc].body.toLowerCase()} (Lagna) and ${SIGNS[(asc + 5) % 12].body.toLowerCase()} (6th house). The 6th lord ${L(6)} is in the ${P(L(6)).house}${ord(P(L(6)).house)} house${inH(6).length ? ` and ${inH(6).join(", ")} occupy the 6th` : ""}. ${strongD(ll) && strongD("Sun") ? "Good recuperative power is indicated." : "A disciplined routine, adequate sleep and regular exercise are essential for lasting vitality."}`,
    ],
  });

  const l4 = L(4);
  const l5 = L(5);
  const eduGood = goodH(P(l4).house) && goodH(P(l5).house);
  sections.push({
    title: "Education",
    paras: [
      `The 4th lord ${l4} (basic education) is in the ${P(l4).house}${ord(P(l4).house)} house and the 5th lord ${l5} (intellect) is in the ${P(l5).house}${ord(P(l5).house)} house. ${eduGood ? "This promises a good academic record and a sharp, retentive mind." : "Education may face interruptions or changes of stream, but persistence brings success."} Mercury is ${dg("Mercury")} and Jupiter is ${dg("Jupiter")}.`,
      `Suitable subjects: ${EDU_FIELDS[l5]}; also ${EDU_FIELDS["Mercury" === l5 ? "Jupiter" : "Mercury"]}. Higher education is governed by the 9th lord ${L(9)} in the ${P(L(9)).house}${ord(P(L(9)).house)} house${[9, 12].includes(P(L(9)).house) || [9, 12].includes(P("Rahu").house) ? ", with chances of studying far from home or abroad" : ""}.`,
    ],
  });

  const mGood = goodH(P(l4).house) && !["Debilitated", "Enemy's Sign", "Great Enemy's Sign"].includes(dg("Moon"));
  sections.push({
    title: "Mother",
    paras: [
      `The Moon (significator of mother) is in ${SIGNS[moon.sign].en}, ${dg("Moon")}, in the ${moon.house}${ord(moon.house)} house, and the 4th lord ${l4} is in the ${P(l4).house}${ord(P(l4).house)} house. ${mGood ? "Your mother is caring, influential and supportive, and you share a close emotional bond; she contributes significantly to your progress." : "Your mother is devoted but may face some health or emotional stress; your support and care strengthen the bond."}${inH(4).some((p) => ["Saturn", "Rahu", "Ketu", "Mars"].includes(p)) ? ` Malefics in the 4th (${inH(4).filter((p) => ["Saturn", "Rahu", "Ketu", "Mars"].includes(p)).join(", ")}) suggest occasional differences or distance from home.` : ""}`,
    ],
  });

  const propW = periodWindows(c, [l4, "Venus", "Mars"], 24, 55, 3);
  sections.push({
    title: "Conveyance & Property",
    paras: [
      `The 4th lord ${l4} in the ${P(l4).house}${ord(P(l4).house)} house, Venus (vehicles) ${dg("Venus")} and Mars (land) ${dg("Mars")} describe your assets. ${goodH(P(l4).house) ? "You are likely to own a comfortable house and good vehicles, with property gains through your own efforts and family support." : "Property comes after effort and some delays; avoid disputed land and verify documents carefully."}`,
      propW.length ? `Favourable periods for property or vehicles: ${propW.join("; ")}.` : "",
    ].filter(Boolean),
  });

  const childW = periodWindows(c, [l5, "Jupiter"], 22, 42, 3);
  sections.push({
    title: "Love Life & Children",
    paras: [
      `The 5th house (romance and children) falls in ${SIGNS[(asc + 4) % 12].en} with its lord ${l5} in the ${P(l5).house}${ord(P(l5).house)} house${inH(5).length ? ` and ${inH(5).join(", ")} placed there` : ""}. Venus is in ${SIGNS[P("Venus").sign].en} (${dg("Venus")}). ${goodH(P(l5).house) ? "Your love life is warm and expressive and children bring joy and pride." : "Emotions run deep; patience in love is important and children may come after some delay."}`,
      `Jupiter, the significator of children, is ${dg("Jupiter")} in the ${P("Jupiter").house}${ord(P("Jupiter").house)} house.${childW.length ? ` Favourable periods for progeny: ${childW.join("; ")}.` : ""}`,
    ],
  });

  const l7 = L(7);
  const d9l7 = SIGNS[(c.asc.d9 + 6) % 12].lord;
  const marW = periodWindows(c, [l7, "Venus", female ? "Jupiter" : "Venus", "Rahu"], 21, 36, 4);
  sections.push({
    title: "Family Life & Marriage",
    paras: [
      `The 2nd lord ${L(2)} (family) is in the ${P(L(2)).house}${ord(P(L(2)).house)} house and the 7th lord ${l7} (spouse) is in the ${P(l7).house}${ord(P(l7).house)} house${inH(7).length ? `, with ${inH(7).join(", ")} in the 7th` : ""}. ${goodH(P(l7).house) ? "Married life is harmonious with a capable, supportive partner." : "Married life needs mutual understanding and adjustment; patience strengthens the bond."} In the Navamsa, the 7th lord is ${d9l7}, indicating a partner with ${PLANET_INFO[d9l7].karaka.split(",").slice(0, 3).join(",").toLowerCase()} qualities.`,
      marW.length ? `Probable periods for marriage: ${marW.join("; ")}.` : "",
    ].filter(Boolean),
  });
  return sections;
}

/* ---------------- Manglik (Lagna/Moon/Venus: 1,4,7,8,12) ---------------- */
export function manglikAnalysis(c: ChartData) {
  const mars = planet(c, "Mars");
  const H = [1, 4, 7, 8, 12];
  const fromL = mars.house;
  const fromM = houseFrom(planet(c, "Moon").sign, mars.sign);
  const fromV = houseFrom(planet(c, "Venus").sign, mars.sign);
  const hits = [
    ["Lagna", fromL],
    ["Moon", fromM],
    ["Venus", fromV],
  ].filter(([, h]) => H.includes(h as number)) as [string, number][];
  const cancel: string[] = [];
  if ([0, 7, 9].includes(mars.sign)) cancel.push("Mars is in its own or exaltation sign");
  const jup = planet(c, "Jupiter");
  if (jup.sign === mars.sign || [5, 7, 9].includes(houseFrom(jup.sign, mars.sign))) cancel.push("Jupiter aspects or conjoins Mars");
  if (mars.sign === 3 || mars.sign === 4) cancel.push("Mars is in Cancer or Leo");
  const present = hits.length > 0;
  return {
    fromL,
    fromM,
    fromV,
    hits,
    cancel,
    result: !present ? "Not Manglik" : cancel.length ? "Manglik dosha present but cancelled / reduced" : hits.length >= 2 ? "High Manglik" : "Low Manglik",
    text: !present
      ? `Mars is in the ${fromL}${ord(fromL)} house from the Lagna, ${fromM}${ord(fromM)} from the Moon and ${fromV}${ord(fromV)} from Venus. None of these are Manglik positions, hence your horoscope does not have Manglik Dosha.`
      : `Mars occupies a Manglik position from ${hits.map(([k, h]) => `the ${k} (${h}${ord(h)} house)`).join(", ")}. ${cancel.length ? `However the dosha is mitigated because ${cancel.join("; ")}. Its effect on married life is mild.` : "No cancellation is found; matching with a partner having similar Mangal Dosha and performing Mangal Shanti is advisable."}`,
  };
}

export { dignity };
