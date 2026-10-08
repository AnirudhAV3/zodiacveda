import { PLANET_INFO, SIGNS, type PlanetId } from "./data";
import { subPeriods, type ChartData } from "./calc";
import { functionalNature, houseLord, planet } from "./analysis";

export type RemedyKind = "Mantra" | "Puja" | "Charity" | "Fasting" | "Gemstone" | "Lifestyle" | "Timing";
export interface Remedy {
  kind: RemedyKind;
  text: string;
}

export const REMEDY_ICON: Record<RemedyKind, string> = { Mantra: "🕉", Puja: "🪔", Charity: "🤲", Fasting: "🌙", Gemstone: "💎", Lifestyle: "🌿", Timing: "⏳" };

export const WORSHIP: Record<PlanetId, string> = {
  Sun: "Lord Surya / Shiva (Aditya Hridayam)",
  Moon: "Lord Shiva & Goddess Parvati",
  Mars: "Lord Hanuman / Kartikeya (Subramanya)",
  Mercury: "Lord Vishnu / Ganesha",
  Jupiter: "Lord Vishnu / Dakshinamurthy (Guru)",
  Venus: "Goddess Lakshmi",
  Saturn: "Lord Shani / Hanuman",
  Rahu: "Goddess Durga",
  Ketu: "Lord Ganesha",
};

const SEVEN: PlanetId[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const fmt = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

/* ---------- planet level ---------- */
export function planetRemedies(c: ChartData, id: PlanetId, mode: "strengthen" | "pacify"): Remedy[] {
  const pi = PLANET_INFO[id];
  const fn = functionalNature(c, id);
  const out: Remedy[] = [{ kind: "Mantra", text: `${mode === "strengthen" ? "Strengthen" : "Pacify"} ${id}: chant "${pi.mantra}" 108 times on ${pi.day}s` }];
  if (mode === "pacify") {
    out.push({ kind: "Charity", text: `Donate ${pi.grain.toLowerCase()} and ${pi.color2.toLowerCase()} coloured items on ${pi.day}s to reduce ${id}'s harsh effects` });
    out.push({ kind: "Fasting", text: `Observe a light fast on ${pi.day}s` });
  } else if (fn.good) {
    out.push({ kind: "Gemstone", text: `${pi.gem} set in ${pi.metal.toLowerCase()} may be worn to strengthen ${id} (a functional benefic for your Lagna) — only after proper consultation and trial` });
  } else {
    out.push({ kind: "Gemstone", text: `Avoid ${pi.gem} — ${id} is a functional malefic for your Lagna; rely on mantra and charity instead` });
  }
  return out;
}

/* ---------- yoga key planets ---------- */
type KP = (c: ChartData) => PlanetId[];
const L = (c: ChartData, h: number) => houseLord(c, h);
const S = (c: ChartData, id: PlanetId) => planet(c, id).sign;
const conj = (c: ChartData, a: PlanetId, b: PlanetId) => S(c, a) === S(c, b);
const exchangePairs = (c: ChartData) => {
  const out: PlanetId[] = [];
  for (const a of SEVEN)
    for (const b of SEVEN) if (a < b && SIGNS[S(c, a)].lord === b && SIGNS[S(c, b)].lord === a) out.push(a, b);
  return out;
};

const KEY: Record<string, KP> = {
  "Ruchaka Yoga": () => ["Mars"],
  "Bhadra Yoga": () => ["Mercury"],
  "Hamsa Yoga": () => ["Jupiter"],
  "Malavya Yoga": () => ["Venus"],
  "Sasa Yoga": () => ["Saturn"],
  "Gaja Kesari Yoga": () => ["Jupiter", "Moon"],
  "Chandra-Mangala Yoga": () => ["Moon", "Mars"],
  "Kemadruma Yoga": () => ["Moon"],
  "Shakata Yoga": () => ["Jupiter", "Moon"],
  "Gauri Yoga": () => ["Moon", "Jupiter"],
  "Budha-Aditya Yoga": () => ["Sun", "Mercury"],
  "Lakshmi-Narayana Yoga": () => ["Venus", "Mercury"],
  "Guru-Mangala Yoga": () => ["Jupiter", "Mars"],
  "Kendra-Trikona Raja Yoga": (c) => {
    for (const k of [4, 7, 10]) for (const t of [5, 9]) if (L(c, k) !== L(c, t) && (conj(c, L(c, k), L(c, t)) || exchangePairs(c).includes(L(c, k)))) return [L(c, k), L(c, t)];
    return [L(c, 9), L(c, 10)];
  },
  "Dharma-Karmadhipati Yoga": (c) => [L(c, 9), L(c, 10)],
  "Yogakaraka Yoga": (c) => SEVEN.filter((id) => functionalNature(c, id).label === "Yogakaraka"),
  "Neecha Bhanga Raja Yoga": (c) => SEVEN.filter((id) => (PLANET_INFO[id].exalt[0] + 6) % 12 === S(c, id)),
  "Harsha Viparita Raja Yoga": (c) => [L(c, 6)],
  "Sarala Viparita Raja Yoga": (c) => [L(c, 8)],
  "Vimala Viparita Raja Yoga": (c) => [L(c, 12)],
  "Maha Parivartana Yoga": exchangePairs,
  "Dainya Parivartana Yoga": exchangePairs,
  "Khala Parivartana Yoga": exchangePairs,
  "Lagna-Karma Raja Yoga": (c) => [L(c, 1), L(c, 10)],
  "Lakshmi Yoga": (c) => [L(c, 9), L(c, 1), "Venus"],
  "Saraswati Yoga": () => ["Jupiter", "Venus", "Mercury"],
  "Kahala Yoga": (c) => [L(c, 4), L(c, 9)],
  "Shankha Yoga": (c) => [L(c, 5), L(c, 6)],
  "Bheri Yoga": (c) => ["Venus", "Jupiter", L(c, 9)],
  "Srinatha Yoga": (c) => [L(c, 7), L(c, 9), L(c, 10)],
  "Khadga Yoga": (c) => [L(c, 2), L(c, 9)],
  "Srikantha Yoga": (c) => [L(c, 1), "Sun", "Moon"],
  "Parijata Yoga": (c) => [SIGNS[S(c, L(c, 1))].lord],
  "Shiva Yoga": (c) => [L(c, 5), L(c, 9), L(c, 10)],
  "Trilochana Yoga": () => ["Sun", "Moon", "Mars"],
  "Amsavatara Yoga": () => ["Venus", "Jupiter", "Saturn"],
  "Ravi Yoga": (c) => ["Sun", L(c, 10)],
  "Akhanda Samrajya Yoga": () => ["Jupiter"],
  "Kalanidhi Yoga": () => ["Jupiter", "Mercury", "Venus"],
  "Dhana Yoga (2nd–11th)": (c) => [L(c, 2), L(c, 11)],
  "Dhana Yoga (5th–9th)": (c) => [L(c, 5), L(c, 9)],
  "Dhana Yoga (1st–2nd)": (c) => [L(c, 1), L(c, 2)],
  "Dhana Yoga (1st–11th)": (c) => [L(c, 1), L(c, 11)],
  "Bhagya Yoga": (c) => [L(c, 9)],
  "Vidya Yoga": (c) => [L(c, 5), "Mercury", "Jupiter"],
  "Putra Yoga": (c) => [L(c, 5), "Jupiter"],
  "Kalatra Sukha Yoga": (c) => [L(c, 7), "Venus"],
  "Videsh Yoga": (c) => [L(c, 12), "Rahu"],
  "Sukha Yoga": (c) => [L(c, 4), "Moon"],
  "Vahana Yoga": (c) => [L(c, 4), "Venus"],
  "Kirti Yoga": (c) => [L(c, 10), "Sun"],
  "Ayur Yoga": (c) => [L(c, 8), "Saturn"],
  "Daridra Yoga": (c) => [L(c, 11)],
  "Grahan Yoga": (c) => (["Sun", "Moon"] as PlanetId[]).filter((l) => conj(c, l, "Rahu") || conj(c, l, "Ketu")).concat(["Rahu", "Ketu"]),
  "Guru Chandal Yoga": () => ["Jupiter", "Rahu"],
  "Angarak Yoga": () => ["Mars", "Rahu"],
  "Vish Yoga": () => ["Saturn", "Moon"],
  "Shrapit Yoga": () => ["Saturn", "Rahu"],
  "Papa Kartari Yoga": (c) => [L(c, 1)],
  "Chandra Papa Kartari": () => ["Moon"],
  "Duryoga": (c) => [L(c, 10)],
  "Lagna Lord in Dusthana": (c) => [L(c, 1)],
  "Sarpa Yoga": () => ["Rahu", "Ketu"],
};

export function yogaKeyPlanets(c: ChartData, name: string, category: string): PlanetId[] {
  let list: PlanetId[] = [];
  try {
    list = KEY[name]?.(c) ?? [];
  } catch {
    list = [];
  }
  if (!list.length) {
    if (category === "Chandra Yogas") list = ["Moon"];
    else if (category === "Surya Yogas") list = ["Sun"];
    else list = [L(c, 1), "Jupiter"];
  }
  return Array.from(new Set(list));
}

/* ---------- tips ---------- */
const MAHAPURUSHA_TIP: Record<string, string> = {
  "Ruchaka Yoga": "Channel Mars through sport, martial arts, engineering, real estate or leadership in uniform; keep anger disciplined",
  "Bhadra Yoga": "Use Mercury through study, writing, trading, teaching or technology; keep learning continuously",
  "Hamsa Yoga": "Express Jupiter through teaching, counselling, law or spiritual practice; honour teachers",
  "Malavya Yoga": "Express Venus through art, music, design, hospitality or beauty; keep relationships refined and respectful",
  "Sasa Yoga": "Express Saturn through service, organisation, public work and patient discipline; treat workers fairly",
};

const LIFE_TIP: Record<string, Remedy[]> = {
  "Vidya Yoga": [{ kind: "Puja", text: "Worship Goddess Saraswati, especially on Vasant Panchami and Thursdays" }],
  "Putra Yoga": [{ kind: "Mantra", text: "Chant Santana Gopala mantra: \"Om Devaki Suta Govinda Vasudeva Jagatpate, Dehi Me Tanayam Krishna Tvamaham Sharanam Gatah\"" }],
  "Kalatra Sukha Yoga": [{ kind: "Puja", text: "Worship Uma-Maheshwara (Shiva-Parvati) together on Mondays / Fridays for marital harmony" }],
  "Videsh Yoga": [{ kind: "Lifestyle", text: "Foreign opportunities peak in Rahu and 12th-lord periods — prepare documents, languages and skills in advance" }],
  "Sukha Yoga": [{ kind: "Lifestyle", text: "Serve and respect your mother; keep the north-east of the home clean and clutter-free" }],
  "Vahana Yoga": [{ kind: "Timing", text: "Buy vehicles on Fridays in Venus or 4th-lord periods, avoiding Rahu Kaal" }],
  "Kirti Yoga": [{ kind: "Puja", text: "Offer Arghya to the rising Sun and recite Aditya Hridayam on Sundays" }],
  "Ayur Yoga": [{ kind: "Mantra", text: "Recite Maha Mrityunjaya mantra 108 times daily for health and longevity" }],
  "Bhagya Yoga": [{ kind: "Lifestyle", text: "Respect your father, guru and elders; go on pilgrimages — fortune flows through dharma" }],
};

const BAD_SPECIFIC: Record<string, Remedy[]> = {
  "Kemadruma Yoga": [
    { kind: "Puja", text: "Offer milk/water to Shivling on Mondays and worship Goddess Parvati" },
    { kind: "Gemstone", text: "A natural Pearl in silver (right little finger, Monday) after consultation" },
    { kind: "Lifestyle", text: "Stay socially connected, keep a regular sleep routine, respect and serve your mother" },
  ],
  "Shakata Yoga": [
    { kind: "Puja", text: "Worship Lord Vishnu / Brihaspati on Thursdays; recite Vishnu Sahasranama" },
    { kind: "Charity", text: "Donate turmeric, chana dal and yellow cloth on Thursdays" },
    { kind: "Lifestyle", text: "Build savings during good phases to cushion the ups and downs this yoga brings" },
  ],
  "Daridra Yoga": [
    { kind: "Mantra", text: "Recite Sri Suktam or Kanakadhara Stotram on Fridays" },
    { kind: "Puja", text: "Perform Lakshmi-Kubera puja on Fridays / Dhanteras" },
    { kind: "Charity", text: "Feed the poor and donate a fixed portion of income regularly" },
    { kind: "Lifestyle", text: "Avoid loans, speculation and lending money; keep the north (Kubera) direction of home clean" },
  ],
  "Grahan Yoga": [
    { kind: "Mantra", text: "Recite Aditya Hridayam (for Sun) or Chandra Kavacham (for Moon); Rahu/Ketu beej mantras on Saturdays" },
    { kind: "Charity", text: "Donate during solar/lunar eclipses — sesame, blankets, food" },
    { kind: "Puja", text: "Grahan Dosha shanti puja; worship Lord Shiva" },
  ],
  "Guru Chandal Yoga": [
    { kind: "Puja", text: "Guru-Rahu shanti puja; recite Vishnu Sahasranama on Thursdays" },
    { kind: "Lifestyle", text: "Respect teachers and elders, avoid unethical shortcuts and blind beliefs" },
    { kind: "Charity", text: "Donate yellow items on Thursdays and feed dogs on Saturdays" },
  ],
  "Angarak Yoga": [
    { kind: "Mantra", text: "Recite Hanuman Chalisa daily, especially on Tuesdays" },
    { kind: "Puja", text: "Mangal-Rahu (Angarak) shanti puja, preferably at Ujjain Mangalnath temple" },
    { kind: "Lifestyle", text: "Control anger, avoid rash driving, fire and sharp tools; exercise regularly" },
    { kind: "Charity", text: "Donate red lentils and jaggery on Tuesdays" },
  ],
  "Vish Yoga": [
    { kind: "Puja", text: "Rudrabhishek on Mondays; Shani puja on Saturdays" },
    { kind: "Mantra", text: "Maha Mrityunjaya mantra daily; Shani mantra on Saturdays" },
    { kind: "Lifestyle", text: "Meditation and pranayama to lighten melancholy; serve the elderly" },
  ],
  "Shrapit Yoga": [
    { kind: "Puja", text: "Shrapit Dosha Nivaran puja; Shani-Rahu shanti" },
    { kind: "Charity", text: "Feed crows, dogs and the needy on Saturdays; donate black sesame and mustard oil" },
    { kind: "Mantra", text: "Recite Shani Stotra and Rahu mantra on Saturdays" },
  ],
  "Papa Kartari Yoga": [
    { kind: "Mantra", text: "Maha Mrityunjaya mantra daily for protection of health" },
    { kind: "Puja", text: "Offer Arghya to the Sun each morning to strengthen the Lagna" },
  ],
  "Chandra Papa Kartari": [
    { kind: "Mantra", text: "Chant \"Om Som Somaya Namah\" on Mondays" },
    { kind: "Lifestyle", text: "Daily meditation, adequate rest; avoid negative company that disturbs the mind" },
  ],
  "Duryoga": [
    { kind: "Puja", text: "Offer Arghya to the Sun and worship the 10th lord's deity for career stability" },
    { kind: "Lifestyle", text: "Work with integrity and patience; avoid office politics and shortcuts" },
  ],
  "Lagna Lord in Dusthana": [
    { kind: "Lifestyle", text: "Keep a disciplined health routine — sleep, diet and exercise; regular check-ups" },
    { kind: "Gemstone", text: "The Lagna lord's gemstone is always safe to wear and protects vitality (after consultation)" },
  ],
  "Sarpa Yoga": [
    { kind: "Puja", text: "Naga puja / Sarpa Samskara; offer milk to a Shivling on Mondays" },
    { kind: "Mantra", text: "Maha Mrityunjaya mantra; Navagraha stotra" },
  ],
  "Dainya Parivartana Yoga": [{ kind: "Puja", text: "Pacify the dusthana lord involved in the exchange through its mantra and charity" }],
  "Khala Parivartana Yoga": [{ kind: "Mantra", text: "Hanuman Chalisa on Tuesdays and Saturdays to stabilise temperament" }],
};

function categoryTips(name: string, category: string, nature: "good" | "bad" | "mixed"): Remedy[] {
  if (nature === "bad") return BAD_SPECIFIC[name] ?? [{ kind: "Lifestyle", text: "Maintain discipline and charity; afflictions reduce with conscious effort and devotion" }];
  const out: Remedy[] = [];
  if (MAHAPURUSHA_TIP[name]) out.push({ kind: "Lifestyle", text: MAHAPURUSHA_TIP[name] });
  if (LIFE_TIP[name]) out.push(...LIFE_TIP[name]);
  if (BAD_SPECIFIC[name]) out.push(...BAD_SPECIFIC[name]);
  switch (category) {
    case "Raja Yogas":
      out.push({ kind: "Lifestyle", text: "Raja yogas fructify through ethical action — accept responsibility and leadership, especially in the activation periods" });
      out.push({ kind: "Puja", text: "Satyanarayana puja on Purnima for sustained rise and protection of status" });
      break;
    case "Dhana & Named Yogas":
      out.push({ kind: "Mantra", text: "Recite Sri Suktam / Lakshmi Ashtottaram on Fridays to sustain prosperity" });
      out.push({ kind: "Charity", text: "Donate a fixed share of gains — wealth yogas grow when wealth circulates" });
      break;
    case "Chandra Yogas":
      out.push({ kind: "Puja", text: "Offer milk/water to Lord Shiva on Mondays; respect and serve your mother" });
      break;
    case "Surya Yogas":
      out.push({ kind: "Puja", text: "Offer Arghya to the rising Sun; recite Aditya Hridayam on Sundays" });
      break;
    case "Nabhasa Yogas":
      out.push({ kind: "Lifestyle", text: "Nabhasa yogas describe life's overall pattern — honour your Lagna lord and live according to its nature" });
      break;
    case "Pancha Mahapurusha":
      out.push({ kind: "Puja", text: "Worship the planet's deity on its weekday to keep this great-person yoga active" });
      break;
  }
  if (nature === "mixed") out.push({ kind: "Lifestyle", text: "This yoga has two sides — use its energy constructively and avoid its excesses" });
  return out;
}

/* ---------- activation timing ---------- */
export function activationPeriods(c: ChartData, planets: PlanetId[], now: number, max = 4): string[] {
  const out: string[] = [];
  for (const md of c.dashas) {
    if (md.end < now) continue;
    for (const ad of subPeriods(md)) {
      if (ad.end < now) continue;
      if (planets.includes(md.lord) || planets.includes(ad.lord)) {
        const both = planets.includes(md.lord) && planets.includes(ad.lord);
        const cur = ad.start <= now && ad.end > now;
        out.push(`${md.lord}–${ad.lord}${both ? " (strongest)" : ""}: ${fmt(ad.start)} – ${fmt(ad.end)}${cur ? " · running now" : ""}`);
        if (out.length >= max) return out;
      }
    }
  }
  return out;
}

export function yogaRemedies(c: ChartData, name: string, category: string, nature: "good" | "bad" | "mixed", now: number): { planets: PlanetId[]; remedies: Remedy[]; activation: string[] } {
  const planets = yogaKeyPlanets(c, name, category);
  const remedies: Remedy[] = [];
  for (const id of planets.slice(0, 3)) {
    const mode = nature === "bad" ? "pacify" : "strengthen";
    remedies.push(...planetRemedies(c, id, mode).filter((r, i) => i === 0 || r.kind !== "Fasting"));
  }
  remedies.push(...categoryTips(name, category, nature));
  remedies.push({ kind: "Puja", text: `Worship ${planets.map((id) => `${WORSHIP[id]} (for ${id}, on ${PLANET_INFO[id].day}s)`).join("; ")}` });
  const activation = activationPeriods(c, planets, now, nature === "bad" ? 3 : 4);
  if (activation.length) remedies.push({ kind: "Timing", text: `${nature === "bad" ? "Most felt (do remedies intensively) during" : "Activates during"} ${activation[0].split(":")[0]} (${activation[0].split(": ")[1]})` });
  return { planets, remedies: dedupe(remedies), activation };
}

export function dedupe(r: Remedy[]) {
  const seen = new Set<string>();
  return r.filter((x) => (seen.has(x.text) ? false : (seen.add(x.text), true)));
}
