import * as A from "astronomy-engine";
import { ascendantTropical, localToUtc, mcTropical, type BirthInput } from "@/lib/astro/calc";
import {
  ASPECT_ANGLE,
  ASPECT_NATURE,
  ASPECT_ORBS,
  BODY_META,
  SIGN_ELEMENT,
  SIGN_MODE,
  SIGN_NAMES,
  SIGN_RULER,
  WESTERN_BODIES,
  type WesternBody,
} from "./data";

const D2R = Math.PI / 180;
const norm = (x: number) => ((x % 360) + 360) % 360;
const jdOf = (ms: number) => ms / 86400000 + 2440587.5;

export const signOf = (lon: number) => Math.floor(norm(lon) / 30);
export const degInSign = (lon: number) => norm(lon) % 30;
export function angDist(a: number, b: number) {
  const d = Math.abs(norm(a) - norm(b));
  return d > 180 ? 360 - d : d;
}

const BODY: Partial<Record<WesternBody, A.Body>> = {
  Sun: A.Body.Sun,
  Moon: A.Body.Moon,
  Mercury: A.Body.Mercury,
  Venus: A.Body.Venus,
  Mars: A.Body.Mars,
  Jupiter: A.Body.Jupiter,
  Saturn: A.Body.Saturn,
  Uranus: A.Body.Uranus,
  Neptune: A.Body.Neptune,
  Pluto: A.Body.Pluto,
};

function tropical(id: WesternBody, date: Date): { lon: number; lat: number } {
  if (id === "Moon") {
    const s = A.EclipticGeoMoon(date);
    return { lon: s.lon, lat: s.lat };
  }
  if (id === "Sun") {
    const s = A.SunPosition(date);
    return { lon: s.elon, lat: s.elat };
  }
  if (id === "North Node" || id === "South Node") {
    const T = (jdOf(date.getTime()) - 2451545.0) / 36525;
    const om = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441;
    const lon = norm(om);
    return { lon: id === "South Node" ? norm(lon + 180) : lon, lat: 0 };
  }
  const v = A.GeoVector(BODY[id]!, date, true);
  const e = A.Ecliptic(v);
  return { lon: e.elon, lat: e.elat };
}

function porphyryCusps(asc: number, mc: number) {
  const ic = norm(mc + 180);
  const dsc = norm(asc + 180);
  const third = (a: number, b: number, k: number) => norm(a + (norm(b - a) * k) / 3);
  return [
    asc,
    third(asc, ic, 1),
    third(asc, ic, 2),
    ic,
    third(ic, dsc, 1),
    third(ic, dsc, 2),
    dsc,
    third(dsc, norm(mc + 360), 1),
    third(dsc, mc, 2),
    mc,
    third(mc, norm(asc + 360), 1),
    third(mc, asc, 2),
  ].map(norm);
}

export function houseCusps(date: Date, lat: number, lon: number): { system: "Placidus" | "Porphyry"; cusps: number[]; asc: number; mc: number; dsc: number; ic: number } {
  const asc = ascendantTropical(date, lat, lon);
  const mc = mcTropical(date, lon);
  const cusps = porphyryCusps(asc, mc);
  return { system: "Porphyry", cusps, asc, mc, dsc: cusps[6], ic: cusps[3] };
}

export function houseOf(lon: number, cusps: number[]) {
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    const span = norm(b - a);
    const d = norm(lon - a);
    if (d < span || span < 1e-9) return i + 1;
  }
  return 1;
}

export function dignityOf(id: WesternBody, sign: number): { label: string; score: number } {
  const m = BODY_META[id];
  if (m.domicile.includes(sign)) return { label: "Domicile", score: 5 };
  if (m.exalt === sign) return { label: "Exaltation", score: 4 };
  const detriment = m.domicile.map((s) => (s + 6) % 12);
  if (detriment.includes(sign)) return { label: "Detriment", score: 1 };
  if (m.exalt >= 0 && sign === (m.exalt + 6) % 12) return { label: "Fall", score: 0 };
  return { label: "Peregrine", score: 2 };
}

export interface WesternPlanet {
  id: WesternBody;
  lon: number;
  lat: number;
  sign: number;
  deg: number;
  house: number;
  speed: number;
  retro: boolean;
  dignity: string;
  dignityScore: number;
  element: string;
  mode: string;
  decan: number;
}

export interface WesternAspect {
  a: WesternBody;
  b: WesternBody;
  type: string;
  angle: number;
  orb: number;
  applying: boolean;
  nature: "harmonious" | "dynamic" | "neutral";
}

export interface WesternChart {
  input: BirthInput;
  utc: string;
  jd: number;
  houseSystem: "Placidus" | "Porphyry";
  asc: { lon: number; sign: number; deg: number };
  mc: { lon: number; sign: number; deg: number };
  dsc: { lon: number; sign: number; deg: number };
  ic: { lon: number; sign: number; deg: number };
  cusps: number[];
  planets: WesternPlanet[];
  aspects: WesternAspect[];
  partOfFortune: { lon: number; sign: number; deg: number; house: number };
  isDay: boolean;
  lunarPhase: { name: string; angle: number };
}

function lunarPhaseName(angle: number) {
  if (angle < 22.5 || angle >= 337.5) return "New Moon";
  if (angle < 67.5) return "Waxing Crescent";
  if (angle < 112.5) return "First Quarter";
  if (angle < 157.5) return "Waxing Gibbous";
  if (angle < 202.5) return "Full Moon";
  if (angle < 247.5) return "Waning Gibbous";
  if (angle < 292.5) return "Last Quarter";
  return "Waning Crescent";
}

function speedOf(id: WesternBody, utc: number) {
  const before = tropical(id, new Date(utc - 43200000)).lon;
  const after = tropical(id, new Date(utc + 43200000)).lon;
  let speed = after - before;
  if (speed > 180) speed -= 360;
  if (speed < -180) speed += 360;
  return speed;
}

export function computeWesternChart(input: BirthInput): WesternChart {
  const { utc } = localToUtc(input.date, input.time, input.tz);
  const date = new Date(utc);
  const jd = jdOf(utc);
  const houses = houseCusps(date, input.lat, input.lon);
  const planets: WesternPlanet[] = WESTERN_BODIES.map((id) => {
    const t = tropical(id, date);
    const sign = signOf(t.lon);
    const speed = speedOf(id, utc);
    const house = houseOf(t.lon, houses.cusps);
    const dig = dignityOf(id, sign);
    const retro = id === "North Node" || id === "South Node" ? true : id === "Sun" || id === "Moon" ? false : speed < 0;
    return {
      id,
      lon: norm(t.lon),
      lat: t.lat,
      sign,
      deg: degInSign(t.lon),
      house,
      speed,
      retro,
      dignity: dig.label,
      dignityScore: dig.score,
      element: SIGN_ELEMENT[sign],
      mode: SIGN_MODE[sign],
      decan: Math.min(3, Math.floor(degInSign(t.lon) / 10) + 1),
    };
  });

  const sun = planets.find((p) => p.id === "Sun")!;
  const moon = planets.find((p) => p.id === "Moon")!;
  const isDay = sun.house >= 7;
  const pofLon = isDay ? norm(houses.asc + moon.lon - sun.lon) : norm(houses.asc + sun.lon - moon.lon);
  const phase = norm(moon.lon - sun.lon);

  const aspects: WesternAspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const Apl = planets[i];
      const Bpl = planets[j];
      if ((Apl.id === "North Node" && Bpl.id === "South Node") || (Apl.id === "South Node" && Bpl.id === "North Node")) continue;
      const dist = angDist(Apl.lon, Bpl.lon);
      for (const [type, exact] of Object.entries(ASPECT_ANGLE)) {
        const extra = Apl.id === "Sun" || Apl.id === "Moon" || Bpl.id === "Sun" || Bpl.id === "Moon" ? 2 : 0;
        const allow = (ASPECT_ORBS[type] ?? 4) + extra;
        const orb = Math.abs(dist - exact);
        if (orb <= allow) {
          const faster = Math.abs(Apl.speed) >= Math.abs(Bpl.speed) ? Apl : Bpl;
          const slower = faster === Apl ? Bpl : Apl;
          const ahead = ((faster.lon - slower.lon + 360) % 360) < 180;
          const applying = faster.speed * (ahead ? -1 : 1) > 0 ? dist > exact : dist < exact;
          aspects.push({ a: Apl.id, b: Bpl.id, type, angle: dist, orb: Number(orb.toFixed(2)), applying, nature: ASPECT_NATURE[type] });
          break;
        }
      }
    }
  }

  const point = (lon: number) => ({ lon: norm(lon), sign: signOf(lon), deg: degInSign(lon) });
  return {
    input,
    utc: date.toISOString(),
    jd,
    houseSystem: houses.system,
    asc: point(houses.asc),
    mc: point(houses.mc),
    dsc: point(houses.dsc),
    ic: point(houses.ic),
    cusps: houses.cusps,
    planets,
    aspects,
    partOfFortune: { ...point(pofLon), house: houseOf(pofLon, houses.cusps) },
    isDay,
    lunarPhase: { name: lunarPhaseName(phase), angle: Number(phase.toFixed(2)) },
  };
}

export function fmt(lonPart: number) {
  const d = Math.floor(lonPart);
  const m = Math.floor((lonPart - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}'`;
}

export function signLabel(sign: number, deg: number) {
  return `${fmt(deg)} ${SIGN_NAMES[sign]} ${SIGN_RULER[sign] ? "" : ""}`.trim();
}
