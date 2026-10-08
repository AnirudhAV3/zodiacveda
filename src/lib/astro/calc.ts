import * as A from "astronomy-engine";
import { DASHA_ORDER, NAKSHATRAS, NITYA_YOGAS, PLANET_INFO, PLANETS, SIGNS, TITHIS, WEEKDAYS, type PlanetId } from "./data";

export interface BirthInput {
  name: string;
  gender: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  place: string;
  lat: number;
  lon: number;
  tz: string; // IANA or UTC+05:30
  style: "north" | "south";
}

export interface PlanetPos {
  id: PlanetId;
  lon: number; // sidereal
  sign: number;
  deg: number;
  nak: number;
  pada: number;
  speed: number; // deg/day
  retro: boolean;
  house: number;
  d9: number;
  d10: number;
  mag: number | null;
  combust: boolean;
  lat: number;
  tropLon: number;
  kranti: number; // declination from sayana longitude (deg, +N)
  cheshtaKendra: number | null; // 0..180 (180 = retrograde peak)
  vargas: { d2: number; d3: number; d7: number; d9: number; d12: number; d30: number };
}

export interface SunTimes {
  riseMs: number | null;
  setMs: number | null;
  nextRiseMs: number | null;
  hourAngle: number; // Sun's hour angle at birth, deg, -180..180 (0 = local noon)
  isDay: boolean;
  abdaWeekday?: number; // weekday (0=Sun) on which current solar year (Mesha sankranti) began
  masaWeekday?: number; // weekday on which current solar month (sankranti into Sun's sign) began
}

export interface DashaPeriod {
  lord: PlanetId;
  start: number; // ms epoch
  end: number;
}

export interface ChartData {
  input: BirthInput;
  utc: string;
  tzOffsetMin: number;
  jd: number;
  ayanamsa: number;
  asc: { lon: number; sign: number; deg: number; nak: number; pada: number; d9: number; d10: number };
  mc: number;
  sunTimes: SunTimes;
  planets: PlanetPos[];
  dashas: DashaPeriod[];
  dashaBalance: { lord: PlanetId; years: number };
  panchang: { tithi: string; paksha: string; tithiNum: number; yoga: string; karana: string; vaar: string; vaarIndex: number; sunrise: string | null; sunset: string | null };
}

const norm = (x: number) => ((x % 360) + 360) % 360;
const D2R = Math.PI / 180;
export const YEAR_MS = 365.25 * 86400000;

/* ---------- time zone helpers ---------- */
function parseFixedOffset(tz: string): number | null {
  const m = tz.trim().match(/^(?:UTC|GMT)?\s*([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2]) * 60 + parseInt(m[3] || "0"));
}

export function tzOffsetMinutes(tz: string, utcMs: number): number {
  const fixed = parseFixedOffset(tz);
  if (fixed !== null) return fixed;
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const parts: Record<string, number> = {};
  for (const p of fmt.formatToParts(new Date(utcMs))) if (p.type !== "literal") parts[p.type] = parseInt(p.value);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second);
  return Math.round((asUtc - utcMs) / 60000);
}

export function localToUtc(date: string, time: string, tz: string): { utc: number; offset: number } {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi, se] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi || 0, se || 0);
  let off = tzOffsetMinutes(tz, guess);
  let utc = guess - off * 60000;
  off = tzOffsetMinutes(tz, utc);
  utc = guess - off * 60000;
  return { utc, offset: off };
}

/* ---------- astronomy ---------- */
function julianDay(ms: number) {
  return ms / 86400000 + 2440587.5;
}

export function lahiriAyanamsa(jd: number, withNutation = true) {
  const T = (jd - 2451545.0) / 36525;
  let ay = 23.85709 + (5028.796195 * T + 1.1054348 * T * T) / 3600;
  if (withNutation) {
    const om = norm(125.04452 - 1934.136261 * T) * D2R;
    const L = norm(280.4665 + 36000.7698 * T) * D2R;
    const Lp = norm(218.3165 + 481267.8813 * T) * D2R;
    const dpsi = -17.2 * Math.sin(om) - 1.32 * Math.sin(2 * L) - 0.23 * Math.sin(2 * Lp) + 0.21 * Math.sin(2 * om);
    ay += dpsi / 3600;
  }
  return ay;
}

const BODY: Partial<Record<PlanetId, A.Body>> = { Sun: A.Body.Sun, Moon: A.Body.Moon, Mars: A.Body.Mars, Mercury: A.Body.Mercury, Jupiter: A.Body.Jupiter, Venus: A.Body.Venus, Saturn: A.Body.Saturn };

function tropical(id: PlanetId, date: Date): { lon: number; lat: number } {
  if (id === "Moon") {
    const s = A.EclipticGeoMoon(date);
    return { lon: s.lon, lat: s.lat };
  }
  if (id === "Sun") {
    const s = A.SunPosition(date);
    return { lon: s.elon, lat: s.elat };
  }
  if (id === "Rahu" || id === "Ketu") {
    const jd = julianDay(date.getTime());
    const T = (jd - 2451545.0) / 36525;
    const om = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441 - (T * T * T * T) / 60616000;
    const l = norm(om + (id === "Ketu" ? 180 : 0));
    return { lon: l, lat: 0 };
  }
  const v = A.GeoVector(BODY[id]!, date, true);
  const e = A.Ecliptic(v);
  return { lon: e.elon, lat: e.elat };
}

export function siderealLon(id: PlanetId, date: Date): number {
  const jd = julianDay(date.getTime());
  const isNode = id === "Rahu" || id === "Ketu";
  return norm(tropical(id, date).lon - lahiriAyanamsa(jd, !isNode));
}

export function ascendantTropical(date: Date, lat: number, lon: number) {
  const jd = julianDay(date.getTime());
  const T = (jd - 2451545.0) / 36525;
  const gast = A.SiderealTime(date); // hours
  const ramc = norm(gast * 15 + lon) * D2R;
  const eps = (23.4392911 - 0.0130042 * T) * D2R;
  const phi = lat * D2R;
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  return norm(asc / D2R);
}

export function mcTropical(date: Date, lon: number) {
  const jd = julianDay(date.getTime());
  const T = (jd - 2451545.0) / 36525;
  const ramc = norm(A.SiderealTime(date) * 15 + lon) * D2R;
  const eps = (23.4392911 - 0.0130042 * T) * D2R;
  return norm(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / D2R);
}

export const signOf = (lon: number) => Math.floor(norm(lon) / 30);
export const nakOf = (lon: number) => Math.floor(norm(lon) / (360 / 27));
export const padaOf = (lon: number) => Math.floor((norm(lon) % (360 / 27)) / (360 / 108)) + 1;
export const d9Of = (lon: number) => Math.floor(norm(lon) / (30 / 9)) % 12;
export function d10Of(lon: number) {
  const s = signOf(lon);
  const part = Math.floor((norm(lon) % 30) / 3);
  return s % 2 === 0 ? (s + part) % 12 : (s + 8 + part) % 12;
}

export function d2Of(lon: number) {
  const s = signOf(lon);
  const first = norm(lon) % 30 < 15;
  return s % 2 === 0 ? (first ? 4 : 3) : first ? 3 : 4;
}
export const d3Of = (lon: number) => (signOf(lon) + 4 * Math.floor((norm(lon) % 30) / 10)) % 12;
export function d7Of(lon: number) {
  const s = signOf(lon);
  const part = Math.floor((norm(lon) % 30) / (30 / 7));
  return s % 2 === 0 ? (s + part) % 12 : (s + 6 + part) % 12;
}
export const d12Of = (lon: number) => (signOf(lon) + Math.floor((norm(lon) % 30) / 2.5)) % 12;
export function d30Of(lon: number) {
  const s = signOf(lon);
  const d = norm(lon) % 30;
  if (s % 2 === 0) return d < 5 ? 0 : d < 10 ? 10 : d < 18 ? 8 : d < 25 ? 2 : 6;
  return d < 5 ? 1 : d < 12 ? 5 : d < 20 ? 11 : d < 25 ? 9 : 7;
}

function sunIngressBefore(targetDeg: number, beforeMs: number) {
  const diff = (t: number) => ((siderealLon("Sun", new Date(t)) - targetDeg + 540) % 360) - 180;
  const back = ((siderealLon("Sun", new Date(beforeMs)) - targetDeg + 360) % 360) / 0.9856;
  let lo = beforeMs - (back + 3) * 86400000;
  let hi = beforeMs;
  if (diff(lo) >= 0) lo -= 5 * 86400000;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    if (diff(m) >= 0) hi = m;
    else lo = m;
  }
  return hi;
}

/** Weekday on which a sankranti "begins" the solar period: Vedic day (sunrise to sunrise); if it falls after sunset the period starts the next day. */
function sankrantiWeekday(ms: number, lat: number, lon: number, offsetMin: number) {
  const local = new Date(ms + offsetMin * 60000);
  let wd = local.getUTCDay();
  try {
    const obs = new A.Observer(lat, lon, 0);
    const dayStart = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - offsetMin * 60000;
    const rise = A.SearchRiseSet(A.Body.Sun, obs, +1, new Date(dayStart), 1);
    const set = A.SearchRiseSet(A.Body.Sun, obs, -1, new Date(dayStart), 1);
    // Before sunrise: it is the night of the previous Vedic day, so the period begins on this civil day (wd unchanged).
    // After sunset: the period begins on the next day.
    if (!(rise && ms < rise.date.getTime()) && set && ms >= set.date.getTime()) wd = (wd + 1) % 7;
  } catch {
    /* ignore */
  }
  return wd;
}

/** Surya-Siddhanta Cheshta Kendra = Seeghrochcha − (mean + true)/2, reduced to 0–180°. */
const MEAN_L: Record<string, [number, number]> = {
  Sun: [280.46646, 36000.76983],
  Mercury: [252.250906, 149472.6746358],
  Venus: [181.979801, 58517.815676],
  Mars: [355.433275, 19140.2993313],
  Jupiter: [34.351484, 3034.9056746],
  Saturn: [50.077471, 1222.1137943],
};
function cheshtaKendraSS(id: PlanetId, T: number, trueTropLon: number): number | null {
  if (!MEAN_L[id] || id === "Sun") return null;
  const L = (k: string) => norm(MEAN_L[k][0] + MEAN_L[k][1] * T);
  const sun = L("Sun");
  const inferior = id === "Mercury" || id === "Venus";
  const seeghra = inferior ? L(id) : sun;
  const mean = inferior ? sun : L(id);
  let ck = norm(seeghra - (mean + trueTropLon) / 2);
  if (ck > 180) ck = 360 - ck;
  return ck;
}

const COMBUST: Partial<Record<PlanetId, number>> = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };

export function angDist(a: number, b: number) {
  const d = Math.abs(norm(a) - norm(b));
  return d > 180 ? 360 - d : d;
}

/* ---------- dasha ---------- */
export function vimshottari(moonLon: number, birthMs: number) {
  const span = 360 / 27;
  const n = nakOf(moonLon);
  const frac = (norm(moonLon) % span) / span;
  let idx = n % 9;
  const first = DASHA_ORDER[idx];
  const firstYears = PLANET_INFO[first].years;
  let start = birthMs - frac * firstYears * YEAR_MS;
  const periods: DashaPeriod[] = [];
  while (start < birthMs + 125 * YEAR_MS) {
    const lord = DASHA_ORDER[idx % 9];
    const end = start + PLANET_INFO[lord].years * YEAR_MS;
    periods.push({ lord, start, end });
    start = end;
    idx++;
  }
  return { periods, balance: { lord: first, years: firstYears * (1 - frac) } };
}

export function subPeriods(parent: DashaPeriod): DashaPeriod[] {
  const total = parent.end - parent.start;
  let i = DASHA_ORDER.indexOf(parent.lord);
  let s = parent.start;
  const out: DashaPeriod[] = [];
  for (let k = 0; k < 9; k++) {
    const lord = DASHA_ORDER[(i + k) % 9];
    const len = (total * PLANET_INFO[lord].years) / 120;
    out.push({ lord, start: s, end: s + len });
    s += len;
  }
  i = 0;
  return out;
}

/* ---------- main ---------- */
export function computeChart(input: BirthInput): ChartData {
  const { utc, offset } = localToUtc(input.date, input.time, input.tz);
  const date = new Date(utc);
  const jd = julianDay(utc);
  const ayan = lahiriAyanamsa(jd);

  const ascLon = norm(ascendantTropical(date, input.lat, input.lon) - ayan);
  const ascSign = signOf(ascLon);

  const sunLon = siderealLon("Sun", date);
  const T = (jd - 2451545.0) / 36525;
  const eps = 23.4392911 - 0.0130042 * T;
  const planets: PlanetPos[] = PLANETS.map((id) => {
    const t = tropical(id, date);
    const lon = siderealLon(id, date);
    const before = siderealLon(id, new Date(utc - 43200000));
    const after = siderealLon(id, new Date(utc + 43200000));
    let speed = after - before;
    if (speed > 180) speed -= 360;
    if (speed < -180) speed += 360;
    const sign = signOf(lon);
    let mag: number | null = null;
    const b = BODY[id];
    if (b !== undefined) {
      try {
        mag = A.Illumination(b, date).mag;
      } catch {
        mag = null;
      }
    }
    const cDeg = COMBUST[id];
    const orb = id === "Mercury" && speed < 0 ? 12 : id === "Venus" && speed < 0 ? 8 : cDeg;
    return {
      id,
      lon,
      sign,
      deg: lon % 30,
      nak: nakOf(lon),
      pada: padaOf(lon),
      speed,
      retro: id === "Rahu" || id === "Ketu" ? true : speed < 0,
      house: ((sign - ascSign + 12) % 12) + 1,
      d9: d9Of(lon),
      d10: d10Of(lon),
      mag,
      combust: orb !== undefined && id !== "Sun" ? angDist(lon, sunLon) < orb : false,
      lat: t.lat,
      tropLon: t.lon,
      kranti: Math.asin(Math.sin(eps * D2R) * Math.sin(t.lon * D2R)) / D2R,
      cheshtaKendra: b !== undefined && !["Sun", "Moon"].includes(id) ? cheshtaKendraSS(id, T, t.lon) : null,
      vargas: { d2: d2Of(lon), d3: d3Of(lon), d7: d7Of(lon), d9: d9Of(lon), d12: d12Of(lon), d30: d30Of(lon) },
    };
  });

  const moon = planets.find((p) => p.id === "Moon")!;
  const { periods, balance } = vimshottari(moon.lon, utc);

  // panchang
  const diff = norm(moon.lon - sunLon);
  const tithiIdx = Math.floor(diff / 12);
  const paksha = tithiIdx < 15 ? "Shukla" : "Krishna";
  const tithiName = tithiIdx === 29 ? "Amavasya" : TITHIS[tithiIdx % 15];
  const yogaIdx = Math.floor(norm(moon.lon + sunLon) / (360 / 27));
  const k = Math.floor(diff / 6);
  const movable = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];
  const karana = k === 0 ? "Kimstughna" : k === 57 ? "Shakuni" : k === 58 ? "Chatushpada" : k === 59 ? "Naga" : movable[(k - 1) % 7];

  let sunrise: string | null = null;
  let sunset: string | null = null;
  let riseMs: number | null = null;
  let setMs: number | null = null;
  let nextRiseMs: number | null = null;
  let hourAngle = 0;
  const [y, mo, d] = input.date.split("-").map(Number);
  let weekday = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  const localTime = (ms: number) => new Date(ms + offset * 60000).toISOString().slice(11, 16);
  try {
    const obs = new A.Observer(input.lat, input.lon, 0);
    const eq = A.Equator(A.Body.Sun, date, obs, true, true);
    const lst = A.SiderealTime(date) + input.lon / 15;
    hourAngle = norm((lst - eq.ra) * 15 + 180) - 180;
    const r = A.SearchRiseSet(A.Body.Sun, obs, +1, new Date(utc - 86400000), 1.2);
    if (r) {
      // last sunrise at or before birth
      let rise = r.date.getTime();
      if (rise > utc) {
        const r0 = A.SearchRiseSet(A.Body.Sun, obs, +1, new Date(utc - 2 * 86400000), 1);
        if (r0) rise = r0.date.getTime();
      }
      riseMs = rise;
      const st = A.SearchRiseSet(A.Body.Sun, obs, -1, new Date(rise), 1);
      setMs = st ? st.date.getTime() : null;
      const nr = A.SearchRiseSet(A.Body.Sun, obs, +1, new Date(rise + 3600000), 1.2);
      nextRiseMs = nr ? nr.date.getTime() : null;
      const riseLocal = new Date(rise + offset * 60000);
      weekday = riseLocal.getUTCDay();
    }
    // sunrise/sunset of civil birth date for display
    const dayStart = Date.UTC(y, mo - 1, d) - offset * 60000;
    const rr = A.SearchRiseSet(A.Body.Sun, obs, +1, new Date(dayStart), 1);
    const ss = A.SearchRiseSet(A.Body.Sun, obs, -1, new Date(dayStart), 1);
    if (rr) sunrise = localTime(rr.date.getTime());
    if (ss) sunset = localTime(ss.date.getTime());
  } catch {
    /* polar regions */
  }
  const isDay = riseMs !== null && setMs !== null ? utc >= riseMs && utc < setMs : Math.abs(hourAngle) < 90;
  const mcLon = norm(mcTropical(date, input.lon) - ayan);

  return {
    input,
    utc: date.toISOString(),
    tzOffsetMin: offset,
    jd,
    ayanamsa: ayan,
    asc: { lon: ascLon, sign: ascSign, deg: ascLon % 30, nak: nakOf(ascLon), pada: padaOf(ascLon), d9: d9Of(ascLon), d10: d10Of(ascLon) },
    mc: mcLon,
    sunTimes: {
      riseMs,
      setMs,
      nextRiseMs,
      hourAngle,
      isDay,
      abdaWeekday: sankrantiWeekday(sunIngressBefore(0, utc), input.lat, input.lon, offset),
      masaWeekday: sankrantiWeekday(sunIngressBefore(signOf(sunLon) * 30, utc), input.lat, input.lon, offset),
    },
    planets,
    dashas: periods,
    dashaBalance: balance,
    panchang: { tithi: tithiName, paksha, tithiNum: tithiIdx + 1, yoga: NITYA_YOGAS[yogaIdx], karana, vaar: WEEKDAYS[weekday], vaarIndex: weekday, sunrise, sunset },
  };
}

export function currentTransits(): Record<PlanetId, number> {
  const now = new Date();
  const out = {} as Record<PlanetId, number>;
  for (const id of PLANETS) out[id] = siderealLon(id, now);
  return out;
}

export function fmtDeg(x: number) {
  const d = Math.floor(x);
  const mFloat = (x - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.floor((mFloat - m) * 60);
  return `${d}°${String(m).padStart(2, "0")}'${String(s).padStart(2, "0")}"`;
}
export function fmtDegShort(x: number) {
  const d = Math.floor(x);
  const m = Math.floor((x - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}'`;
}

export { SIGNS, NAKSHATRAS };
