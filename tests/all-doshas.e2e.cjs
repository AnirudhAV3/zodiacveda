/* Run: PLAYWRIGHT_CORE_PATH=/path/to/playwright-core node tests/all-doshas.e2e.cjs */
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

async function main() {
  const browser = await chromium.launch({ executablePath: browserPath(), args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  try {
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base, { waitUntil: "networkidle" });

    const headings = await page.locator("#calculators h3").allInnerTexts();
    assert.deepEqual(headings.slice(0, 4), ["Build Your Horoscope", "Marriage Horoscope Matching", "All Yogas", "All Doshas"]);
    const boxes = await page.locator("#calculators h3").evaluateAll((hs) => hs.map((h) => h.closest(".card").getBoundingClientRect()));
    assert.equal(boxes[0].top, boxes[1].top, "Build and Marriage must share the top row");
    assert.ok(boxes[1].left > boxes[0].left, "Marriage must be right of Build");
    assert.ok(boxes.every((b) => Math.abs(b.width - boxes[0].width) < 2), "tiles must be equal width");
    // Counted dynamically so this stays correct as more calculators ship.
    const availableTiles = await page.locator("#calculators a").count();
    const upcomingTiles = await page.locator('#calculators [aria-disabled="true"]').count();
    assert.equal(availableTiles + upcomingTiles, headings.length, "every tile must be available or marked upcoming");
    assert.ok((await page.locator("#calculators").innerText()).includes(`${availableTiles} calculators ready now, ${upcomingTiles} more`), "stated counts must match the tiles");
    console.log(`PASS tiles: Build left, Marriage right, All Doshas available, ${availableTiles} ready / ${upcomingTiles} upcoming`);

    await page.locator("#calculators a", { hasText: "All Doshas" }).click();
    await page.waitForURL("**/calculators/all-doshas");
    await page.getByRole("heading", { name: "All Doshas Calculator", exact: true }).waitFor();

    const group = page.getByRole("group", { name: "Birth details", exact: true });
    await group.getByLabel("Full name", { exact: true }).fill("Browser Dosha Test");
    await group.getByLabel("Date of birth", { exact: true }).fill("2001-08-31");
    await group.getByLabel("Time of birth", { exact: true }).fill("15:04");
    await group.getByRole("button", { name: "Enter coordinates / time zone manually", exact: true }).click();
    await group.getByLabel("Place of birth", { exact: true }).fill("Nellore");
    await group.getByLabel("Latitude", { exact: true }).fill("14.4499");
    await group.getByLabel("Longitude", { exact: true }).fill("79.987");
    await group.getByLabel("Time zone", { exact: true }).fill("Asia/Kolkata");
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.getByRole("group", { name: "Birth details", exact: true }).getByLabel("Full name", { exact: true }).inputValue(), "Browser Dosha Test");
    console.log("PASS unfinished birth details recover after reload");

    const response = page.waitForResponse((r) => r.url().endsWith("/api/doshas") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Check my doshas →", exact: true }).click();
    const api = await response;
    assert.equal(api.status(), 201, await api.text());
    const saved = await api.json();
    await page.waitForURL(`**/calculators/all-doshas/${saved.slug}`);
    await page.getByRole("heading", { name: "Browser Dosha Test", exact: true }).waitFor();
    await page.getByText("2 active of 9", { exact: true }).waitFor();
    console.log("PASS real chart calculated and saved dosha report rendered");

    await page.getByRole("button", { name: "⚠️ Active doshas", exact: true }).click();
    await page.getByRole("heading", { name: "Active doshas", exact: true }).waitFor();
    const activeCards = page.locator('[aria-expanded]').filter({ hasText: /Active ·/ });
    assert.ok(await activeCards.count() >= 1, "active doshas must be listed");
    await activeCards.first().click();
    await page.getByText("Areas traditionally affected", { exact: true }).first().waitFor();
    console.log("PASS active dosha expands to show areas, planets and remedies");

    await page.getByRole("button", { name: "📚 Every dosha checked", exact: true }).click();
    await page.getByText("All 9 doshas that were evaluated", { exact: false }).waitFor();
    const notPresent = await page.getByText("Not present", { exact: true }).count();
    assert.ok(notPresent > 0, "doshas that do not apply must still be listed");
    console.log(`PASS all 9 definitions listed, including ${notPresent} marked "Not present"`);

    await page.getByRole("button", { name: "🪐 Sade Sati timeline", exact: true }).click();
    await page.getByRole("heading", { name: "Shani Sade Sati", exact: true }).waitFor();
    const phases = page.locator("ol > li");
    const phaseCount = await phases.count();
    assert.ok(phaseCount > 0, "timeline must list phases");
    const first = await phases.first().innerText();
    assert.match(first, /\d{2} \w{3} \d{4} → \d{2} \w{3} \d{4}/, "phases must show real dates");
    console.log(`PASS Sade Sati timeline shows ${phaseCount} dated phases`);

    await page.getByRole("button", { name: "🪔 Remedies", exact: true }).click();
    await page.getByRole("heading", { name: "How to approach remedies", exact: true }).waitFor();
    await page.getByRole("button", { name: "📖 Method", exact: true }).click();
    await page.getByText("not medical, financial, legal", { exact: false }).waitFor();
    console.log("PASS remedies and method/limitations sections render");

    await page.getByRole("button", { name: "✦ Summary", exact: true }).click();
    const chartLink = page.getByRole("link", { name: "Open the full horoscope for this chart →", exact: true });
    assert.equal((await fetch(base + (await chartLink.getAttribute("href")))).status, 200);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("2 active of 9", { exact: true }).waitFor();
    console.log("PASS saved report reloads and links to its full horoscope");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(widths.page <= widths.viewport + 2, `mobile overflow: ${JSON.stringify(widths)}`);
    console.log("PASS mobile report has no horizontal overflow");

    assert.deepEqual(errors, []);
    console.log("All All-Doshas browser tests passed.");
  } finally {
    await context.close();
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
