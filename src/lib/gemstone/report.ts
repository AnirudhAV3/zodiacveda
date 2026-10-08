import { fmtDeg, type ChartData } from "@/lib/astro/calc";
import { NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { avakhada, dignity, functionalNature, houseLord, housesOwned, planet } from "@/lib/astro/analysis";
import { allPlanetReports } from "@/lib/astro/planetReport";
import { computeShadbala } from "@/lib/astro/shadbala";

export type GemVerdict = "primary" | "supportive" | "neutral" | "avoid";

export interface GemAdvice {
  planet: PlanetId;
  stone: string;
  substitutes: string[];
  verdict: GemVerdict;
  /** Traditional role when recommended: Life / Fortune / Prosperity stone. */
  role: string | null;
  reasons: string[];
  ownsHouses: number[];
  functional: string;
  dignityLabel: string;
  strength: number;
  shadbala: string;
  carat: string;
  metal: string;
  finger: string;
  day: string;
  time: string;
  mantra: string;
  mantraCount: number;
  conflictsWith: string[];
}

export interface GemReport {
  version: string;
  kind: "gemstone";
  calculatedAt: string;
  method: string;
  lagna: string;
  lagnaLord: PlanetId;
  primary: GemAdvice[];
  supportive: GemAdvice[];
  avoid: GemAdvice[];
  neutral: GemAdvice[];
  all: GemAdvice[];
  wearingSteps: string[];
  testingAdvice: string[];
  chartSummary: {
    name: string; date: string; time: string; place: string;
    lagnaSign: string; moonSign: string; nakshatra: string; pada: number;
    planets: { id: PlanetId; sign: string; degree: string; house: number; dignity: string; owns: number[] }[];
  };
  notes: string[];
}

/** Traditional lower-cost substitutes (upratna). Not identical in effect; disclosed as such. */
const SUBSTITUTES: Record<PlanetId, string[]> = {
  Sun: ["Red Garnet", "Red Spinel", "Sunstone"],
  Moon: ["Moonstone", "White Coral", "Cultured Pearl"],
  Mars: ["Carnelian", "Red Jasper"],
  Mercury: ["Green Tourmaline", "Peridot", "Jade"],
  Jupiter: ["Yellow Topaz", "Citrine"],
  Venus: ["White Sapphire", "White Topaz", "White Zircon"],
  Saturn: ["Amethyst", "Lapis Lazuli", "Blue Spinel"],
  Rahu: ["Spessartite Garnet", "Orange Zircon"],
  Ketu: ["Cat's Eye Quartz", "Apatite Cat's Eye"],
};

const WEAR: Record<PlanetId, { carat: string; finger: string; time: string }> = {
  Sun: { carat: "3–5 ratti (approx. 2.7–4.5 carat)", finger: "Ring finger", time: "Within one hour after sunrise" },
  Moon: { carat: "4–6 ratti (approx. 3.6–5.4 carat)", finger: "Little finger", time: "Evening, after moonrise" },
  Mars: { carat: "6–9 ratti (approx. 5.4–8.1 carat)", finger: "Ring finger", time: "One hour after sunrise" },
  Mercury: { carat: "3–6 ratti (approx. 2.7–5.4 carat)", finger: "Little finger", time: "Two hours after sunrise" },
  Jupiter: { carat: "3–5 ratti (approx. 2.7–4.5 carat)", finger: "Index finger", time: "Morning, before noon" },
  Venus: { carat: "0.5–1 carat (diamond) or 3–5 ratti (white sapphire)", finger: "Middle or little finger", time: "Early morning, around sunrise" },
  Saturn: { carat: "4–6 ratti (approx. 3.6–5.4 carat)", finger: "Middle finger", time: "Evening, around sunset" },
  Rahu: { carat: "6–9 ratti (approx. 5.4–8.1 carat)", finger: "Middle finger", time: "Evening or night" },
  Ketu: { carat: "3–5 ratti (approx. 2.7–4.5 carat)", finger: "Little finger", time: "Late night or before dawn" },
};

const MARAKA = [2, 7];
const DUSTHANA = [6, 8, 12];

function conflicts(id: PlanetId): string[] {
  return PLANET_INFO[id].enemies.filter((e) => !["Rahu", "Ketu"].includes(e)).map((e) => PLANET_INFO[e].gem.split(" (")[0]);
}

export function buildGemReport(c: ChartData, now = Date.now()): GemReport {
  const reports = allPlanetReports(c);
  const shadbala = computeShadbala(c).rows;
  const lagnaLord = houseLord(c, 1);
  const ninthLord = houseLord(c, 9);
  const fifthLord = houseLord(c, 5);
  const a = avakhada(c);

  const roleOf = (id: PlanetId): string | null => {
    const roles: string[] = [];
    if (id === lagnaLord) roles.push("Life stone (Lagna lord)");
    if (id === ninthLord) roles.push("Fortune stone (9th lord)");
    if (id === fifthLord) roles.push("Prosperity stone (5th lord)");
    return roles.length ? roles.join(" · ") : null;
  };

  const all: GemAdvice[] = (Object.keys(PLANET_INFO) as PlanetId[]).map((id) => {
    const p = planet(c, id);
    const pi = PLANET_INFO[id];
    const owns = housesOwned(c, id);
    const fn = functionalNature(c, id);
    const dg = dignity(id, p.sign, p.deg, c);
    const row = shadbala.find((r) => r.id === id);
    const strength = reports.find((r) => r.id === id)?.score ?? 0;
    const role = roleOf(id);
    const reasons: string[] = [];
    let verdict: GemVerdict;

    if (id === "Rahu" || id === "Ketu") {
      // Shadow planets own no sign; their stones are traditionally worn only for specific
      // remedial purposes under personal guidance, never as a general recommendation.
      verdict = "avoid";
      reasons.push(`${id} is a shadow planet that rules no sign, so it has no functional benefic role for any ascendant.`);
      reasons.push(`${pi.gem} is traditionally prescribed only for a specific, diagnosed ${id} problem and under direct supervision — not as a general recommendation.`);
    } else if (role) {
      verdict = "primary";
      reasons.push(`${id} rules ${role.includes("Lagna") ? "your ascendant" : role.includes("9th") ? "your 9th house of fortune" : "your 5th house"}, so its stone is classically considered safe and beneficial for you.`);
      if (owns.some((h) => DUSTHANA.includes(h))) reasons.push(`Note: ${id} also rules house ${owns.filter((h) => DUSTHANA.includes(h)).join(" & ")}, so some astrologers would use this stone more cautiously.`);
    } else if (!fn.good) {
      verdict = "avoid";
      reasons.push(`${id} is a functional malefic for ${SIGNS[c.asc.sign].en} ascendant (rules house${owns.length > 1 ? "s" : ""} ${owns.join(" & ")}).`);
      reasons.push("Strengthening a functional malefic with its gemstone can amplify the difficulties of the houses it rules.");
    } else if (owns.some((h) => [4, 7, 10].includes(h))) {
      verdict = "supportive";
      reasons.push(`${id} rules the angular house${owns.filter((h) => [4, 7, 10].includes(h)).length > 1 ? "s" : ""} ${owns.filter((h) => [4, 7, 10].includes(h)).join(" & ")}, so its stone can support those areas.`);
      if (owns.some((h) => MARAKA.includes(h))) reasons.push(`${id} also rules the maraka house ${owns.filter((h) => MARAKA.includes(h)).join(" & ")} — use only with guidance.`);
    } else {
      verdict = "neutral";
      reasons.push(`${id} is neither a primary benefic nor a functional malefic for your ascendant; its stone is optional rather than recommended.`);
    }

    if (verdict === "primary" || verdict === "supportive") {
      if (strength < 45) reasons.push(`${id} is currently weak in your chart (${strength}/100), which is the classical situation where a supporting stone is considered.`);
      else reasons.push(`${id} is already reasonably strong (${strength}/100), so the stone is optional rather than necessary.`);
      if (dg === "Debilitated") reasons.push(`${id} is debilitated in ${SIGNS[p.sign].en}; opinions differ on whether to strengthen a debilitated planet, so seek personal advice first.`);
    }

    return {
      planet: id,
      stone: pi.gem,
      substitutes: SUBSTITUTES[id],
      verdict,
      role,
      reasons,
      ownsHouses: owns,
      functional: fn.label,
      dignityLabel: dg,
      strength,
      shadbala: row ? `${row.rupas.toFixed(2)} / ${row.required} Rupas` : "Not applicable (shadow planet)",
      carat: WEAR[id].carat,
      metal: pi.metal,
      finger: WEAR[id].finger,
      day: pi.day,
      time: WEAR[id].time,
      mantra: pi.mantra,
      mantraCount: 108,
      conflictsWith: conflicts(id),
    };
  });

  return {
    version: "gemstone-1.0",
    kind: "gemstone",
    calculatedAt: new Date(now).toISOString(),
    method: "Classical gemstone selection by house lordship and functional nature · Lahiri sidereal · whole-sign houses",
    lagna: `${SIGNS[c.asc.sign].sa} (${SIGNS[c.asc.sign].en})`,
    lagnaLord,
    primary: all.filter((g) => g.verdict === "primary"),
    supportive: all.filter((g) => g.verdict === "supportive"),
    avoid: all.filter((g) => g.verdict === "avoid"),
    neutral: all.filter((g) => g.verdict === "neutral"),
    all,
    wearingSteps: [
      "Buy only a natural, untreated stone of the stated minimum weight from a seller who gives a laboratory certificate.",
      "Have it set in the prescribed metal so the stone's base touches the skin.",
      "On the evening before, soak the ring in raw milk or Ganga water, then rinse with clean water.",
      "On the prescribed weekday, at the prescribed time, recite the planet's mantra 108 times.",
      "Wear it on the prescribed finger of the right hand (left hand is also accepted for left-handed people).",
      "Observe how you feel over 30–40 days. If you notice consistent discomfort, anxiety or disturbed sleep, remove the stone and consult an astrologer.",
    ],
    testingAdvice: [
      "A gemstone is a traditional remedy, not a treatment. Never delay medical, legal or financial help because of one.",
      "Try a lower-cost substitute first. If a stone genuinely suits you, the inexpensive version should also feel settling.",
      "Be sceptical of anyone who insists on an urgent, very expensive stone to 'remove' a problem.",
      "Never wear stones of mutually inimical planets together without personal guidance.",
      "Blue Sapphire and Hessonite are the stones most often reported as unsettling; test them on a trial basis before purchase if possible.",
    ],
    chartSummary: {
      name: c.input.name, date: c.input.date, time: c.input.time, place: c.input.place,
      lagnaSign: `${a.lagna.sa} (${a.lagna.en})`,
      moonSign: `${a.rashi.sa} (${a.rashi.en})`,
      nakshatra: NAKSHATRAS[planet(c, "Moon").nak].name,
      pada: a.pada,
      planets: c.planets.map((p) => ({
        id: p.id, sign: SIGNS[p.sign].sa, degree: fmtDeg(p.deg), house: p.house,
        dignity: dignity(p.id, p.sign, p.deg, c), owns: housesOwned(c, p.id),
      })),
    },
    notes: [
      "Recommendations follow the classical rule of house lordship: stones of the ascendant, 9th and 5th lords are considered safe, and stones of functional malefics are avoided.",
      "This is calculated from your own chart with the same engine as your main horoscope: Lahiri sidereal ayanamsa, whole-sign houses and mean lunar nodes.",
      "Rahu and Ketu stones are listed under 'avoid' because they rule no sign. That is a deliberate safety-first position, not a claim that they are harmful to everyone.",
      "Weight ranges are the common traditional guidance. Practitioners differ, and body weight is sometimes used to set the carat — treat the figures as a starting point.",
      "Substitutes (upratna) are traditionally regarded as milder, not identical. They are suggested so you can test a stone without large expense.",
      "Astrologers genuinely disagree about gemstones, especially for debilitated planets and for Blue Sapphire. A second opinion is reasonable.",
      "This is traditional interpretive guidance. It is not medical, financial or legal advice, and no gemstone can guarantee an outcome.",
    ],
  };
}
