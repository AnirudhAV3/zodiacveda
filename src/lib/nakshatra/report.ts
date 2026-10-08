import { fmtDeg, type ChartData } from "@/lib/astro/calc";
import { BHAVAS, NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { avakhada, dignity, lucky, planet } from "@/lib/astro/analysis";
import { avakahadaFull, ghatak, sunrisePanchang, taraChakra } from "@/lib/astro/extended";
import { WORSHIP, type Remedy } from "@/lib/astro/remedies";

export interface NakshatraPoint {
  title: string;
  text: string;
}

export interface NakshatraReport {
  version: string;
  kind: "nakshatra-rashi";
  calculatedAt: string;
  method: string;
  moon: {
    longitude: number;
    sign: number;
    signName: string;
    degree: string;
    nak: number;
    nakshatra: string;
    pada: number;
    lord: PlanetId;
    padaNavamsa: string;
    startDegree: string;
    endDegree: string;
    traversedPercent: number;
  };
  nakshatra: {
    deity: string;
    symbol: string;
    nature: string;
    gana: string;
    yoni: string;
    yoniGender: string;
    nadi: string;
    syllables: string[];
    birthSyllable: string;
    traits: string;
    strengths: string[];
    watchFor: string[];
    fourPadas: { pada: number; syllable: string; navamsa: string; focus: string; active: boolean }[];
  };
  rashi: {
    sanskrit: string;
    english: string;
    glyph: string;
    lord: PlanetId;
    element: string;
    quality: string;
    gender: string;
    guna: string;
    purushartha: string;
    direction: string;
    varna: string;
    vashya: string;
    archetype: string;
    symbol: string;
    strengths: string[];
    watchFor: string[];
    body: string;
  };
  moonCondition: {
    house: number;
    dignity: string;
    waxing: boolean;
    nakLordSign: string;
    nakLordHouse: number;
    nakLordDignity: string;
    summary: string;
  };
  panchang: Record<string, string | number>;
  avakhada: Record<string, string | number>;
  ghatak: Record<string, string>;
  tara: { tara: string; naks: string[] }[];
  lucky: {
    days: string[];
    numbers: number[];
    colors: string[];
    direction: string;
    lifeStone: string;
    luckyStone: string;
    fortuneStone: string;
    deity: string;
    ishtaDevata: string;
    mantra: string;
  };
  interpretations: NakshatraPoint[];
  remedies: Remedy[];
  chartSummary: { name: string; date: string; time: string; place: string; lagna: string; sun: string };
  notes: string[];
}

const PADA_FOCUS = [
  "Initiation and direct expression — the nakshatra's qualities emerge actively and independently.",
  "Material development and stability — the nakshatra seeks to build, preserve and make its gifts practical.",
  "Communication and learning — the nakshatra works through ideas, skills, exchange and social intelligence.",
  "Emotional completion and inner meaning — the nakshatra turns toward relationships, intuition and spiritual growth.",
];

function splitList(s: string) {
  return s.split(";").map((v) => v.trim()).filter(Boolean);
}

export function buildNakshatraReport(c: ChartData, now = Date.now()): NakshatraReport {
  const moon = planet(c, "Moon");
  const sun = planet(c, "Sun");
  const nak = NAKSHATRAS[moon.nak];
  const sign = SIGNS[moon.sign];
  const nakLord = planet(c, nak.lord);
  const a = avakhada(c);
  const av = avakahadaFull(c);
  const lk = lucky(c);
  const span = 360 / 27;
  const startLon = moon.nak * span;
  const endLon = startLon + span;
  const within = moon.lon - startLon;
  const waxingDistance = (moon.lon - sun.lon + 360) % 360;
  const waxing = waxingDistance > 0 && waxingDistance < 180;
  const moonDignity = dignity("Moon", moon.sign, moon.deg, c);
  const lordDignity = dignity(nak.lord, nakLord.sign, nakLord.deg, c);

  const padaNavamsas = Array.from({ length: 4 }, (_, i) => SIGNS[Math.floor((startLon + (i + .5) * (span / 4)) / (30 / 9)) % 12].en);
  const interpretations: NakshatraPoint[] = [
    {
      title: "Mind & emotional nature",
      text: `${nak.name} gives ${nak.traits.charAt(0).toLowerCase() + nak.traits.slice(1)} Your Moon sign ${sign.en} adds: ${sign.archetype.charAt(0).toLowerCase() + sign.archetype.slice(1)} The Moon is ${waxing ? "waxing" : "waning"} and ${moonDignity.toLowerCase()} in house ${moon.house}, so emotions are expressed most strongly through ${BHAVAS[moon.house - 1].title.toLowerCase()}.`,
    },
    {
      title: "Talents",
      text: `The nakshatra's ${nak.nature.toLowerCase()} nature and ${sign.element.toLowerCase()} element favour ${splitList(sign.strengths).slice(0, 5).join(", ").toLowerCase()}. Your ${moon.pada}${moon.pada === 1 ? "st" : moon.pada === 2 ? "nd" : moon.pada === 3 ? "rd" : "th"} pada emphasises ${PADA_FOCUS[moon.pada - 1].charAt(0).toLowerCase() + PADA_FOCUS[moon.pada - 1].slice(1)}`,
    },
    {
      title: "Work & contribution",
      text: `${nak.lord} rules your birth star and is placed in ${SIGNS[nakLord.sign].en}, house ${nakLord.house} (${lordDignity}). Its natural themes — ${PLANET_INFO[nak.lord].karaka.toLowerCase()} — connect your nakshatra's promise to ${BHAVAS[nakLord.house - 1].title.toLowerCase()}. Careers or roles involving ${PLANET_INFO[nak.lord].significations.split(",").slice(0, 6).join(",").toLowerCase()} can feel meaningful.`,
    },
    {
      title: "Relationships",
      text: `${nak.gana} Gana describes your traditional temperament group, while ${nak.yoni} Yoni is a symbolic instinct style. ${sign.quality} ${sign.en} seeks ${sign.quality === "Fixed" ? "loyalty and continuity" : sign.quality === "Movable" ? "growth, movement and initiative" : "adaptability and intellectual exchange"}. These labels are not moral judgments or a substitute for communication and consent.`,
    },
    {
      title: "Growth edge",
      text: `Watch for ${splitList(sign.challenges).slice(0, 6).join(",").toLowerCase()}. The birth-star lord's position suggests that maturity comes through the responsibilities of house ${nakLord.house}: ${BHAVAS[nakLord.house - 1].significations.split(",").slice(0, 5).join(",").toLowerCase()}.`,
    },
  ];

  const remedies: Remedy[] = [
    { kind: "Puja", text: `Worship ${nak.deity}, the deity of ${nak.name}, or ${WORSHIP[nak.lord]} for the nakshatra lord ${nak.lord}.` },
    { kind: "Mantra", text: `Chant “${PLANET_INFO[nak.lord].mantra}” 108 times on ${PLANET_INFO[nak.lord].day}s.` },
    { kind: "Charity", text: `Donate ${PLANET_INFO[nak.lord].grain.toLowerCase()} on ${PLANET_INFO[nak.lord].day}s if it fits your practice.` },
    { kind: "Lifestyle", text: `Use your birth syllable ${a.syllable} for a personal mantra, project name or ceremonial name if meaningful; it is optional, not a requirement for your legal name.` },
    { kind: "Gemstone", text: `Do not wear ${PLANET_INFO[nak.lord].gem} merely because ${nak.lord} rules your nakshatra. Gemstones require ascendant-based functional analysis; consult the dedicated gemstone calculator.` },
  ];

  return {
    version: "nakshatra-rashi-1.0",
    kind: "nakshatra-rashi",
    calculatedAt: new Date(now).toISOString(),
    method: "Moon Nakshatra, Pada, Rashi, Avakhada and sunrise Panchang · Lahiri sidereal · whole-sign houses",
    moon: {
      longitude: moon.lon,
      sign: moon.sign,
      signName: sign.en,
      degree: fmtDeg(moon.deg),
      nak: moon.nak,
      nakshatra: nak.name,
      pada: moon.pada,
      lord: nak.lord,
      padaNavamsa: SIGNS[moon.d9].en,
      startDegree: `${SIGNS[Math.floor(startLon / 30)].en} ${fmtDeg(startLon % 30)}`,
      endDegree: `${SIGNS[Math.floor((endLon - 1e-9) / 30)].en} ${fmtDeg((endLon + 1e-8) % 30)}`,
      traversedPercent: Math.round((within / span) * 1000) / 10,
    },
    nakshatra: {
      deity: nak.deity,
      symbol: nak.symbol,
      nature: nak.nature,
      gana: nak.gana,
      yoni: nak.yoni,
      yoniGender: nak.yoniGender,
      nadi: nak.nadi,
      syllables: [...nak.syllables],
      birthSyllable: a.syllable,
      traits: nak.traits,
      strengths: splitList(sign.strengths),
      watchFor: splitList(sign.challenges),
      fourPadas: nak.syllables.map((syllable, i) => ({ pada: i + 1, syllable, navamsa: padaNavamsas[i], focus: PADA_FOCUS[i], active: moon.pada === i + 1 })),
    },
    rashi: {
      sanskrit: sign.sa,
      english: sign.en,
      glyph: sign.glyph,
      lord: sign.lord,
      element: sign.element,
      quality: sign.quality,
      gender: sign.gender,
      guna: sign.guna,
      purushartha: sign.purushartha,
      direction: sign.direction,
      varna: sign.varna,
      vashya: sign.vashya,
      archetype: sign.archetype,
      symbol: sign.symbol,
      strengths: splitList(sign.strengths),
      watchFor: splitList(sign.challenges),
      body: sign.body,
    },
    moonCondition: {
      house: moon.house,
      dignity: moonDignity,
      waxing,
      nakLordSign: SIGNS[nakLord.sign].en,
      nakLordHouse: nakLord.house,
      nakLordDignity: lordDignity,
      summary: `Moon is ${waxing ? "waxing" : "waning"}, ${moonDignity.toLowerCase()}, in house ${moon.house}. Nakshatra lord ${nak.lord} is ${lordDignity.toLowerCase()} in ${SIGNS[nakLord.sign].en}, house ${nakLord.house}.`,
    },
    panchang: sunrisePanchang(c),
    avakhada: av,
    ghatak: ghatak(c),
    tara: taraChakra(c),
    lucky: {
      days: lk.days,
      numbers: lk.numbers,
      colors: lk.colors,
      direction: lk.direction,
      lifeStone: lk.lifeStone,
      luckyStone: lk.luckyStone,
      fortuneStone: lk.fortuneStone,
      deity: lk.deity,
      ishtaDevata: lk.ishtaDevata,
      mantra: lk.mantra,
    },
    interpretations,
    remedies,
    chartSummary: {
      name: c.input.name,
      date: c.input.date,
      time: c.input.time,
      place: c.input.place,
      lagna: `${a.lagna.sa} (${a.lagna.en})`,
      sun: `${a.sunSign.sa} (${a.sunSign.en})`,
    },
    notes: [
      "Moon sign and nakshatra are calculated with the same engine as the main horoscope: Lahiri sidereal ayanamsa, whole-sign houses and mean lunar nodes.",
      "The nakshatra spans exactly 13°20′ and each pada 3°20′. The degree and progress bar come from the Moon's calculated sidereal longitude, not from the calendar date alone.",
      "Avakhada classifications (Gana, Yoni, Nadi, Varna, Vashya and Paya) are traditional symbolic categories. They are not caste, character, health or genetic assessments.",
      "Personality text combines the Moon sign, nakshatra, pada, Moon house and birth-star lord. It describes tendencies, not fixed traits or guaranteed events.",
      "Tara Chakra lists the nine star relationships from your Janma Nakshatra. It is a reference table, not a daily muhurta calculation.",
      "Gemstones are not prescribed by nakshatra lord alone; use ascendant-based functional analysis in the gemstone calculator.",
      "This is traditional interpretive guidance, not medical, financial, legal or psychological advice.",
    ],
  };
}
