import assert from "node:assert/strict";
import { computeChart, type BirthInput } from "../src/lib/astro/calc";
import { detectYogas } from "../src/lib/astro/yogas";
import { planet, dignity, houseLord } from "../src/lib/astro/analysis";
import { buildYogaReport } from "../src/lib/yoga/report";
import { BirthInputError, validateBirthDetails, assertUsableChart } from "../src/lib/calculators/birth";

const base: BirthInput = { name: "Yoga Test", gender: "male", date: "2001-08-31", time: "15:04", place: "Nellore", lat: 14.4499, lon: 79.987, tz: "Asia/Kolkata", style: "north" };
const now = Date.UTC(2026, 9, 3);
const chart = computeChart(base);
const report = buildYogaReport(chart, now);

assert.equal(report.kind, "all-yogas");
assert.equal(report.analysed, detectYogas(chart, now).length);
assert.ok(report.analysed >= 120, "every classical definition must be evaluated");
assert.equal(report.presentCount, report.yogas.filter((y) => y.present).length);
assert.equal(report.presentCount, report.auspiciousCount + report.challengingCount + report.mixedCount);
assert.equal(report.categories.reduce((s, c) => s + c.total, 0), report.analysed);
assert.equal(report.categories.reduce((s, c) => s + c.present, 0), report.presentCount);
console.log(`PASS totals reconcile: ${report.presentCount} present of ${report.analysed} checked`);

// Verify detection against the chart itself, not against stored expectations.
const mahapurusha = [["Ruchaka Yoga", "Mars"], ["Bhadra Yoga", "Mercury"], ["Hamsa Yoga", "Jupiter"], ["Malavya Yoga", "Venus"], ["Sasa Yoga", "Saturn"]] as const;
for (const [name, id] of mahapurusha) {
  const p = planet(chart, id);
  const expected = ["Exalted", "Own Sign", "Moolatrikona"].includes(dignity(id, p.sign, p.deg)) && [1, 4, 7, 10].includes(p.house);
  assert.equal(report.yogas.find((y) => y.name === name)!.present, expected, `${name} must match the chart's own placement`);
}
const budhaAditya = planet(chart, "Sun").sign === planet(chart, "Mercury").sign;
assert.equal(report.yogas.find((y) => y.name === "Budha-Aditya Yoga")!.present, budhaAditya);
const gajaKesari = [1, 4, 7, 10].includes(((planet(chart, "Jupiter").sign - planet(chart, "Moon").sign + 12) % 12) + 1);
assert.equal(report.yogas.find((y) => y.name === "Gaja Kesari Yoga")!.present, gajaKesari);
assert.equal(report.yogas.find((y) => y.name === "Lagna Lord in Dusthana")!.present, [6, 8, 12].includes(planet(chart, houseLord(chart, 1)).house));
console.log("PASS yoga detection verified directly against the computed chart");

for (const y of report.yogas) {
  assert.ok(y.name && y.formation && y.effect && y.category, "every yoga needs full explanation text");
  if (y.present) {
    assert.ok(y.strength === null || (Number.isInteger(y.strength) && y.strength >= 0 && y.strength <= 100));
    assert.equal(y.planetNotes.length, y.planets.length);
    for (const p of y.planetNotes) {
      const actual = planet(chart, p.id);
      assert.equal(p.house, actual.house, "planet note must reflect the real chart position");
      assert.equal(p.dignity, dignity(p.id, actual.sign, actual.deg, chart));
      assert.ok(p.score >= 0 && p.score <= 100);
    }
    assert.ok(y.remedies.length > 0, `${y.name} must include guidance`);
  } else {
    assert.equal(y.strength, null, "absent yogas must not claim a strength");
    assert.deepEqual(y.planets, []);
    assert.deepEqual(y.remedies, []);
  }
}
console.log("PASS present yogas carry verified planet data; absent yogas claim nothing");

const strengths = report.yogas.filter((y) => y.present && y.nature !== "bad" && y.strength !== null).map((y) => y.strength as number).sort((a, b) => b - a);
assert.deepEqual(report.strongest.map((s) => Number(s.match(/— (\d+)\/100/)![1])), strengths.slice(0, 5));
console.log("PASS strongest list is genuinely ranked by calculated strength");

assert.equal(report.chartSummary.planets.length, chart.planets.length);
for (const p of report.chartSummary.planets) {
  const actual = planet(chart, p.id);
  assert.equal(p.house, actual.house);
  assert.equal(p.retro, actual.retro && !["Rahu", "Ketu"].includes(p.id));
}
assert.equal(report.chartSummary.lagnaLord, houseLord(chart, 1));
assert.equal(report.calculatedAt, new Date(now).toISOString());
assert.ok(report.notes.some((n) => /not medical/i.test(n)) && report.notes.some((n) => /texts differ/i.test(n)));
console.log("PASS chart summary matches the saved chart and limits are disclosed");

const reject = (patch: Record<string, unknown>, pattern: RegExp) =>
  assert.throws(() => validateBirthDetails({ ...base, ...patch }, "Birth details", "north"), (e: unknown) => e instanceof BirthInputError && pattern.test(e.message));
reject({ name: "" }, /name/);
reject({ date: "2001-02-30" }, /does not exist/);
reject({ time: "24:00" }, /HH:MM/);
reject({ lat: 95 }, /latitude/);
reject({ lon: "79" }, /longitude/);
reject({ tz: "Not/AZone" }, /invalid time zone/);
reject({ date: "2099-01-01" }, /future/);
assert.throws(() => assertUsableChart({ ...chart, asc: { ...chart.asc, lon: Number.NaN } }, "Birth details"), BirthInputError);
console.log("PASS invalid birth details and unusable charts are rejected, not saved");

const other = buildYogaReport(computeChart({ ...base, name: "Second Person", date: "1998-11-23", time: "08:20", place: "Bengaluru", lat: 12.9716, lon: 77.5946 }), now);
assert.notDeepEqual(other.yogas.filter((y) => y.present).map((y) => y.name), report.yogas.filter((y) => y.present).map((y) => y.name));
console.log(`PASS different births give different yogas (${report.presentCount} vs ${other.presentCount} present)`);
console.log("All All-Yogas unit checks passed.");
