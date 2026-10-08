/* Run: PLAYWRIGHT_CORE_PATH=/path/to/playwright-core node tests/marriage-matching.e2e.cjs */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || "playwright-core");
const base = process.env.BASE_URL || "http://localhost:3000";

function browserPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const root = path.join(os.homedir(), ".cache", "ms-playwright");
  const version = fs.readdirSync(root).find((p) => p.startsWith("chromium_headless_shell"));
  if (!version) throw new Error("Install Playwright Chromium headless shell first");
  for (const dir of ["chrome-linux", "chrome-linux64"]) {
    const candidate = path.join(root, version, dir, "headless_shell");
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error("Chromium executable not found");
}

async function fillPerson(page, number, data) {
  const group = page.getByRole("group", { name: `Person ${number}`, exact: true });
  await group.getByLabel("Full name", { exact: true }).fill(data.name);
  await group.getByLabel("Date of birth", { exact: true }).fill(data.date);
  await group.getByLabel("Time of birth", { exact: true }).fill(data.time);
  await group.getByRole("button", { name: "Enter coordinates / time zone manually", exact: true }).click();
  await group.getByLabel("Place of birth", { exact: true }).fill(data.place);
  await group.getByLabel("Latitude", { exact: true }).fill(String(data.lat));
  await group.getByLabel("Longitude", { exact: true }).fill(String(data.lon));
  await group.getByLabel("Time zone", { exact: true }).fill(data.tz);
}

async function main() {
  const browser = await chromium.launch({ executablePath: browserPath(), args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  let apiResponse;
  try {
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(await page.getByText("Swiss-grade ephemeris", { exact: false }).count(), 0);
    const launch = page.getByRole("link").filter({ has: page.getByRole("heading", { name: "Marriage Horoscope Matching", exact: true }) });
    await launch.click();
    await page.waitForURL("**/calculators/marriage-matching");
    await page.getByRole("heading", { name: "Marriage Horoscope Matching", exact: true }).waitFor();
    console.log("PASS homepage card opens the dedicated matching form");

    const first = { name: "Browser Match One", date: "2001-08-31", time: "15:04", place: "Nellore", lat: 14.4499, lon: 79.987, tz: "Asia/Kolkata" };
    const second = { name: "Browser Match Two", date: "1998-11-23", time: "08:20", place: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" };
    await fillPerson(page, 1, first);
    await fillPerson(page, 2, second);
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.getByRole("group", { name: "Person 1", exact: true }).getByLabel("Full name", { exact: true }).inputValue(), first.name);
    assert.equal(await page.getByRole("group", { name: "Person 2", exact: true }).getByLabel("Time of birth", { exact: true }).inputValue(), second.time);
    console.log("PASS unfinished birth-detail draft survives reload");

    const response = page.waitForResponse((r) => r.url().endsWith("/api/matches") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Calculate compatibility →", exact: true }).click();
    apiResponse = await response;
    assert.equal(apiResponse.status(), 201, await apiResponse.text());
    const saved = await apiResponse.json();
    await page.waitForURL(`**/calculators/marriage-matching/${saved.slug}`);
    await page.getByRole("heading", { name: `${first.name} & ${second.name}`, exact: true }).waitFor();
    await page.getByText("23.5/36 points", { exact: true }).waitFor();
    console.log("PASS two real charts saved and matching report rendered (23.5/36)");

    await page.getByRole("button", { name: "📊 36-point breakdown", exact: true }).click();
    const factors = page.locator("details");
    assert.equal(await factors.count(), 8);
    await factors.first().locator("summary").click();
    await factors.first().getByText("Scoring rule", { exact: true }).waitFor();
    const nadi = factors.filter({ has: page.getByRole("heading", { name: "Nadi", exact: true }) });
    await nadi.locator("summary").click();
    await page.getByText("Nadi is not a genetic, fertility or medical test", { exact: false }).waitFor();
    console.log("PASS eight kootas expand to their actual values and calculation rules");

    await page.getByRole("button", { name: "♂ Manglik & flags", exact: true }).click();
    await page.getByRole("heading", { name: "Manglik balance & compatibility flags", exact: true }).waitFor();
    assert.equal(await page.getByRole("heading", { name: "Nadi review", exact: true }).count(), 1);
    assert.equal(await page.getByRole("heading", { name: "Bhakoot review", exact: true }).count(), 1);
    console.log("PASS Manglik comparison and Nadi/Bhakoot/Gana context");

    await page.getByRole("button", { name: "🪐 Both charts", exact: true }).click();
    await page.locator("polygon").first().click();
    await page.getByRole("button", { name: "Close", exact: true }).waitFor();
    await page.getByText("House 1 · Rāśi (D1)", { exact: false }).waitFor();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.getByRole("button", { name: "D9 · Navamsa", exact: true }).click();
    await page.getByRole("button", { name: "South Indian", exact: true }).click();
    assert.equal(await page.locator('svg rect[class*="cursor-pointer"]').count(), 24);
    await page.locator('svg rect[class*="cursor-pointer"]').first().click();
    await page.getByRole("button", { name: "Close", exact: true }).waitFor();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    console.log("PASS D1/D9 in North/South styles and working house details");

    await page.getByRole("button", { name: "💞 Marriage & timing", exact: true }).click();
    await page.getByRole("heading", { name: "Marriage indicators beyond the Moon score", exact: true }).waitFor();
    await page.getByRole("button", { name: "🪔 Guidance & remedies", exact: true }).click();
    await page.getByRole("heading", { name: "Practical guidance & optional traditional remedies", exact: true }).waitFor();
    await page.getByRole("button", { name: "📖 Method", exact: true }).click();
    await page.getByRole("heading", { name: "Transparent method, settings & limitations", exact: true }).waitFor();
    await page.locator("summary").filter({ hasText: "Vashya matrix" }).click();
    console.log("PASS marriage context, remedies and disclosed scoring matrices");

    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("23.5/36 points", { exact: true }).waitFor();
    const individualLinks = page.getByRole("link", { name: "View full individual horoscope →", exact: true });
    assert.equal(await individualLinks.count(), 2);
    for (const href of await individualLinks.evaluateAll((links) => links.map((l) => l.href))) {
      const res = await fetch(href); assert.equal(res.status, 200);
    }
    console.log("PASS persisted result and both individual horoscope links reload");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(widths.page <= widths.viewport + 2, `Mobile page overflows: ${JSON.stringify(widths)}`);
    console.log("PASS mobile summary has no horizontal page overflow");
    assert.deepEqual(errors, []);
    console.log("All marriage matching browser tests passed.");
  } finally {
    await context.close(); await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
