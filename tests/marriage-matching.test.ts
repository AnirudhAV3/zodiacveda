import assert from "node:assert/strict";
import { computeChart, type BirthInput } from "../src/lib/astro/calc";
import { detectDoshas } from "../src/lib/astro/yogas";
import { buildMatchResult } from "../src/lib/matching/report";
import { GANA_MATRIX, maitriPoints, scoreKootas, taraDirection, vashyaIndex, VASHYA_MATRIX, YONI_MATRIX, type MoonSignature } from "../src/lib/matching/rules";
import { MatchInputError, validateMatchBirth } from "../src/lib/matching/validation";

const highFirst: MoonSignature = { sign: 1, degree: 26.7, nak: 4, pada: 2 }; // Mrigashira, Taurus
const highSecond: MoonSignature = { sign: 1, degree: 16, nak: 3, pada: 2 }; // Rohini, Taurus
const high = scoreKootas(highFirst, highSecond);
assert.deepEqual(high.map((k) => k.score), [1, 2, 3, 4, 5, 6, 7, 8]);
assert.equal(high.reduce((sum, k) => sum + k.score, 0), 36);
assert.equal(scoreKootas(highSecond, highFirst).find((k) => k.key === "gana")!.score, 5, "Gana must use the published directional rule");
console.log("PASS reference Moon-star pairing: 36 points; reversed Gana orientation is disclosed");

assert.equal(vashyaIndex(8, 14.9999), 1);
assert.equal(vashyaIndex(8, 15), 0);
assert.equal(vashyaIndex(9, 14.9999), 0);
assert.equal(vashyaIndex(9, 15), 2);
for (const m of [VASHYA_MATRIX, GANA_MATRIX]) for (const row of m) for (const n of row) assert.ok(Number.isFinite(n));
for (let i = 0; i < 14; i++) {
  assert.equal(YONI_MATRIX[i][i], 4);
  for (let j = 0; j < 14; j++) assert.equal(YONI_MATRIX[i][j], YONI_MATRIX[j][i]);
}
assert.equal(YONI_MATRIX[0][8], 0); // horse-buffalo
assert.equal(YONI_MATRIX[3][12], 0); // serpent-mongoose
assert.equal(YONI_MATRIX[5][6], 0); // cat-rat
assert.equal(YONI_MATRIX[0][10], 3); // published AAPS variant, explicitly documented
console.log("PASS exact 15-degree Vashya boundaries and symmetric 14-animal Yoni matrix");

assert.deepEqual(taraDirection(26, 0), { count: 2, remainder: 2, name: "Sampat", favourable: true, score: 1.5 });
assert.equal(taraDirection(0, 26).score, 1.5);
assert.equal(taraDirection(17, 10).score, 0); // count 21, remainder 3 (Vipat)
assert.equal(taraDirection(10, 17).score, 1.5); // count 8 (Mitra)
assert.equal(maitriPoints("Sun", "Moon"), 5);
assert.equal(maitriPoints("Sun", "Mercury"), 4);
assert.equal(maitriPoints("Mars", "Venus"), 3);
assert.equal(maitriPoints("Moon", "Mercury"), 1);
assert.equal(maitriPoints("Jupiter", "Venus"), 0.5);
assert.equal(maitriPoints("Sun", "Saturn"), 0);
console.log("PASS inclusive, bidirectional Tara and all six natural-friendship score classes");

// Exercise every one of the 108 pada-centre Moon positions against every other.
const moon = (i: number): MoonSignature => {
  const lon = (i + .5) * (360 / 108);
  return { sign: Math.floor(lon / 30), degree: lon % 30, nak: Math.floor(i / 4), pada: i % 4 + 1 };
};
let maximum = 0;
for (let a = 0; a < 108; a++) for (let b = 0; b < 108; b++) {
  const scores = scoreKootas(moon(a), moon(b));
  assert.equal(scores.length, 8);
  assert.equal(scores.reduce((sum, k) => sum + k.max, 0), 36);
  assert.ok(scores.every((k) => Number.isFinite(k.score) && k.score >= 0 && k.score <= k.max));
  const sum = scores.reduce((s, k) => s + k.score, 0);
  assert.ok(sum >= 0 && sum <= 36);
  maximum = Math.max(maximum, sum);
}
assert.equal(maximum, 36);
console.log("PASS 11,664 Moon-position pairings: finite scores, correct weights and bounds");

const input: BirthInput = { name: "Test Person One", gender: "male", date: "2001-08-31", time: "15:04", place: "Nellore", lat: 14.4499, lon: 79.987, tz: "Asia/Kolkata", style: "north" };
const secondInput: BirthInput = { name: "Test Person Two", gender: "female", date: "1998-11-23", time: "08:20", place: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata", style: "north" };
assert.equal(validateMatchBirth(input, "Person 1", "north").time, "15:04");
const bad = (extra: Partial<Record<keyof BirthInput, unknown>>, pattern: RegExp) => assert.throws(() => validateMatchBirth({ ...input, ...extra }, "Person 1", "north"), (e: unknown) => e instanceof MatchInputError && pattern.test(e.message));
bad({ date: "2001-02-29" }, /does not exist/);
bad({ date: "2001-02-31" }, /does not exist/);
bad({ time: "25:04" }, /HH:MM/);
bad({ time: "15:04:30" }, /HH:MM/);
bad({ lat: "" }, /latitude/);
bad({ lat: 90 }, /latitude/);
bad({ lon: -181 }, /longitude/);
bad({ tz: "Invalid/TimeZone" }, /invalid time zone/);
bad({ tz: "UTC+15:00" }, /UTC offset/);
bad({ tz: "UTC+05:99" }, /UTC offset/);
bad({ date: "2099-01-01" }, /future/);
bad({ date: "2024-03-10", time: "02:30", tz: "America/New_York" }, /does not exist/);
console.log("PASS date, 24-hour time, coordinates, zone, DST-gap and future-birth validation");

const now = Date.UTC(2026, 9, 2);
const first = computeChart(input);
const second = computeChart(secondInput);
const result = buildMatchResult(first, second, now);
assert.equal(result.total, result.kootas.reduce((sum, k) => sum + k.score, 0));
assert.equal(result.maximum, 36);
assert.equal(result.calculatedAt, new Date(now).toISOString());
assert.deepEqual(result.manglik.first, detectDoshas(first, undefined, now).find((d) => d.name.startsWith("Mangal")));
assert.deepEqual(result.manglik.second, detectDoshas(second, undefined, now).find((d) => d.name.startsWith("Mangal")));
assert.ok(result.marriage.first.paragraphs.length && result.marriage.second.paragraphs.length);
assert.ok(result.commonWindows.every((p) => p.start >= now && p.end > p.start && p.end <= now + 5 * 365.25 * 86400000));
const identical = buildMatchResult(first, { ...first, input: { ...first.input, name: "Same Position" } }, now);
assert.equal(identical.total, 28, "Identical Moon positions must not incorrectly gain eight Nadi points");
assert.equal(identical.kootas.find((k) => k.key === "nadi")!.score, 0);
assert.equal(identical.checks.find((k) => k.key === "nadi")!.status, "review");
assert.ok(JSON.stringify(result).length > 3000);
console.log(`PASS complete saved-report data; sample score ${result.total}/36, raw Nadi score preserved`);
console.log("All Marriage Matching unit checks passed.");
