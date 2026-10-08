import assert from "node:assert/strict";
import { computeChart, type BirthInput } from "../src/lib/astro/calc";
import { computeWesternChart, houseOf, signOf } from "../src/lib/western/calc";
import { buildWesternReport } from "../src/lib/western/report";
import { SIGN_NAMES } from "../src/lib/western/data";

const base: BirthInput = { name: "Western Test", gender: "male", date: "2001-08-31", time: "15:04", place: "Nellore", lat: 14.4499, lon: 79.987, tz: "Asia/Kolkata", style: "north" };
const now = Date.UTC(2026, 9, 8);
const chart = computeWesternChart(base);
const report = buildWesternReport(base, now);
const vedic = computeChart(base);

assert.equal(report.kind, "western-astrology");
assert.equal(chart.planets.length, 12);
assert.equal(chart.cusps.length, 12);
assert.ok(["Placidus", "Porphyry"].includes(chart.houseSystem));
assert.equal(signOf(chart.cusps[0]), chart.asc.sign);
assert.equal(signOf(chart.cusps[9]), chart.mc.sign);

const sun = chart.planets.find((p) => p.id === "Sun")!;
assert.equal(SIGN_NAMES[sun.sign], "Virgo", "31 Aug 2001 tropical Sun must be Virgo");
assert.ok(sun.deg > 6 && sun.deg < 10, `Sun degree ${sun.deg}`);
assert.notEqual(sun.sign, vedic.planets.find((p) => p.id === "Sun")!.sign, "tropical Sun sign should differ from Lahiri sidereal for this chart");

const moon = chart.planets.find((p) => p.id === "Moon")!;
assert.ok(Number.isFinite(moon.lon) && moon.house >= 1 && moon.house <= 12);
assert.equal(houseOf(chart.asc.lon, chart.cusps), 1);
assert.equal(houseOf(chart.mc.lon, chart.cusps), 10);

for (const p of chart.planets) {
  assert.ok(Number.isFinite(p.lon) && Number.isFinite(p.deg));
  assert.ok(p.house >= 1 && p.house <= 12, `${p.id} house ${p.house}`);
  assert.ok(["Domicile", "Exaltation", "Detriment", "Fall", "Peregrine"].includes(p.dignity));
}

assert.equal(report.bigThree.length, 3);
assert.equal(report.houses.length, 12);
assert.equal(report.planets.length, 12);
assert.ok(report.aspects.length > 5, "a natal chart should contain several aspects");
for (const a of report.aspects) {
  assert.ok(a.orb >= 0 && a.orb <= 12);
  assert.ok(a.meaning.length > 20);
}
assert.ok(report.lifeAreas.length >= 8);
assert.ok(report.patterns.length >= 1);
assert.ok(report.progressions.sun.includes("°"));
assert.ok(report.identity.rising.includes("°"));
assert.match(report.identity.lunarPhase, /Waxing|Waning|Moon|Quarter|Gibbous|Crescent/);
assert.equal(report.balances.elements.Fire + report.balances.elements.Earth + report.balances.elements.Air + report.balances.elements.Water, 11);

const node = chart.planets.find((p) => p.id === "North Node")!;
const south = chart.planets.find((p) => p.id === "South Node")!;
assert.ok(Math.abs(((node.lon + 180) % 360) - south.lon) < 0.2 || Math.abs(node.lon + 180 - 360 - south.lon) < 0.2);

assert.ok(report.method.some((m) => /tropical/i.test(m)));
console.log(`PASS Western natal: Sun ${SIGN_NAMES[sun.sign]} ${sun.deg.toFixed(2)}°, ${chart.houseSystem}, ${report.aspects.length} aspects, ${report.transits.length} transits`);
