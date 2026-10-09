import type { ChartData } from "@/lib/astro/calc";

const SHRINES = [
  ["Rameswaram", "Ramanathaswamy", "Rameswaram", "Tamil Nadu"],
  ["Somnath", "Somnath", "Prabhas Patan", "Gujarat"],
  ["Nageswaram", "Nageshwar", "near Dwarka", "Gujarat"],
  ["Omkareshwar", "Omkareshwar", "Mandhata", "Madhya Pradesh"],
  ["Vaidyanath", "Baidyanath", "Deoghar", "Jharkhand"],
  ["Srisailam", "Mallikarjuna", "Srisailam", "Andhra Pradesh"],
  ["Ujjain", "Mahakaleshwar", "Ujjain", "Madhya Pradesh"],
  ["Grishneshwar", "Grishneshwar", "Ellora", "Maharashtra"],
  ["Varanasi", "Kashi Vishwanath", "Varanasi", "Uttar Pradesh"],
  ["Bhimashankar", "Bhimashankar", "Bhimashankar", "Maharashtra"],
  ["Kedarnath", "Kedarnath", "Kedarnath", "Uttarakhand"],
  ["Trimbakeshwar", "Trimbakeshwar", "near Nashik", "Maharashtra"],
] as const;

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const ROLES = {
  1: { role: "vitality", title: "Strengthen the life" },
  6: { role: "obstacles", title: "Remove obstacles" },
  9: { role: "fortune", title: "Open fortune" },
} as const;

export function buildJyotirlingaReport(chart: ChartData) {
  const moon = chart.planets.find((planet) => planet.id === "Moon")?.sign;
  if (moon === undefined) throw new Error("Moon position is missing from the birth chart.");

  const references = [
    { from: "Janma Rashi" as const, sign: moon },
    { from: "Lagna" as const, sign: chart.asc.sign },
  ];
  const visits = references.flatMap(({ from, sign: base }) =>
    ([1, 6, 9] as const).map((house) => {
      const sign = (base + house - 1) % 12;
      const [temple, formal, place, state] = SHRINES[sign];
      return {
        from,
        house,
        sign,
        signName: SIGNS[sign],
        temple,
        formal,
        place,
        state,
        role: ROLES[house].role,
        roleTitle: ROLES[house].title,
      };
    }),
  );

  return {
    name: chart.input.name,
    moon,
    lagna: chart.asc.sign,
    moonName: SIGNS[moon],
    lagnaName: SIGNS[chart.asc.sign],
    visits,
    uniqueCount: new Set(visits.map((visit) => visit.temple)).size,
  };
}

export type JyotirlingaReport = ReturnType<typeof buildJyotirlingaReport>;
