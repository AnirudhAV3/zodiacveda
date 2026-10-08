/**
 * Shadbala per Brihat Parashara Hora Shastra (as tabulated by B.V. Raman, "Graha and Bhava Balas").
 * All values in Virupas (60 Virupas = 1 Rupa).
 */
import { PLANET_INFO, SIGNS, WEEKDAY_LORD, type PlanetId } from "./data";
import { angDist, type ChartData, type PlanetPos } from "./calc";

export const SEVEN: PlanetId[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

/* ---------------- Relationships ---------------- */
// Naisargika (natural) relationships — BPHS ch. 3
const NAT: Record<string, { f: PlanetId[]; e: PlanetId[] }> = {
  Sun: { f: ["Moon", "Mars", "Jupiter"], e: ["Venus", "Saturn"] },
  Moon: { f: ["Sun", "Mercury"], e: [] },
  Mars: { f: ["Sun", "Moon", "Jupiter"], e: ["Mercury"] },
  Mercury: { f: ["Sun", "Venus"], e: ["Moon"] },
  Jupiter: { f: ["Sun", "Moon", "Mars"], e: ["Mercury", "Venus"] },
  Venus: { f: ["Mercury", "Saturn"], e: ["Sun", "Moon"] },
  Saturn: { f: ["Mercury", "Venus"], e: ["Sun", "Moon", "Mars"] },
};

export function naturalRel(a: PlanetId, b: PlanetId): 1 | 0 | -1 {
  if (!NAT[a]) {
    const pi = PLANET_INFO[a];
    return pi.friends.includes(b) ? 1 : pi.enemies.includes(b) ? -1 : 0;
  }
  return NAT[a].f.includes(b) ? 1 : NAT[a].e.includes(b) ? -1 : 0;
}

/** Tatkalika: planets in 2,3,4,10,11,12 from a planet are temporary friends. */
export function temporalRel(c: ChartData, a: PlanetId, b: PlanetId): 1 | -1 {
  const sa = c.planets.find((p) => p.id === a)!.sign;
  const sb = c.planets.find((p) => p.id === b)!.sign;
  const h = ((sb - sa + 12) % 12) + 1;
  return [2, 3, 4, 10, 11, 12].includes(h) ? 1 : -1;
}

export type Compound = "Great Friend" | "Friend" | "Neutral" | "Enemy" | "Great Enemy";
export function compoundRel(c: ChartData, a: PlanetId, b: PlanetId): Compound {
  const v = naturalRel(a, b) + temporalRel(c, a, b);
  return v === 2 ? "Great Friend" : v === 1 ? "Friend" : v === 0 ? "Neutral" : v === -1 ? "Enemy" : "Great Enemy";
}

/* ---------------- Dignity ---------------- */
export type Dignity = "Exalted" | "Moolatrikona" | "Own Sign" | "Great Friend's Sign" | "Friend's Sign" | "Neutral Sign" | "Enemy's Sign" | "Great Enemy's Sign" | "Debilitated";

/** Precise dignity. Pass `deg` for D1 (degree-exact rules); omit for divisional charts. Pass chart for compound relationship. */
export function dignityOf(id: PlanetId, sign: number, deg?: number, c?: ChartData): Dignity {
  const pi = PLANET_INFO[id];
  if (pi.exalt[0] === sign) {
    if (deg !== undefined && id === "Mercury" && deg >= 15) return deg < 20 ? "Moolatrikona" : "Own Sign";
    if (deg !== undefined && id === "Moon" && deg > 3) return "Moolatrikona";
    return "Exalted";
  }
  if ((pi.exalt[0] + 6) % 12 === sign) return "Debilitated";
  if (deg !== undefined && pi.mt[0] === sign && deg >= pi.mt[1] && deg < pi.mt[2]) return "Moolatrikona";
  if (pi.own.includes(sign) || SIGNS[sign].lord === id) return "Own Sign";
  const lord = SIGNS[sign].lord;
  if (c && SEVEN.includes(id)) {
    const r = compoundRel(c, id, lord);
    return r === "Great Friend" ? "Great Friend's Sign" : r === "Friend" ? "Friend's Sign" : r === "Neutral" ? "Neutral Sign" : r === "Enemy" ? "Enemy's Sign" : "Great Enemy's Sign";
  }
  const n = naturalRel(id, lord);
  return n === 1 ? "Friend's Sign" : n === -1 ? "Enemy's Sign" : "Neutral Sign";
}

export const DIGNITY_SHORT: Record<Dignity, string> = { Exalted: "Ex", Moolatrikona: "MT", "Own Sign": "Own", "Great Friend's Sign": "GF", "Friend's Sign": "F", "Neutral Sign": "N", "Enemy's Sign": "E", "Great Enemy's Sign": "GE", Debilitated: "Db" };

/* ---------------- Helpers ---------------- */
const P = (c: ChartData, id: PlanetId) => c.planets.find((p) => p.id === id)!;
const elongation = (c: ChartData) => angDist(P(c, "Moon").lon, P(c, "Sun").lon);
const waxing = (c: ChartData) => ((P(c, "Moon").lon - P(c, "Sun").lon + 360) % 360) < 180;

function isBenefic(c: ChartData, id: PlanetId) {
  if (id === "Jupiter" || id === "Venus") return true;
  if (id === "Moon") return waxing(c);
  if (id === "Mercury") {
    const me = P(c, "Mercury");
    return !c.planets.some((q) => q.id !== "Mercury" && q.sign === me.sign && ["Sun", "Mars", "Saturn", "Rahu", "Ketu"].includes(q.id));
  }
  return false;
}

/* ---------------- Sthana Bala ---------------- */
function uchchaBala(p: PlanetPos) {
  const pi = PLANET_INFO[p.id];
  const debil = (((pi.exalt[0] + 6) % 12) * 30 + pi.exalt[1]) % 360;
  return angDist(p.lon, debil) / 3;
}

const VARGA_PTS = { Moolatrikona: 45, Own: 30, "Great Friend": 20, Friend: 15, Neutral: 10, Enemy: 4, "Great Enemy": 2 } as const;
export const VARGA_NAMES = ["D1 Rasi", "D2 Hora", "D3 Drekkana", "D7 Saptamsa", "D9 Navamsa", "D12 Dwadasamsa", "D30 Trimsamsa"];

function vargaPoints(c: ChartData, p: PlanetPos, sign: number, isRasi: boolean) {
  const pi = PLANET_INFO[p.id];
  if (isRasi && pi.mt[0] === sign && p.deg >= pi.mt[1] && p.deg < pi.mt[2]) return { pts: VARGA_PTS.Moolatrikona, label: "MT" };
  if (SIGNS[sign].lord === p.id) return { pts: VARGA_PTS.Own, label: "Own" };
  const r = compoundRel(c, p.id, SIGNS[sign].lord);
  return { pts: VARGA_PTS[r], label: r === "Great Friend" ? "GF" : r === "Friend" ? "F" : r === "Neutral" ? "N" : r === "Enemy" ? "E" : "GE" };
}

function saptavargaja(c: ChartData, p: PlanetPos) {
  const signs = [p.sign, p.vargas.d2, p.vargas.d3, p.vargas.d7, p.vargas.d9, p.vargas.d12, p.vargas.d30];
  const detail = signs.map((s, i) => ({ varga: VARGA_NAMES[i], sign: s, ...vargaPoints(c, p, s, i === 0) }));
  return { total: detail.reduce((a, b) => a + b.pts, 0), detail };
}

function ojayugma(p: PlanetPos) {
  const fem = p.id === "Moon" || p.id === "Venus";
  const odd = (s: number) => s % 2 === 0;
  let v = 0;
  if (fem ? !odd(p.sign) : odd(p.sign)) v += 15;
  if (fem ? !odd(p.vargas.d9) : odd(p.vargas.d9)) v += 15;
  return v;
}

const kendradi = (p: PlanetPos) => ([1, 4, 7, 10].includes(p.house) ? 60 : [2, 5, 8, 11].includes(p.house) ? 30 : 15);

function drekkanaBala(p: PlanetPos) {
  const dk = Math.floor(p.deg / 10);
  const male = ["Sun", "Mars", "Jupiter"].includes(p.id);
  const neutral = ["Mercury", "Saturn"].includes(p.id);
  return (male && dk === 0) || (neutral && dk === 1) || (!male && !neutral && dk === 2) ? 15 : 0;
}

/* ---------------- Dig Bala ---------------- */
function digBala(c: ChartData, p: PlanetPos) {
  const asc = c.asc.lon;
  const mc = c.mc ?? (asc + 270) % 360;
  const strongPoint: Record<string, number> = { Sun: mc, Mars: mc, Jupiter: asc, Mercury: asc, Moon: (mc + 180) % 360, Venus: (mc + 180) % 360, Saturn: (asc + 180) % 360 };
  return (180 - angDist(p.lon, strongPoint[p.id])) / 3;
}

/* ---------------- Kala Bala ---------------- */
const HORA_ORDER: PlanetId[] = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
const KALI_DAY = 588466; // floor(JD 588465.5 + 0.5) — Kali Yuga epoch (Friday)

function weekdayOfDayNumber(D: number) {
  return (((D + 1) % 7) + 7) % 7; // 0 = Sunday
}

function kalaContext(c: ChartData) {
  const birth = new Date(c.utc).getTime();
  const st = c.sunTimes;
  const rise = st?.riseMs ?? birth - 6 * 3600000;
  const set = st?.setMs ?? rise + 12 * 3600000;
  const next = st?.nextRiseMs ?? rise + 24 * 3600000;
  const isDay = st ? st.isDay : true;
  const off = c.tzOffsetMin * 60000;
  const D = Math.floor((rise + off) / 86400000 + 2440587.5 + 0.5);
  const varaLord = WEEKDAY_LORD[weekdayOfDayNumber(D)];
  // Abda / Masa lords: weekday lord of the day on which the current solar year (Mesha sankranti) and solar month began
  const ah = D - KALI_DAY;
  const abdaLord = st?.abdaWeekday !== undefined ? WEEKDAY_LORD[st.abdaWeekday] : WEEKDAY_LORD[weekdayOfDayNumber(D - (((ah % 360) + 360) % 360))];
  const masaLord = st?.masaWeekday !== undefined ? WEEKDAY_LORD[st.masaWeekday] : WEEKDAY_LORD[weekdayOfDayNumber(D - (((ah % 30) + 30) % 30))];
  const horaIdx = Math.floor((birth - rise) / 3600000);
  const horaLord = HORA_ORDER[(HORA_ORDER.indexOf(varaLord) + horaIdx) % 7];
  let tribhagaLord: PlanetId;
  if (isDay) {
    const part = Math.min(2, Math.floor(((birth - rise) / (set - rise)) * 3));
    tribhagaLord = (["Mercury", "Sun", "Saturn"] as PlanetId[])[part];
  } else {
    const start = birth >= set ? set : set - 86400000;
    const end = birth >= set ? next : rise;
    const part = Math.max(0, Math.min(2, Math.floor(((birth - start) / (end - start)) * 3)));
    tribhagaLord = (["Moon", "Venus", "Mars"] as PlanetId[])[part];
  }
  return { isDay, varaLord, abdaLord, masaLord, horaLord, tribhagaLord, hourAngle: st?.hourAngle ?? 0 };
}

function ayanaBala(p: PlanetPos) {
  const k = p.kranti ?? 0;
  if (p.id === "Mercury") return ((24 + Math.abs(k)) / 48) * 60;
  if (p.id === "Moon" || p.id === "Saturn") return ((24 - k) / 48) * 60;
  return ((24 + k) / 48) * 60;
}

/* ---------------- Drik Bala ---------------- */
export function drishtiValue(from: PlanetId, d: number) {
  d = ((d % 360) + 360) % 360;
  let v = 0;
  if (d >= 30 && d < 60) v = (d - 30) / 2;
  else if (d >= 60 && d < 90) v = d - 60 + 15;
  else if (d >= 90 && d < 120) v = (120 - d) / 2 + 30;
  else if (d >= 120 && d < 150) v = 150 - d;
  else if (d >= 150 && d < 180) v = (d - 150) * 2;
  else if (d >= 180 && d < 300) v = (300 - d) / 2;
  if (from === "Mars" && ((d >= 90 && d < 120) || (d >= 210 && d < 240))) v += 15;
  if (from === "Jupiter" && ((d >= 120 && d < 150) || (d >= 240 && d < 270))) v += 30;
  if (from === "Saturn" && ((d >= 60 && d < 90) || (d >= 270 && d < 300))) v += 45;
  return Math.min(60, v);
}

/* ---------------- Main ---------------- */
export const REQUIRED_RUPAS: Record<string, number> = { Sun: 6.5, Moon: 6, Mars: 5, Mercury: 7, Jupiter: 6.5, Venus: 5.5, Saturn: 5 };
const DIAMETER: Record<string, number> = { Mars: 9.4, Mercury: 6.6, Jupiter: 190.4, Venus: 16.6, Saturn: 158.0 };

export interface ShadbalaRow {
  id: PlanetId;
  sthana: number;
  sthanaParts: { uchcha: number; saptavargaja: number; ojayugma: number; kendradi: number; drekkana: number };
  vargaDetail: { varga: string; sign: number; pts: number; label: string }[];
  dig: number;
  kala: number;
  kalaParts: { nathonnata: number; paksha: number; tribhaga: number; abda: number; masa: number; vara: number; hora: number; ayana: number; yuddha: number };
  cheshta: number;
  naisargika: number;
  drik: number;
  total: number;
  rupas: number;
  required: number;
  ratio: number;
  strong: boolean;
  rank: number;
  ishta: number;
  kashta: number;
}

export function computeShadbala(c: ChartData): { rows: ShadbalaRow[]; ctx: ReturnType<typeof kalaContext> } {
  const kc = kalaContext(c);
  const el = elongation(c);
  const ha = Math.abs(kc.hourAngle);
  const rows: ShadbalaRow[] = SEVEN.map((id) => {
    const p = P(c, id);
    const uchcha = uchchaBala(p);
    const sv = saptavargaja(c, p);
    const oja = ojayugma(p);
    const ken = kendradi(p);
    const drek = drekkanaBala(p);
    const sthana = uchcha + sv.total + oja + ken + drek;

    const dig = digBala(c, p);

    const nathonnata = id === "Mercury" ? 60 : ["Sun", "Jupiter", "Venus"].includes(id) ? (180 - ha) / 3 : ha / 3;
    const paksha = isBenefic(c, id) || id === "Moon" ? el / 3 : (180 - el) / 3;
    const tribhaga = (id === "Jupiter" ? 60 : 0) + (kc.tribhagaLord === id ? 60 : 0);
    const abda = kc.abdaLord === id ? 15 : 0;
    const masa = kc.masaLord === id ? 30 : 0;
    const vara = kc.varaLord === id ? 45 : 0;
    const hora = kc.horaLord === id ? 60 : 0;
    const ayana = ayanaBala(p);

    let cheshta: number;
    if (id === "Sun") cheshta = ayana;
    else if (id === "Moon") cheshta = el / 3;
    else cheshta = (p.cheshtaKendra ?? (p.speed < 0 ? 180 : 90)) / 3;

    const naisargika = PLANET_INFO[id].naisargika;

    let ben = 0;
    let mal = 0;
    for (const q of c.planets) {
      if (q.id === id || !SEVEN.includes(q.id)) continue;
      const v = drishtiValue(q.id, p.lon - q.lon);
      if (isBenefic(c, q.id)) ben += v;
      else mal += v;
    }
    const drik = (ben - mal) / 4;
    const kalaParts = { nathonnata, paksha, tribhaga, abda, masa, vara, hora, ayana, yuddha: 0 };
    const kala = nathonnata + paksha + tribhaga + abda + masa + vara + hora + ayana;
    return {
      id,
      sthana,
      sthanaParts: { uchcha, saptavargaja: sv.total, ojayugma: oja, kendradi: ken, drekkana: drek },
      vargaDetail: sv.detail,
      dig,
      kala,
      kalaParts,
      cheshta,
      naisargika,
      drik,
      total: 0,
      rupas: 0,
      required: REQUIRED_RUPAS[id],
      ratio: 0,
      strong: false,
      rank: 0,
      ishta: Math.sqrt(uchcha * cheshta),
      kashta: Math.sqrt(Math.max(0, 60 - uchcha) * Math.max(0, 60 - cheshta)),
    };
  });

  // Graha Yuddha (planetary war) among Mars–Saturn within 1°
  const tara = rows.filter((r) => DIAMETER[r.id]);
  for (let i = 0; i < tara.length; i++)
    for (let j = i + 1; j < tara.length; j++) {
      const a = P(c, tara[i].id);
      const b = P(c, tara[j].id);
      if (angDist(a.lon, b.lon) >= 1) continue;
      const winner = a.lat >= b.lat ? tara[i] : tara[j];
      const loser = winner === tara[i] ? tara[j] : tara[i];
      const sum = (r: ShadbalaRow) => r.sthana + r.dig + r.kala;
      const diff = Math.abs(sum(winner) - sum(loser)) / Math.max(1, Math.abs(DIAMETER[winner.id] - DIAMETER[loser.id]));
      winner.kalaParts.yuddha += diff;
      winner.kala += diff;
      loser.kalaParts.yuddha -= diff;
      loser.kala -= diff;
    }

  for (const r of rows) {
    r.total = r.sthana + r.dig + r.kala + r.cheshta + r.naisargika + r.drik;
    r.rupas = r.total / 60;
    r.ratio = r.rupas / r.required;
    r.strong = r.ratio >= 1;
  }
  [...rows].sort((a, b) => b.ratio - a.ratio).forEach((r, i) => (r.rank = i + 1));
  return { rows, ctx: kc };
}
