import assert from "node:assert/strict";
import { computeChart } from "../src/lib/astro/calc";
import { AV_FIXED_TOTALS, AV_PLANETS, computeAshtakavarga } from "../src/lib/astro/ashtakavarga";

const charts = [
  computeChart({ name: "A", gender: "male", date: "2001-08-31", time: "15:04", place: "Nellore", lat: 14.4499, lon: 79.987, tz: "Asia/Kolkata", style: "north" }),
  computeChart({ name: "B", gender: "female", date: "1985-05-20", time: "09:30", place: "Mumbai", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata", style: "south" }),
  computeChart({ name: "C", gender: "male", date: "1992-01-09", time: "12:00", place: "Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata", style: "north" }),
];
for (const c of charts) {
  const a = computeAshtakavarga(c);
  assert.deepEqual(a.checksum.planetTotals, [...AV_FIXED_TOTALS]);
  assert.equal(a.checksum.sarvaTotal, 337);
  assert.equal(a.sav.reduce((x, y) => x + y, 0), 337);
  assert.equal(a.bav.length, 7);
  assert.ok(a.bav.every((row) => row.length === 12 && row.every((n) => Number.isInteger(n) && n >= 0 && n <= 8)));
  assert.ok(a.trikona.every((row, p) => row.every((n, s) => n >= 0 && n <= a.bav[p][s])));
  assert.ok(a.ekadhipatya.every((row, p) => row.every((n, s) => n >= 0 && n <= a.trikona[p][s])));
  assert.equal(a.rasiPinda.length, 7);
  assert.equal(a.grahaPinda.length, 7);
  assert.deepEqual(a.sodhyaPinda, a.rasiPinda.map((r, i) => r + a.grahaPinda[i]));
  assert.equal(a.houseScores.length, 12);
  for (const h of a.houseScores) assert.equal(h.score, a.sav[h.sign]);
  console.log(`PASS ${c.input.name}: SAV 337; ${AV_PLANETS.map((p, i) => `${p} ${a.checksum.planetTotals[i]}`).join(", ")}`);
}
assert.notDeepEqual(computeAshtakavarga(charts[0]).sav, computeAshtakavarga(charts[1]).sav);
console.log("PASS different charts produce different sign and house Ashtakavarga distributions");
