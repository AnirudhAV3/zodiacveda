import { BHAVAS, NAKSHATRAS, PLANET_INFO, PLANETS, SIGNS, type PlanetId } from "./data";
import { angDist, type ChartData, type PlanetPos } from "./calc";
import { computeShadbala, dignityOf, type Dignity } from "./shadbala";

export type { Dignity } from "./shadbala";

/** Dignity. `deg` = degree in sign for D1 (exact MT/exaltation ranges); omit for divisional charts. Pass chart for compound (Panchadha) friendship. */
export function dignity(id: PlanetId, sign: number, deg?: number, c?: ChartData): Dignity {
  return dignityOf(id, sign, deg, c);
}

export const dignityScore = (d: Dignity) =>
  ({ Exalted: 5, Moolatrikona: 4, "Own Sign": 3.5, "Great Friend's Sign": 3, "Friend's Sign": 2.5, "Neutral Sign": 2, "Enemy's Sign": 1, "Great Enemy's Sign": 0.5, Debilitated: 0 })[d];
export const dignityColor = (d: Dignity) =>
  d === "Exalted" || d === "Moolatrikona" || d === "Own Sign" ? "text-emerald-400" : d === "Great Friend's Sign" || d === "Friend's Sign" ? "text-sky-400" : d === "Neutral Sign" ? "text-slate-300" : "text-rose-400";

export const signAt = (c: ChartData, house: number) => (c.asc.sign + house - 1) % 12;
export const houseLord = (c: ChartData, house: number) => SIGNS[signAt(c, house)].lord;
export const planet = (c: ChartData, id: PlanetId) => c.planets.find((p) => p.id === id)!;
export const housesOwned = (c: ChartData, id: PlanetId) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((h) => houseLord(c, h) === id);
export const planetsInHouse = (c: ChartData, h: number) => c.planets.filter((p) => p.house === h);
export const houseFrom = (fromSign: number, sign: number) => ((sign - fromSign + 12) % 12) + 1;

export function aspectedHouses(p: PlanetPos) {
  return PLANET_INFO[p.id].aspects.map((a) => ((p.house + a - 2) % 12) + 1);
}
export function aspectsOnHouse(c: ChartData, h: number) {
  return c.planets.filter((p) => aspectedHouses(p).includes(h));
}

export function functionalNature(c: ChartData, id: PlanetId): { label: string; good: boolean } {
  if (id === "Rahu" || id === "Ketu") {
    const p = planet(c, id);
    const good = [3, 6, 10, 11].includes(p.house);
    return { label: good ? "Functional Benefic (Upachaya)" : "Shadow Planet", good };
  }
  const owned = housesOwned(c, id);
  const tri = owned.some((h) => h === 5 || h === 9);
  const ken = owned.some((h) => h === 4 || h === 7 || h === 10);
  if (owned.includes(1)) return { label: "Lagna Lord (Benefic)", good: true };
  if (tri && ken) return { label: "Yogakaraka", good: true };
  if (tri) return { label: "Functional Benefic", good: true };
  if (owned.some((h) => h === 6 || h === 8 || h === 12)) return { label: "Functional Malefic", good: false };
  if (owned.some((h) => h === 3 || h === 11)) return { label: "Functional Malefic", good: false };
  return { label: "Neutral", good: true };
}

export function naturalNature(c: ChartData, id: PlanetId): "Benefic" | "Malefic" {
  if (id === "Moon") {
    const sun = planet(c, "Sun");
    const moon = planet(c, "Moon");
    const d = (moon.lon - sun.lon + 360) % 360;
    return d >= 72 && d <= 288 ? "Benefic" : "Malefic";
  }
  if (id === "Mercury") {
    const me = planet(c, "Mercury");
    const withMal = c.planets.some((p) => p.id !== "Mercury" && p.sign === me.sign && ["Sun", "Mars", "Saturn", "Rahu", "Ketu"].includes(p.id));
    return withMal ? "Malefic" : "Benefic";
  }
  return PLANET_INFO[id].nature;
}

export const KARAKA_NAMES = ["AK", "AmK", "BK", "MK", "PiK", "GK", "DK"];
export const KARAKA_FULL: Record<string, string> = { AK: "Atmakaraka — soul", AmK: "Amatyakaraka — career", BK: "Bhratrikaraka — siblings", MK: "Matrikaraka — mother", PiK: "Pitrikaraka — father", GK: "Gnatikaraka — rivals", DK: "Darakaraka — spouse" };
export function charaKarakas(c: ChartData): Partial<Record<PlanetId, string>> {
  const seven = c.planets.filter((p) => !["Rahu", "Ketu"].includes(p.id)).sort((a, b) => b.deg - a.deg);
  const out: Partial<Record<PlanetId, string>> = {};
  seven.forEach((p, i) => (out[p.id] = KARAKA_NAMES[i]));
  return out;
}

export function baladiAvastha(p: PlanetPos) {
  const names = ["Bala (Infant)", "Kumara (Youth)", "Yuva (Adult)", "Vriddha (Old)", "Mrita (Dead)"];
  const idx = Math.min(4, Math.floor(p.deg / 6));
  return p.sign % 2 === 0 ? names[idx] : names[4 - idx];
}
export const avasthaPower = (a: string) => (a.startsWith("Yuva") ? "100%" : a.startsWith("Kumara") ? "50%" : a.startsWith("Vriddha") ? "25%" : a.startsWith("Bala") ? "25%" : "0%");

/* ---------- Avakhada chakra ---------- */
export function avakhada(c: ChartData) {
  const moon = planet(c, "Moon");
  const nak = NAKSHATRAS[moon.nak];
  const rashi = SIGNS[moon.sign];
  const payaH = moon.house;
  const paya = [1, 6, 11].includes(payaH) ? "Swarna (Gold)" : [2, 5, 9].includes(payaH) ? "Rajat (Silver)" : [3, 7, 10].includes(payaH) ? "Tamra (Copper)" : "Loha (Iron)";
  return {
    lagna: SIGNS[c.asc.sign],
    lagnaLord: SIGNS[c.asc.sign].lord,
    rashi,
    rashiLord: rashi.lord,
    sunSign: SIGNS[planet(c, "Sun").sign],
    nakshatra: nak,
    pada: moon.pada,
    nakLord: nak.lord,
    varna: rashi.varna,
    vashya: rashi.vashya,
    yoni: `${nak.yoni} (${nak.yoniGender})`,
    gana: nak.gana,
    nadi: nak.nadi,
    tatva: rashi.element,
    paya,
    syllable: nak.syllables[moon.pada - 1],
    nakDeity: nak.deity,
    nakSymbol: nak.symbol,
  };
}

const GHATAK_DAY = ["Sunday", "Saturday", "Monday", "Wednesday", "Saturday", "Saturday", "Thursday", "Friday", "Friday", "Tuesday", "Thursday", "Friday"];
const ISHTA: Record<PlanetId, string> = { Sun: "Lord Shiva / Sri Rama", Moon: "Goddess Parvati / Sri Krishna", Mars: "Lord Hanuman / Kartikeya", Mercury: "Lord Vishnu", Jupiter: "Lord Vishnu / Dattatreya", Venus: "Goddess Lakshmi", Saturn: "Lord Shani / Hanuman", Rahu: "Goddess Durga", Ketu: "Lord Ganesha" };

function digitSum(n: number): number {
  while (n > 9) n = String(n).split("").reduce((a, b) => a + Number(b), 0);
  return n;
}

export function lucky(c: ChartData) {
  const ll = SIGNS[c.asc.sign].lord;
  const moon = planet(c, "Moon");
  const rl = SIGNS[moon.sign].lord;
  const l5 = houseLord(c, 5);
  const l9 = houseLord(c, 9);
  const [y, m, d] = c.input.date.split("-").map(Number);
  const birthNum = digitSum(d);
  const destiny = digitSum(String(y).split("").concat(String(m).split(""), String(d).split("")).reduce((a, b) => a + Number(b), 0));
  const karakas = charaKarakas(c);
  const ak = (Object.keys(karakas) as PlanetId[]).find((k) => karakas[k] === "AK")!;
  const karakamsa = planet(c, ak).d9;
  const twelfth = (karakamsa + 11) % 12;
  const inTwelfth = c.planets.filter((p) => p.d9 === twelfth);
  const ishtaPlanet = inTwelfth.length ? inTwelfth[0].id : SIGNS[twelfth].lord;
  const uniq = <T,>(a: T[]) => Array.from(new Set(a));
  return {
    days: uniq([PLANET_INFO[ll].day, PLANET_INFO[rl].day, PLANET_INFO[l9].day]),
    numbers: uniq([PLANET_INFO[ll].number, PLANET_INFO[rl].number, birthNum, destiny]),
    birthNumber: birthNum,
    destinyNumber: destiny,
    lifeStone: PLANET_INFO[ll].gem,
    luckyStone: PLANET_INFO[l5].gem,
    fortuneStone: PLANET_INFO[l9].gem,
    metal: PLANET_INFO[ll].metal,
    colors: uniq([PLANET_INFO[ll].color2, PLANET_INFO[rl].color2]),
    direction: PLANET_INFO[ll].direction,
    deity: ISHTA[ll],
    ishtaDevata: `${ISHTA[ishtaPlanet]} (via ${ishtaPlanet})`,
    nakDeity: NAKSHATRAS[moon.nak].deity,
    fastingDay: PLANET_INFO[ll].day,
    mantra: PLANET_INFO[ll].mantra,
    grain: PLANET_INFO[ll].grain,
    letters: NAKSHATRAS[moon.nak].syllables.join(", "),
    ghatakDay: GHATAK_DAY[moon.sign],
    lagnaLord: ll,
    rashiLord: rl,
  };
}

/* ---------- Shadbala (BPHS) ---------- */
export function shadbala(c: ChartData) {
  return computeShadbala(c).rows;
}

export function velocity(c: ChartData) {
  return c.planets.map((p) => {
    const mean = PLANET_INFO[p.id].meanSpeed;
    const pct = (Math.abs(p.speed) / mean) * 100;
    let status = "Average";
    if (p.id === "Rahu" || p.id === "Ketu") status = "Always Retrograde (Mean)";
    else if (p.speed < 0) status = "Retrograde (Vakra)";
    else if (pct < 10) status = "Stationary (Vikala)";
    else if (pct < 60) status = "Slow (Manda)";
    else if (pct > 130) status = "Fast (Atichara)";
    else if (pct > 100) status = "Swift (Sheeghra)";
    let bright = "—";
    if (p.mag !== null) bright = p.mag < -4 ? "Brilliant" : p.mag < -1 ? "Very bright" : p.mag < 1 ? "Bright" : p.mag < 3 ? "Visible" : "Faint";
    return { id: p.id, speed: p.speed, mean, pct, status, mag: p.mag, bright, combust: p.combust, lat: p.lat };
  });
}

export function nodeBehaviour(c: ChartData) {
  return (["Rahu", "Ketu"] as PlanetId[]).map((id) => {
    const p = planet(c, id);
    const dispositor = SIGNS[p.sign].lord;
    const conj = c.planets.filter((q) => q.id !== id && q.sign === p.sign && !(["Rahu", "Ketu"].includes(q.id)));
    const aspBy = c.planets.filter((q) => q.id !== id && !["Rahu", "Ketu"].includes(q.id) && aspectedHouses(q).includes(p.house));
    const nakLord = NAKSHATRAS[p.nak].lord;
    const actsAs = conj.length ? conj.map((q) => q.id).join(" + ") : dispositor;
    const axis = id === "Rahu" ? `${p.house}–${((p.house + 5) % 12) + 1}` : `${((p.house + 5) % 12) + 1}–${p.house}`;
    const good = [3, 6, 10, 11].includes(p.house);
    const desc =
      id === "Rahu"
        ? `Rahu in house ${p.house} (${BHAVAS[p.house - 1].title.toLowerCase()}) creates an insatiable hunger for these matters in this life. Acting through ${actsAs}, it amplifies their significations and brings unconventional, sudden and foreign influences.`
        : `Ketu in house ${p.house} (${BHAVAS[p.house - 1].title.toLowerCase()}) shows past-life mastery and natural detachment here. Acting through ${actsAs}, it gives intuitive skill but can bring dissatisfaction or sudden separation in these matters.`;
    return { id, p, dispositor, conj: conj.map((q) => q.id), aspBy: aspBy.map((q) => q.id), nakLord, actsAs, axis, good, desc };
  });
}

export function devatas(c: ChartData) {
  return c.planets.map((p) => ({ id: p.id, deity: PLANET_INFO[p.id].deity, adhi: PLANET_INFO[p.id].adhidevata, pratyadhi: PLANET_INFO[p.id].pratyadhidevata, nakDeity: NAKSHATRAS[p.nak].deity, nak: NAKSHATRAS[p.nak].name }));
}

export function relationTo(id: PlanetId, other: PlanetId): "Friend" | "Enemy" | "Neutral" | "Self" {
  if (id === other) return "Self";
  const pi = PLANET_INFO[id];
  if (pi.friends.includes(other)) return "Friend";
  if (pi.enemies.includes(other)) return "Enemy";
  return "Neutral";
}

export { PLANETS };
