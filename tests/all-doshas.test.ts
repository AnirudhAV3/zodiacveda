import assert from "node:assert/strict";
import { computeChart, currentTransits, siderealLon, type BirthInput } from "../src/lib/astro/calc";
import { detectDoshas } from "../src/lib/astro/yogas";
import { houseFrom, planet } from "../src/lib/astro/analysis";
import { buildDoshaReport } from "../src/lib/dosha/report";
import { BirthInputError, validateBirthDetails } from "../src/lib/calculators/birth";

const base: BirthInput = { name: "Dosha Test", gender: "male", date: "2001-08-31", time: "15:04", place: "Nellore", lat: 14.4499, lon: 79.987, tz: "Asia/Kolkata", style: "north" };
const now = Date.UTC(2026, 9, 3);
const transits = currentTransits();
const chart = computeChart(base);
const report = buildDoshaReport(chart, transits, now);

assert.equal(report.kind, "all-doshas");
assert.equal(report.checked, detectDoshas(chart, transits, now).length);
assert.equal(report.checked, report.doshas.length);
assert.equal(report.activeCount + report.cancelledCount + report.clearCount, report.checked);
assert.equal(report.activeCount, report.doshas.filter((d) => d.present).length);
assert.equal(report.clearCount, report.doshas.filter((d) => d.severity === "None").length);
console.log(`PASS totals reconcile: ${report.activeCount} active, ${report.cancelledCount} cancelled, ${report.clearCount} clear of ${report.checked}`);

// Verify detection against the chart itself rather than stored expectations.
const mars = planet(chart, "Mars");
const manglikHouses = [1, 2, 4, 7, 8, 12];
const fromLagna = manglikHouses.includes(mars.house);
const fromMoon = manglikHouses.includes(houseFrom(planet(chart, "Moon").sign, mars.sign));
const fromVenus = manglikHouses.includes(houseFrom(planet(chart, "Venus").sign, mars.sign));
const mangal = report.doshas.find((d) => d.name.startsWith("Mangal"))!;
assert.equal(mangal.severity === "None", !(fromLagna || fromMoon || fromVenus), "Mangal severity must follow the real Mars placement");
if (mangal.severity !== "None") assert.ok(mangal.planetNotes.some((p) => p.id === "Mars" && p.house === mars.house));

const rahuLon = planet(chart, "Rahu").lon;
const sameSide = (["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const).map((id) => ((planet(chart, id).lon - rahuLon + 360) % 360) < 180);
const kaalSarp = report.doshas.find((d) => d.name.startsWith("Kaal Sarp"))!;
assert.equal(kaalSarp.present, sameSide.every(Boolean) || sameSide.every((s) => !s), "Kaal Sarp must match the real Rahu-Ketu axis split");

const guruChandal = report.doshas.find((d) => d.name.startsWith("Guru Chandal"))!;
const jupiterSign = planet(chart, "Jupiter").sign;
assert.equal(guruChandal.present, jupiterSign === planet(chart, "Rahu").sign || jupiterSign === planet(chart, "Ketu").sign);

const angarak = report.doshas.find((d) => d.name.startsWith("Angarak"))!;
assert.equal(angarak.present, mars.sign === planet(chart, "Rahu").sign || mars.sign === planet(chart, "Ketu").sign);
console.log("PASS Mangal, Kaal Sarp, Guru Chandal and Angarak verified against the computed chart");

for (const d of report.doshas) {
  assert.ok(d.name && d.details && d.topic && d.key, "every dosha needs full explanation text");
  assert.equal(d.impact, { None: 0, Mild: 25, Moderate: 55, Strong: 85 }[d.severity]);
  assert.ok(d.remedies.length > 0, `${d.name} must carry guidance`);
  if (!d.present && d.severity === "None") assert.equal(d.impact, 0, "a dosha that is not present must not claim intensity");
  for (const p of d.planetNotes) {
    const actual = planet(chart, p.id);
    assert.equal(p.house, actual.house, `${d.name}: planet note must reflect the real chart`);
    assert.ok(p.strength >= 0 && p.strength <= 100);
  }
  if (d.cancellations.length) assert.ok(/cancel|reduc|Kendra/i.test(d.details), `${d.name}: cancellations must come from the engine's own wording`);
}
console.log("PASS every dosha carries verified planet data, honest intensity and remedies");

// Sade Sati timeline must agree with the shared engine and be chronologically sound.
const sade = report.sadeSati!;
const saturnSign = Math.floor(transits.Saturn / 30);
const houseFromMoon = houseFrom(planet(chart, "Moon").sign, saturnSign);
assert.equal(sade.active, [12, 1, 2].includes(houseFromMoon), "timeline 'running now' must match live Saturn position");
assert.ok(sade.phases.length > 0, "a Sade Sati timeline must be produced");
for (const p of sade.phases) {
  const start = Date.parse(p.start);
  const end = Date.parse(p.end);
  const years = (end - start) / (365.25 * 86400000);
  assert.ok(end > start, "phase must end after it starts");
  assert.ok(years > 1.5 && years < 4, `phase length ${years.toFixed(1)}y must be a realistic Saturn sign transit`);
  assert.equal(p.status, end < now ? "past" : start <= now ? "current" : "upcoming");
  // The stated sign must be the sign Saturn actually occupies during the phase.
  const mid = new Date((start + end) / 2);
  assert.equal(Math.floor(siderealLon("Saturn", mid) / 30), ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"].indexOf(p.sign), `${p.phase}: Saturn must really be in ${p.sign}`);
}
const sorted = [...sade.phases].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
assert.deepEqual(sade.phases.map((p) => p.start), sorted.map((p) => p.start), "phases must be in chronological order");
assert.equal(sade.phases.filter((p) => p.status === "current").length, sade.active ? 1 : 0);
console.log(`PASS Sade Sati timeline: ${sade.phases.length} phases, real Saturn signs, agrees with engine (active=${sade.active})`);

assert.equal(report.chartSummary.planets.length, chart.planets.length);
for (const p of report.chartSummary.planets) assert.equal(p.house, planet(chart, p.id).house);
assert.equal(report.calculatedAt, new Date(now).toISOString());
assert.ok(report.notes.some((n) => /not medical/i.test(n)) && report.notes.some((n) => /texts differ/i.test(n)));
assert.ok(report.priorityRemedies.length <= 3);
console.log("PASS chart summary matches the saved chart and limitations are disclosed");

const reject = (patch: Record<string, unknown>, pattern: RegExp) =>
  assert.throws(() => validateBirthDetails({ ...base, ...patch }, "Birth details", "north"), (e: unknown) => e instanceof BirthInputError && pattern.test(e.message));
reject({ date: "2001-04-31" }, /does not exist/);
reject({ time: "7:30" }, /HH:MM/);
reject({ lat: -90 }, /latitude/);
reject({ tz: "" }, /time zone/);
console.log("PASS invalid birth details rejected before any chart is saved");

const other = buildDoshaReport(computeChart({ ...base, name: "Other", date: "1990-03-14", time: "21:45", place: "Delhi", lat: 28.6139, lon: 77.209 }), transits, now);
assert.notDeepEqual(other.doshas.map((d) => `${d.key}:${d.severity}`), report.doshas.map((d) => `${d.key}:${d.severity}`));
console.log(`PASS different births give different results (${report.activeCount} vs ${other.activeCount} active)`);
console.log("All All-Doshas unit checks passed.");

// Exercise the "currently running" branch. Rather than guessing dates, search for a
// birth date whose natal Moon sign puts the live Saturn transit in the 12th, 1st or 2nd.
const saturnNow = Math.floor(currentTransits().Saturn / 30);
let activeChecked = false;
for (let dayOffset = 0; dayOffset < 32 && !activeChecked; dayOffset++) {
  const d = new Date(Date.UTC(1992, 0, 1 + dayOffset));
  const candidate = computeChart({ ...base, name: "Sade Sati Case", date: d.toISOString().slice(0, 10), time: "12:00" });
  if (![12, 1, 2].includes(houseFrom(planet(candidate, "Moon").sign, saturnNow))) continue;
  const rep = buildDoshaReport(candidate, transits, now);
  assert.equal(rep.sadeSati!.active, true, "Sade Sati must be reported as running for this Moon sign");
  const current = rep.sadeSati!.phases.find((p) => p.status === "current");
  assert.ok(current, "a current phase must be present when Sade Sati is running");
  assert.ok(Date.parse(current!.start) <= now && Date.parse(current!.end) > now, "the current phase must actually contain the calculation date");
  assert.match(rep.sadeSati!.summary, /running now/);
  assert.equal(rep.doshas.find((x) => x.name.startsWith("Shani Sade Sati"))!.present, true, "the shared engine must also flag Sade Sati");
  console.log(`PASS active Sade Sati case (born ${candidate.input.date}): ${current!.phase} in ${current!.sign} until ${current!.end.slice(0, 10)}`);
  activeChecked = true;
}
assert.ok(activeChecked, "no birth date in the scan produced an active Sade Sati — the running branch was not verified");
console.log("All All-Doshas unit checks (including active Sade Sati) passed.");
