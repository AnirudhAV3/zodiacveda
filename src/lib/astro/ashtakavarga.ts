import type { ChartData } from "./calc";
import { SIGNS, type PlanetId } from "./data";

export const AV_PLANETS: PlanetId[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
export const AV_FIXED_TOTALS = [48, 49, 39, 54, 56, 52, 39] as const;

/** BPHS Ch.66: [target planet][contributor Sun..Saturn,Lagna] = favourable houses from contributor. */
const RULES: number[][][] = [
  [[1,2,4,7,8,9,10,11],[3,6,10,11],[1,2,4,7,8,9,10,11],[3,5,6,9,10,11,12],[5,6,9,11],[6,7,12],[1,2,4,7,8,9,10,11],[3,4,6,10,11,12]],
  [[3,6,7,8,10,11],[1,3,6,7,9,10,11],[2,3,5,6,10,11],[1,3,4,5,7,8,10,11],[1,2,4,7,8,10,11],[3,4,5,7,9,10,11],[3,5,6,11],[3,6,10,11]],
  [[3,5,6,10,11],[3,6,11],[1,2,4,7,8,10,11],[3,5,6,11],[6,10,11,12],[6,8,11,12],[1,4,7,8,9,10,11],[1,3,6,10,11]],
  [[5,6,9,11,12],[2,4,6,8,10,11],[1,2,4,7,8,9,10,11],[1,3,5,6,9,10,11,12],[6,8,11,12],[1,2,3,4,5,8,9,11],[1,2,4,7,8,9,10,11],[1,2,4,6,8,10,11]],
  [[1,2,3,4,7,8,9,10,11],[2,5,7,9,11],[1,2,4,7,8,10,11],[1,2,4,5,6,9,10,11],[1,2,3,4,7,8,10,11],[2,5,6,9,10,11],[3,5,6,12],[1,2,4,5,6,7,9,10,11]],
  [[8,11,12],[1,2,3,4,5,8,9,11,12],[3,4,6,9,11,12],[3,5,6,9,11],[5,8,9,10,11],[1,2,3,4,5,8,9,10,11],[3,4,5,8,9,10,11],[1,2,3,4,5,8,9,11]],
  [[1,2,4,7,8,10,11],[3,6,11],[3,5,6,10,11,12],[6,8,9,10,11,12],[5,6,11,12],[6,11,12],[3,5,6,11],[1,3,4,6,10,11]],
];

const RASI_MULT = [7, 10, 8, 4, 10, 5, 7, 8, 9, 5, 11, 12];
const GRAHA_MULT = [5, 5, 8, 5, 10, 7, 5];
/** Co-owned signs: Mars, Mercury, Jupiter, Venus, Saturn. */
const DUAL: [number, number][] = [[0,7],[2,5],[8,11],[1,6],[9,10]];

export interface AshtakavargaResult {
  bav: number[][];
  sav: number[];
  trikona: number[][];
  ekadhipatya: number[][];
  rasiPinda: number[];
  grahaPinda: number[];
  sodhyaPinda: number[];
  sourceSigns: number[];
  checksum: { planetTotals: number[]; sarvaTotal: number; valid: boolean };
  houseScores: { house: number; sign: number; score: number; label: string }[];
}

const clone = (x: number[][]) => x.map((r) => [...r]);

function trikonaReduction(input: number[][]) {
  const out = clone(input);
  for (let p = 0; p < 7; p++) {
    for (let r = 0; r < 4; r++) {
      const idx = [r, r + 4, r + 8];
      const vals = idx.map((i) => out[p][i]);
      if (vals.includes(0)) continue;
      if (vals[0] === vals[1] && vals[1] === vals[2]) idx.forEach((i) => (out[p][i] = 0));
      else {
        const min = Math.min(...vals);
        idx.forEach((i) => (out[p][i] -= min));
      }
    }
  }
  return out;
}

function ekadhipatyaReduction(input: number[][], occupied: Set<number>) {
  const out = clone(input);
  for (let p = 0; p < 7; p++) {
    for (const [a, b] of DUAL) {
      const ao = occupied.has(a), bo = occupied.has(b);
      if (out[p][a] === 0 || out[p][b] === 0 || (ao && bo)) continue;
      if (!ao && !bo) {
        if (out[p][a] === out[p][b]) out[p][a] = out[p][b] = 0;
        else out[p][a] = out[p][b] = Math.min(out[p][a], out[p][b]);
      } else if (ao) {
        out[p][b] = out[p][b] <= out[p][a] ? 0 : out[p][a];
      } else {
        out[p][a] = out[p][a] <= out[p][b] ? 0 : out[p][b];
      }
    }
  }
  return out;
}

export function computeAshtakavarga(c: ChartData): AshtakavargaResult {
  const sourceSigns = AV_PLANETS.map((id) => c.planets.find((p) => p.id === id)!.sign).concat(c.asc.sign);
  const bav = Array.from({ length: 7 }, () => Array(12).fill(0));
  for (let target = 0; target < 7; target++) {
    for (let source = 0; source < 8; source++) {
      const base = sourceSigns[source];
      for (const h of RULES[target][source]) bav[target][(base + h - 1) % 12]++;
    }
  }
  const totals = bav.map((r) => r.reduce((a, b) => a + b, 0));
  const sav = Array.from({ length: 12 }, (_, s) => bav.reduce((n, row) => n + row[s], 0));
  const sarvaTotal = sav.reduce((a, b) => a + b, 0);
  const valid = totals.every((n, i) => n === AV_FIXED_TOTALS[i]) && sarvaTotal === 337;
  if (!valid) throw new Error(`Ashtakavarga checksum failed: ${totals.join(",")} / ${sarvaTotal}`);

  const trikona = trikonaReduction(bav);
  const occupied = new Set(sourceSigns.slice(0, 7));
  const ekadhipatya = ekadhipatyaReduction(trikona, occupied);
  const rasiPinda = ekadhipatya.map((row) => row.reduce((sum, v, i) => sum + v * RASI_MULT[i], 0));
  const grahaPinda = ekadhipatya.map((row) => sourceSigns.slice(0, 7).reduce((sum, sign, p) => sum + GRAHA_MULT[p] * row[sign], 0));
  const sodhyaPinda = rasiPinda.map((r, i) => r + grahaPinda[i]);
  const houseScores = Array.from({ length: 12 }, (_, i) => {
    const sign = (c.asc.sign + i) % 12;
    const score = sav[sign];
    return { house: i + 1, sign, score, label: score >= 30 ? "Strong" : score >= 28 ? "Above average" : score >= 25 ? "Average" : "Needs support" };
  });
  return { bav, sav, trikona, ekadhipatya, rasiPinda, grahaPinda, sodhyaPinda, sourceSigns, checksum: { planetTotals: totals, sarvaTotal, valid }, houseScores };
}

export const ashtakavargaSignNames = SIGNS.map((s) => s.sa);
