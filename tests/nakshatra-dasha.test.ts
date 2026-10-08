import assert from "node:assert/strict";
import { computeChart, nakOf, padaOf, subPeriods, YEAR_MS, type BirthInput, type DashaPeriod } from "../src/lib/astro/calc";
import { NAKSHATRAS, PLANET_INFO } from "../src/lib/astro/data";
import { avakhada, planet } from "../src/lib/astro/analysis";
import { buildNakshatraReport } from "../src/lib/nakshatra/report";
import { buildDashaReport } from "../src/lib/dasha/report";
import { dashaPrediction } from "../src/lib/astro/predictions";
import { BirthInputError, validateBirthDetails } from "../src/lib/calculators/birth";

const base: BirthInput = { name: "Nak Dasha Test", gender: "male", date: "2001-08-31", time: "15:04", place: "Nellore", lat: 14.4499, lon: 79.987, tz: "Asia/Kolkata", style: "north" };
const now = Date.UTC(2026, 9, 5);
const chart = computeChart(base);

/* ============ NAKSHATRA ============ */
const nak = buildNakshatraReport(chart, now);
const moon = planet(chart, "Moon");
const a = avakhada(chart);
assert.equal(nak.kind, "nakshatra-rashi");
assert.equal(nak.moon.nak, nakOf(moon.lon));
assert.equal(nak.moon.pada, padaOf(moon.lon));
assert.equal(nak.moon.nakshatra, NAKSHATRAS[moon.nak].name);
assert.equal(nak.moon.nakshatra, "Shravana");
assert.equal(nak.moon.pada, 3);
assert.equal(nak.nakshatra.birthSyllable, a.syllable);
assert.equal(nak.nakshatra.birthSyllable, "Khe");
assert.equal(nak.moon.padaNavamsa, "Gemini");
assert.equal(nak.moon.startDegree, "Capricorn 10°00'00\"");
assert.equal(nak.moon.endDegree, "Capricorn 23°20'00\"");
assert.ok(Math.abs(nak.moon.traversedPercent - 51.7) < .1);
console.log("PASS exact Moon longitude gives Shravana pada 3, Khe, Gemini navamsa and 51.7% progress");

assert.equal(nak.nakshatra.fourPadas.length, 4);
assert.equal(nak.nakshatra.fourPadas.filter((p) => p.active).length, 1);
assert.equal(nak.nakshatra.fourPadas[2].active, true);
assert.deepEqual(nak.nakshatra.fourPadas.map((p) => p.syllable), [...NAKSHATRAS[moon.nak].syllables]);
assert.deepEqual(nak.nakshatra.fourPadas.map((p) => p.navamsa), ["Aries", "Taurus", "Gemini", "Cancer"]);
assert.equal(nak.rashi.english, "Capricorn");
assert.equal(nak.rashi.lord, "Saturn");
assert.equal(nak.moonCondition.house, moon.house);
assert.equal(nak.moonCondition.nakLordHouse, planet(chart, "Moon").house, "Shravana's lord is Moon in this chart");
console.log("PASS all four padas, Rashi and Moon/nakshatra-lord condition match the chart");

assert.equal(nak.panchang.tithi, "13 (Trayodashi)");
assert.equal(nak.panchang.nak, "Shravana");
assert.equal(nak.panchang.yoga, "Shobhana");
assert.equal(nak.panchang.karana, "Kaulava");
assert.equal(nak.avakhada.nakCharan, "Shravana - 3");
assert.equal(nak.tara.length, 9);
assert.equal(nak.tara[0].tara, "Janma");
assert.ok(nak.tara[0].naks.includes("Shravana"));
assert.equal(nak.remedies.find((r) => r.kind === "Gemstone")!.text.includes("Do not wear"), true, "nakshatra lord must not automatically prescribe a stone");
assert.ok(nak.interpretations.length >= 5 && nak.notes.some((n) => /not caste|not fixed|not medical/i.test(n)));
console.log("PASS sunrise Panchang, Avakhada, Tara Chakra, safe gemstone warning and limitations");

// Exact boundary behaviour independent of any birth fixture.
const span = 360 / 27;
const pada = 360 / 108;
for (let i = 0; i < 27; i++) {
  const start = i * span;
  assert.equal(nakOf(start + 1e-8), i);
  for (let p = 0; p < 4; p++) assert.equal(padaOf(start + p * pada + 1e-8), p + 1);
  if (i < 26) assert.equal(nakOf((i + 1) * span - 1e-8), i);
}
console.log("PASS all 27 nakshatra and 108 pada boundary intervals");

/* ============ DASHA ============ */
const dasha = buildDashaReport(chart, now);
assert.equal(dasha.kind, "vimshottari-dasha");
assert.equal(dasha.balanceAtBirth.lord, chart.dashaBalance.lord);
assert.ok(Math.abs(dasha.balanceAtBirth.years - chart.dashaBalance.years) < 1e-12);
assert.equal(dasha.balanceAtBirth.text, "Moon — 4 years 9 months 29 days");
assert.ok(dasha.mahadashas.length >= 9 && dasha.mahadashas.length <= 10);
assert.equal(dasha.mahadashas[0].start, Date.parse(chart.utc));
for (let i = 1; i < dasha.mahadashas.length; i++) assert.ok(Math.abs(dasha.mahadashas[i].start - dasha.mahadashas[i - 1].end) < 1, "Mahadashas must be contiguous");
assert.equal(dasha.mahadashas.filter((p) => p.status === "current").length, 1);
console.log(`PASS birth balance and ${dasha.mahadashas.length} contiguous Mahadasha rows`);

const currentMd = chart.dashas.find((p) => p.start <= now && p.end > now)!;
const currentAd = subPeriods(currentMd).find((p) => p.start <= now && p.end > now)!;
const currentPd = subPeriods(currentAd).find((p) => p.start <= now && p.end > now)!;
assert.deepEqual(dasha.current!.chain, [currentMd.lord, currentAd.lord, currentPd.lord]);
assert.deepEqual(dasha.current!.periods, [currentMd, currentAd, currentPd]);
assert.equal(dasha.current!.predictions.length, 3);
for (let i = 0; i < 3; i++) {
  const expected = dashaPrediction(chart, dasha.current!.chain.slice(0, i + 1), dasha.current!.periods[i], now);
  assert.equal(dasha.current!.predictions[i].title, expected.title);
  assert.equal(dasha.current!.predictions[i].rating, expected.rating);
  assert.ok(dasha.current!.predictions[i].remedies.length > 0);
}
console.log(`PASS current chain ${dasha.current!.chain.join(" → ")} and all three detailed predictions`);

function checkSubperiods(parent: DashaPeriod) {
  const children = subPeriods(parent);
  assert.equal(children.length, 9);
  assert.ok(Math.abs(children[0].start - parent.start) < 1);
  assert.ok(Math.abs(children[8].end - parent.end) < 10);
  for (let i = 1; i < children.length; i++) assert.ok(Math.abs(children[i].start - children[i - 1].end) < 1, "subperiods must be contiguous");
  assert.ok(children.every((p) => p.start < p.end && p.start >= parent.start - 1 && p.end <= parent.end + 10));
}
for (const md of chart.dashas.slice(0, 10)) {
  checkSubperiods(md);
  for (const ad of subPeriods(md)) checkSubperiods(ad);
}
console.log("PASS 90 Antardasha / Pratyantar groups: nine children, contiguous, exactly within each parent");

assert.deepEqual([...dasha.nextTransitions].sort((a, b) => a.date - b.date), dasha.nextTransitions);
assert.equal(dasha.nextTransitions.length, 3);
const end5 = now + 5 * YEAR_MS;
assert.ok(dasha.nextFiveYears.length > 0);
for (const p of dasha.nextFiveYears) {
  assert.ok(p.start >= now && p.end <= end5 && p.end > p.start);
  assert.equal(p.chain.length, 3);
  assert.ok(p.rating >= 1 && p.rating <= 5);
  assert.ok(p.summary && p.benefits.length && p.challenges.length);
}
for (let i = 1; i < dasha.nextFiveYears.length; i++) assert.ok(Math.abs(dasha.nextFiveYears[i].start - dasha.nextFiveYears[i - 1].end) < 1, "five-year Pratyantar periods must have no gaps or overlaps");
assert.equal(dasha.nextFiveYears[0].start, now);
assert.ok(Math.abs(dasha.nextFiveYears.at(-1)!.end - end5) < 1);
assert.ok(dasha.notes.some((n) => /365.25/i.test(n)) && dasha.notes.some((n) => /not guaranteed/i.test(n)));
console.log(`PASS next ${dasha.nextFiveYears.length} Pratyantars exactly cover five years with predictions and caveats`);

const reject = (patch: Record<string, unknown>, pattern: RegExp) => assert.throws(() => validateBirthDetails({ ...base, ...patch }, "Birth details", "north"), (e: unknown) => e instanceof BirthInputError && pattern.test(e.message));
reject({ date: "2001-02-29" }, /does not exist/);
reject({ time: "15:04:30" }, /HH:MM/);
reject({ lat: "14" }, /latitude/);
reject({ tz: "Bad/Zone" }, /invalid time zone/);
console.log("PASS invalid birth details rejected for both calculators");

const other = computeChart({ ...base, name: "Other", date: "1994-12-03", time: "07:25", place: "Mumbai", lat: 19.076, lon: 72.8777 });
const n2 = buildNakshatraReport(other, now);
const d2 = buildDashaReport(other, now);
assert.notEqual(`${n2.moon.nak}-${n2.moon.pada}`, `${nak.moon.nak}-${nak.moon.pada}`);
assert.notDeepEqual(d2.current?.chain, dasha.current?.chain);
console.log(`PASS different births differ (${nak.moon.nakshatra}-${nak.moon.pada} vs ${n2.moon.nakshatra}-${n2.moon.pada}; ${dasha.current?.chain.join("/")} vs ${d2.current?.chain.join("/")})`);
console.log("All Nakshatra + Dasha unit checks passed.");
