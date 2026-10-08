import { fmtDeg, type ChartData } from "@/lib/astro/calc";
import { NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { avakhada, dignity, planet } from "@/lib/astro/analysis";
import { VARGAS, vargaSign, vimsopaka } from "@/lib/astro/extended";

export interface VargaPlacement {
  id: PlanetId;
  sign: number;
  house: number;
  dignity: string;
  vargottama: boolean;
}

export interface VargaChart {
  code: string;
  division: number;
  name: string;
  purpose: string;
  detail: string;
  ascSign: number;
  placements: VargaPlacement[];
  strongPlanets: PlanetId[];
  weakPlanets: PlanetId[];
}

export interface VimsopakaRow {
  id: PlanetId;
  shadVarga: { score: number; count: number; name: string };
  saptVarga: { score: number; count: number; name: string };
  dasaVarga: { score: number; count: number; name: string };
  shodashVarga: { score: number; count: number; name: string };
  label: string;
}

export interface VargaReport {
  version: string;
  kind: "divisional-charts";
  calculatedAt: string;
  method: string;
  style: "north" | "south";
  charts: VargaChart[];
  vimsopaka: VimsopakaRow[];
  vargottama: { id: PlanetId; charts: string[] }[];
  strongestPlanet: { id: PlanetId; score: number } | null;
  weakestPlanet: { id: PlanetId; score: number } | null;
  chartSummary: {
    name: string; date: string; time: string; place: string;
    lagnaSign: string; moonSign: string; nakshatra: string; pada: number;
    planets: { id: PlanetId; sign: string; degree: string; house: number; dignity: string; retro: boolean }[];
  };
  notes: string[];
}

/** What each divisional chart is traditionally read for. */
const PURPOSE: Record<number, { purpose: string; detail: string }> = {
  1: { purpose: "The whole life", detail: "The birth chart itself — body, personality and every area of life. Every other division is read as a refinement of this one, never in place of it." },
  2: { purpose: "Wealth & resources", detail: "Hora divides each sign into Sun and Moon halves and is read for earning capacity and the accumulation of money." },
  3: { purpose: "Siblings & courage", detail: "Drekkana is read for brothers and sisters, initiative, stamina and self-effort." },
  4: { purpose: "Home & property", detail: "Chaturthamsa is read for fixed assets, land, house, vehicles and domestic comfort." },
  7: { purpose: "Children & progeny", detail: "Saptamsa is read for children, fertility and the continuation of the family line." },
  9: { purpose: "Marriage & inner strength", detail: "Navamsa is the most important division after the birth chart: marriage, dharma, and the real strength behind a planet's promise." },
  10: { purpose: "Career & status", detail: "Dasamsa is read for profession, authority, recognition and achievements in the world." },
  12: { purpose: "Parents & lineage", detail: "Dwadasamsa is read for mother, father, ancestry and inherited tendencies." },
  16: { purpose: "Vehicles & comforts", detail: "Shodasamsa is read for conveyances, luxuries and general happiness or discontent." },
  20: { purpose: "Spiritual practice", detail: "Vimsamsa is read for worship, devotion, religious discipline and spiritual progress." },
  24: { purpose: "Education & learning", detail: "Chaturvimsamsa is read for study, academic success, skill and scholarship." },
  27: { purpose: "Strengths & weaknesses", detail: "Saptavimsamsa (Bhamsa) is read for innate vitality, resilience and areas of natural weakness." },
  30: { purpose: "Misfortunes & character", detail: "Trimsamsa is read for troubles, bad habits, moral conduct and sources of difficulty." },
  40: { purpose: "Maternal legacy", detail: "Khavedamsa is read for auspicious and inauspicious effects inherited from the maternal line." },
  45: { purpose: "Paternal legacy & conduct", detail: "Akshavedamsa is read for general character and effects inherited from the paternal line." },
  60: { purpose: "Past-life karma", detail: "Shashtiamsa is the finest division and is read for accumulated karma. It is extremely sensitive to birth-time accuracy." },
};

export function buildVargaReport(c: ChartData, now = Date.now()): VargaReport {
  const a = avakhada(c);
  const vim = vimsopaka(c);

  const charts: VargaChart[] = VARGAS.map(([division, name]) => {
    const ascSign = vargaSign(c.asc.lon, division);
    const placements: VargaPlacement[] = c.planets.map((p) => {
      const sign = vargaSign(p.lon, division);
      return {
        id: p.id,
        sign,
        house: ((sign - ascSign + 12) % 12) + 1,
        // Divisional dignity uses the sign only; degree-based rules apply to D1.
        dignity: dignity(p.id, sign, division === 1 ? p.deg : undefined, c),
        vargottama: division !== 1 && sign === p.sign,
      };
    });
    const strongNames = ["Exalted", "Moolatrikona", "Own Sign"];
    return {
      code: `D${division}`,
      division,
      name,
      purpose: PURPOSE[division].purpose,
      detail: PURPOSE[division].detail,
      ascSign,
      placements,
      strongPlanets: placements.filter((p) => strongNames.includes(p.dignity)).map((p) => p.id),
      weakPlanets: placements.filter((p) => p.dignity === "Debilitated").map((p) => p.id),
    };
  });

  const vargottama = c.planets
    .map((p) => ({ id: p.id, charts: charts.filter((v) => v.division !== 1 && v.placements.find((q) => q.id === p.id)!.vargottama).map((v) => v.code) }))
    .filter((v) => v.charts.length > 0)
    .sort((x, y) => y.charts.length - x.charts.length);

  const rows: VimsopakaRow[] = vim.map((v) => {
    const score = v.ShodashVarga.score;
    return {
      id: v.id,
      shadVarga: v.ShadVarga,
      saptVarga: v.SaptVarga,
      dasaVarga: v.DasaVarga,
      shodashVarga: v.ShodashVarga,
      label: score >= 15 ? "Very strong" : score >= 12 ? "Strong" : score >= 9 ? "Moderate" : score >= 6 ? "Weak" : "Very weak",
    };
  });
  const ranked = [...rows].sort((x, y) => y.shodashVarga.score - x.shodashVarga.score);

  return {
    version: "divisional-charts-1.0",
    kind: "divisional-charts",
    calculatedAt: new Date(now).toISOString(),
    method: "Shodashvarga — 16 classical divisional charts with Vimsopaka strength · Lahiri sidereal · whole-sign houses",
    style: c.input.style,
    charts,
    vimsopaka: rows,
    vargottama,
    strongestPlanet: ranked.length ? { id: ranked[0].id, score: ranked[0].shodashVarga.score } : null,
    weakestPlanet: ranked.length ? { id: ranked[ranked.length - 1].id, score: ranked[ranked.length - 1].shodashVarga.score } : null,
    chartSummary: {
      name: c.input.name, date: c.input.date, time: c.input.time, place: c.input.place,
      lagnaSign: `${a.lagna.sa} (${a.lagna.en})`,
      moonSign: `${a.rashi.sa} (${a.rashi.en})`,
      nakshatra: NAKSHATRAS[planet(c, "Moon").nak].name,
      pada: a.pada,
      planets: c.planets.map((p) => ({
        id: p.id, sign: SIGNS[p.sign].sa, degree: fmtDeg(p.deg), house: p.house,
        dignity: dignity(p.id, p.sign, p.deg, c), retro: p.retro && !["Rahu", "Ketu"].includes(p.id),
      })),
    },
    notes: [
      "All 16 charts are derived from the same birth positions as your main horoscope: Lahiri sidereal ayanamsa, whole-sign houses and mean lunar nodes.",
      "A divisional chart refines one area of life. It is read together with the birth chart, never as a replacement for it.",
      "Vargottama means a planet occupies the same sign in a division as in the birth chart, which classically strengthens it. Every occurrence is listed.",
      "Dignity in a divisional chart is judged by sign only. The degree-based rules for exaltation and Moolatrikona apply to the birth chart.",
      "Vimsopaka strength is the classical weighted score out of 20 across four schemes (6, 7, 10 and 16 divisions).",
      "Finer divisions, especially D30, D40, D45 and D60, shift with a birth-time change of only a few minutes. Treat them as indicative unless your time is verified.",
      "Different schools use different formulas for some divisions, particularly D4, D16, D20, D24, D40 and D45. Another astrologer's chart may differ.",
      "This is traditional interpretive guidance. It is not medical, financial, legal or psychological advice.",
    ],
  };
}

export { PLANET_INFO, SIGNS };
