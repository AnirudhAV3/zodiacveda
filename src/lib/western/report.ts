import * as Astronomy from "astronomy-engine";
import type { ChartData } from "@/lib/astro/calc";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃",
  Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇", Rahu: "☊", Ketu: "☋",
};

const OUTER_BODIES = [
  ["Uranus", Astronomy.Body.Uranus],
  ["Neptune", Astronomy.Body.Neptune],
  ["Pluto", Astronomy.Body.Pluto],
] as const;

const ASPECTS = [
  { name: "Conjunction", angle: 0, orb: 8, tone: "fusion" },
  { name: "Sextile", angle: 60, orb: 4, tone: "easy" },
  { name: "Square", angle: 90, orb: 6, tone: "tense" },
  { name: "Trine", angle: 120, orb: 6, tone: "easy" },
  { name: "Opposition", angle: 180, orb: 8, tone: "tense" },
] as const;

const normalize = (degrees: number) => ((degrees % 360) + 360) % 360;
const signIndex = (degrees: number) => Math.floor(normalize(degrees) / 30);
const houseFrom = (degrees: number, ascendant: number) => Math.floor(normalize(degrees - ascendant) / 30) + 1;

function outerLongitude(body: Astronomy.Body, date: Date) {
  const ecliptic = Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true));
  return normalize(ecliptic.elon);
}

export function buildWesternReport(chart: ChartData) {
  const ascendant = normalize(chart.asc.lon + chart.ayanamsa);
  const positions = chart.planets.map((planet) => ({
    id: planet.id,
    longitude: planet.tropLon,
    retrograde: planet.retro,
  }));
  const birthDate = new Date(chart.utc);
  const outer = OUTER_BODIES.map(([id, body]) => {
    const longitude = outerLongitude(body, birthDate);
    const nextLongitude = outerLongitude(body, new Date(birthDate.getTime() + 86_400_000));
    let speed = nextLongitude - longitude;
    if (speed > 180) speed -= 360;
    if (speed < -180) speed += 360;
    return { id, longitude, retrograde: speed < -0.01 };
  });
  const bodies = [...positions, ...outer].map((position) => ({
    ...position,
    glyph: GLYPHS[position.id],
    sign: signIndex(position.longitude),
    degree: normalize(position.longitude) % 30,
    house: houseFrom(position.longitude, ascendant),
  }));
  const aspects: { a: string; b: string; name: string; orb: number; tone: string }[] = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      let separation = Math.abs(bodies[i].longitude - bodies[j].longitude);
      if (separation > 180) separation = 360 - separation;
      for (const aspect of ASPECTS) {
        const orb = Math.abs(separation - aspect.angle);
        if (orb <= aspect.orb) aspects.push({ a: bodies[i].id, b: bodies[j].id, name: aspect.name, orb, tone: aspect.tone });
      }
    }
  }

  aspects.sort((a, b) => a.orb - b.orb);
  return {
    name: chart.input.name,
    ascendant,
    ascendantSign: signIndex(ascendant),
    midheaven: normalize(chart.mc + chart.ayanamsa),
    signs: SIGNS,
    bodies,
    aspects,
  };
}

export type WesternReport = ReturnType<typeof buildWesternReport>;
