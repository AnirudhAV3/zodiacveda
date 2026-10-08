import assert from "node:assert/strict";
import { computeChart, type BirthInput } from "../src/lib/astro/calc";
import { SIGNS, PLANET_INFO, type PlanetId } from "../src/lib/astro/data";
import { functionalNature, houseLord, housesOwned, planet } from "../src/lib/astro/analysis";
import { vargaSign, VARGAS } from "../src/lib/astro/extended";
import { buildGemReport } from "../src/lib/gemstone/report";
import { buildVargaReport } from "../src/lib/varga/report";
import { BirthInputError, validateBirthDetails } from "../src/lib/calculators/birth";

const base: BirthInput = { name: "Gem Varga Test", gender: "male", date: "2001-08-31", time: "15:04", place: "Nellore", lat: 14.4499, lon: 79.987, tz: "Asia/Kolkata", style: "north" };
const now = Date.UTC(2026, 9, 4);
const chart = computeChart(base);

/* ============ GEMSTONE ============ */
const gem = buildGemReport(chart, now);
assert.equal(gem.kind, "gemstone");
assert.equal(gem.all.length, 9, "all nine planetary stones must be covered");
assert.equal(gem.primary.length + gem.supportive.length + gem.neutral.length + gem.avoid.length, 9);
assert.equal(gem.lagnaLord, houseLord(chart, 1));
console.log(`PASS gemstone totals: ${gem.primary.length} recommended, ${gem.supportive.length} supportive, ${gem.neutral.length} neutral, ${gem.avoid.length} avoid`);

// The three classical roles must map to the real house lords of this chart.
const lagnaLord = houseLord(chart, 1), ninth = houseLord(chart, 9), fifth = houseLord(chart, 5);
for (const [id, label] of [[lagnaLord, "Lagna"], [ninth, "9th"], [fifth, "5th"]] as const) {
  const entry = gem.all.find((g) => g.planet === id)!;
  if (id === "Rahu" || id === "Ketu") continue; // shadow planets never carry a role
  assert.equal(entry.verdict, "primary", `${label} lord ${id} must be a primary recommendation`);
  assert.ok(entry.role, `${label} lord ${id} must state its traditional role`);
}
console.log(`PASS roles map to real house lords (Lagna ${lagnaLord}, 9th ${ninth}, 5th ${fifth})`);

// Safety: no functional malefic may ever be recommended, and shadow planets are never recommended.
for (const g of gem.all) {
  const fn = functionalNature(chart, g.planet);
  const isShadow = g.planet === "Rahu" || g.planet === "Ketu";
  if (isShadow) {
    assert.equal(g.verdict, "avoid", "shadow planet stones must not be recommended by default");
    assert.equal(g.substitutes.length > 0, true);
  }
  if (!fn.good && !isShadow) assert.equal(g.verdict, "avoid", `${g.planet} is a functional malefic and must be in the avoid list`);
  if (g.verdict === "primary" || g.verdict === "supportive") {
    assert.ok(fn.good, `${g.planet} may only be recommended if functionally benefic`);
    assert.ok(g.carat && g.metal && g.finger && g.day && g.mantra, `${g.planet} recommendation must carry full wearing details`);
  }
  assert.ok(g.reasons.length > 0, `${g.planet} must explain its verdict`);
  assert.equal(g.ownsHouses.join(","), housesOwned(chart, g.planet).join(","), "house lordship must match the real chart");
  assert.equal(g.stone, PLANET_INFO[g.planet].gem);
}
console.log("PASS no functional malefic or shadow-planet stone is ever recommended");

assert.ok(gem.notes.some((n) => /not medical/i.test(n)) && gem.notes.some((n) => /disagree/i.test(n)));
assert.ok(gem.testingAdvice.some((t) => /substitute/i.test(t)), "cheaper substitute advice must be present");
assert.ok(gem.wearingSteps.length >= 5);
console.log("PASS gemstone caveats, substitute guidance and wearing steps present");

/* ============ DIVISIONAL CHARTS ============ */
const varga = buildVargaReport(chart, now);
assert.equal(varga.kind, "divisional-charts");
assert.equal(varga.charts.length, 16, "all 16 Shodashvarga charts must be generated");
assert.deepEqual(varga.charts.map((v) => v.division), VARGAS.map(([d]) => d));

for (const v of varga.charts) {
  assert.equal(v.ascSign, vargaSign(chart.asc.lon, v.division), `${v.code} ascendant must come from the real chart`);
  assert.equal(v.placements.length, chart.planets.length);
  assert.ok(v.purpose && v.detail, `${v.code} must explain what it is read for`);
  for (const p of v.placements) {
    const expected = vargaSign(planet(chart, p.id).lon, v.division);
    assert.equal(p.sign, expected, `${v.code}: ${p.id} sign must match the varga formula`);
    assert.equal(p.house, ((expected - v.ascSign + 12) % 12) + 1, `${v.code}: ${p.id} house must be relative to the varga ascendant`);
    assert.ok(p.sign >= 0 && p.sign <= 11);
    // Vargottama is only meaningful outside D1 and must equal the real birth sign.
    assert.equal(p.vargottama, v.division !== 1 && expected === planet(chart, p.id).sign, `${v.code}: ${p.id} vargottama flag must be accurate`);
  }
}
console.log("PASS all 16 charts: ascendants, signs, houses and vargottama verified against the varga formulas");

// D1 must reproduce the birth chart exactly.
const d1 = varga.charts.find((v) => v.division === 1)!;
assert.equal(d1.ascSign, chart.asc.sign, "D1 ascendant must equal the birth ascendant");
for (const p of d1.placements) {
  assert.equal(p.sign, planet(chart, p.id).sign, `D1: ${p.id} must sit in its birth sign`);
  assert.equal(p.house, planet(chart, p.id).house, `D1: ${p.id} must sit in its birth house`);
  assert.equal(p.vargottama, false, "D1 cannot be vargottama with itself");
}
// D9 must match the engine's own navamsa field.
const d9 = varga.charts.find((v) => v.division === 9)!;
for (const p of d9.placements) assert.equal(p.sign, planet(chart, p.id).d9, `D9: ${p.id} must match the chart engine's navamsa`);
assert.equal(varga.charts.find((v) => v.division === 10)!.placements.find((p) => p.id === "Sun")!.sign, planet(chart, "Sun").d10, "D10 must match the engine's dasamsa");
console.log("PASS D1 reproduces the birth chart; D9 and D10 match the main horoscope engine");

// Vargottama summary must agree with the per-chart flags.
for (const v of varga.vargottama) {
  const actual = varga.charts.filter((ch) => ch.division !== 1 && ch.placements.find((p) => p.id === v.id)!.vargottama).map((ch) => ch.code);
  assert.deepEqual(v.charts, actual, `${v.id} vargottama list must match the charts`);
}
assert.equal(varga.vimsopaka.length, chart.planets.length);
for (const row of varga.vimsopaka) {
  for (const s of [row.shadVarga, row.saptVarga, row.dasaVarga, row.shodashVarga]) {
    assert.ok(s.score >= 0 && s.score <= 20, `${row.id}: Vimsopaka must stay within 0–20`);
    assert.ok(s.count >= 0);
  }
}
const ranked = [...varga.vimsopaka].sort((a, b) => b.shodashVarga.score - a.shodashVarga.score);
assert.equal(varga.strongestPlanet!.id, ranked[0].id);
assert.equal(varga.weakestPlanet!.id, ranked[ranked.length - 1].id);
console.log(`PASS Vimsopaka within range and ranking correct (strongest ${varga.strongestPlanet!.id}, weakest ${varga.weakestPlanet!.id})`);

assert.ok(varga.notes.some((n) => /birth-time/i.test(n)), "birth-time sensitivity of fine divisions must be disclosed");
assert.ok(varga.notes.some((n) => /different schools|differ/i.test(n)), "formula differences must be disclosed");

/* ============ SHARED VALIDATION ============ */
const reject = (patch: Record<string, unknown>, pattern: RegExp) =>
  assert.throws(() => validateBirthDetails({ ...base, ...patch }, "Birth details", "north"), (e: unknown) => e instanceof BirthInputError && pattern.test(e.message));
reject({ date: "2001-11-31" }, /does not exist/);
reject({ time: "24:15" }, /HH:MM/);
reject({ lat: 91 }, /latitude/);
reject({ tz: "Bad/Zone" }, /invalid time zone/);
console.log("PASS invalid birth details rejected for both calculators");

/* ============ DIFFERENT CHARTS DIFFER ============ */
const other = computeChart({ ...base, name: "Other", date: "1985-05-20", time: "09:30", place: "Mumbai", lat: 19.076, lon: 72.8777 });
const gem2 = buildGemReport(other, now);
const varga2 = buildVargaReport(other, now);
assert.notEqual(gem2.lagnaLord === gem.lagnaLord && gem2.primary.length === gem.primary.length && gem2.avoid.map((g) => g.planet).join() === gem.avoid.map((g) => g.planet).join(), true, "different charts must give different gem advice");
assert.notDeepEqual(varga2.charts.map((v) => v.ascSign), varga.charts.map((v) => v.ascSign), "different charts must give different divisional ascendants");
console.log(`PASS different births differ (gem lagna lords ${gem.lagnaLord} vs ${gem2.lagnaLord}; ${SIGNS[varga.charts[5].ascSign].en} vs ${SIGNS[varga2.charts[5].ascSign].en} D9 ascendant)`);
console.log("All Gemstone + Divisional Chart unit checks passed.");
