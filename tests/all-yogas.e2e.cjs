/* Run: PLAYWRIGHT_CORE_PATH=/path/to/playwright-core node tests/all-yogas.e2e.cjs */
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
    assert.equal(headings[0], "Build Your Horoscope");
    assert.equal(headings[1], "Marriage Horoscope Matching");
    assert.equal(headings[2], "All Yogas");
    assert.ok(headings.length >= 11, "all calculator tiles must render");
    const boxes = await page.locator("#calculators h3").evaluateAll((hs) => hs.map((h) => h.closest(".card").getBoundingClientRect()));
    assert.equal(boxes[0].top, boxes[1].top, "first two tiles must sit side by side on one row");
    assert.ok(boxes[1].left > boxes[0].left, "Marriage tile must be to the right of Build tile");
    assert.ok(boxes.every((b) => Math.abs(b.width - boxes[0].width) < 2), "tiles must be equal width");
    console.log(`PASS 11 equal tiles; Build left, Marriage right (${Math.round(boxes[0].width)}px each)`);

    // Count dynamically so this stays correct as more calculators ship.
    const soon = page.locator('#calculators [aria-disabled="true"]');
    const available = await page.locator("#calculators a").count();
    const upcoming = await soon.count();
    assert.equal(available + upcoming, headings.length, "every tile must be either available or marked upcoming");
    if (upcoming > 0) assert.equal(await soon.first().evaluate((el) => el.tagName), "DIV", "upcoming tiles must not be clickable links");
    const intro = await page.locator("#calculators").innerText();
    assert.ok(intro.includes(`${available} calculators ready now, ${upcoming} more`), "stated counts must match the number of tiles");
    console.log(`PASS ${available} available tiles and ${upcoming} upcoming tiles; stated counts match`);

    await page.locator("#calculators a", { hasText: "All Yogas" }).click();
    await page.waitForURL("**/calculators/all-yogas");
    await page.getByRole("heading", { name: "All Yogas Calculator", exact: true }).waitFor();

    const group = page.getByRole("group", { name: "Birth details", exact: true });
    await group.getByLabel("Full name", { exact: true }).fill("Browser Yoga Test");
    await group.getByLabel("Date of birth", { exact: true }).fill("2001-08-31");
    await group.getByLabel("Time of birth", { exact: true }).fill("15:04");
    await group.getByRole("button", { name: "Enter coordinates / time zone manually", exact: true }).click();
    await group.getByLabel("Place of birth", { exact: true }).fill("Nellore");
    await group.getByLabel("Latitude", { exact: true }).fill("14.4499");
    await group.getByLabel("Longitude", { exact: true }).fill("79.987");
    await group.getByLabel("Time zone", { exact: true }).fill("Asia/Kolkata");
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.getByRole("group", { name: "Birth details", exact: true }).getByLabel("Full name", { exact: true }).inputValue(), "Browser Yoga Test");
    console.log("PASS unfinished birth details recover after reload");

    const response = page.waitForResponse((r) => r.url().endsWith("/api/yogas") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Find my yogas →", exact: true }).click();
    const api = await response;
    assert.equal(api.status(), 201, await api.text());
    const saved = await api.json();
    await page.waitForURL(`**/calculators/all-yogas/${saved.slug}`);
    await page.getByRole("heading", { name: "Browser Yoga Test", exact: true }).waitFor();
    await page.getByText("22 yogas present", { exact: true }).waitFor();
    console.log("PASS real chart calculated and saved yoga report rendered");

    await page.getByRole("button", { name: "🔱 Yogas in your chart", exact: true }).click();
    const cards = page.locator('[aria-expanded]').filter({ hasText: "Present" });
    assert.ok(await cards.count() >= 20);
    await page.getByRole("combobox", { name: "Filter by category" }).selectOption("Pancha Mahapurusha");
    await page.waitForTimeout(250);
    const filtered = await page.locator("p.font-semibold.text-slate-100").allInnerTexts();
    assert.ok(filtered.length >= 1 && filtered.every((t) => /Yoga/.test(t)));
    await page.getByRole("combobox", { name: "Filter by category" }).selectOption("All");
    // Search for a yoga this chart actually has, so the test reflects real results.
    const presentNames = await page.locator("p.font-semibold.text-slate-100").allInnerTexts();
    const target = presentNames[0];
    await page.getByLabel("Search yogas").fill(target);
    await page.waitForTimeout(300);
    const matches = await page.locator("p.font-semibold.text-slate-100").allInnerTexts();
    assert.ok(matches.includes(target) && matches.length < presentNames.length, `search must narrow results to ${target}`);
    await page.getByLabel("Search yogas").fill("ZzzNoSuchYoga");
    await page.waitForTimeout(300);
    await page.getByText("No yogas match this filter.", { exact: true }).waitFor();
    console.log(`PASS category filter, search ("${target}") and empty-state all behave correctly`);

    await page.getByLabel("Search yogas").fill("");
    await page.waitForTimeout(250);
    await page.getByRole("button", { name: "📚 Every yoga checked", exact: true }).click();
    await page.waitForTimeout(250);
    assert.equal(await page.getByLabel("Search yogas").inputValue(), "", "search box must be clear when switching tabs");
    await page.getByText("of 125 checked", { exact: false }).waitFor();
    const absentCount = await page.getByText("Absent", { exact: true }).count();
    const presentCount = await page.getByText("Present", { exact: true }).count();
    assert.ok(absentCount > 0, "absent yogas must be listed for transparency");
    assert.ok(presentCount > 0 && absentCount > presentCount, "the full list must include both present and absent definitions");
    console.log(`PASS every definition listed: ${presentCount} present and ${absentCount} absent shown`);

    await page.getByRole("button", { name: "🪔 Strengthen & balance", exact: true }).click();
    await page.getByRole("heading", { name: "How to read this", exact: true }).waitFor();
    await page.getByRole("button", { name: "📖 Method", exact: true }).click();
    await page.getByText("not medical, financial, legal", { exact: false }).waitFor();
    console.log("PASS remedies and method/limitations sections render");

    await page.getByRole("button", { name: "✦ Summary", exact: true }).click();
    const chartLink = page.getByRole("link", { name: "Open the full horoscope for this chart →", exact: true });
    const href = await chartLink.getAttribute("href");
    assert.equal((await fetch(base + href)).status, 200);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("22 yogas present", { exact: true }).waitFor();
    console.log("PASS saved report reloads and links to its full horoscope");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base, { waitUntil: "networkidle" });
    const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(widths.page <= widths.viewport + 2, `mobile overflow: ${JSON.stringify(widths)}`);
    const mobile = await page.locator("#calculators h3").evaluateAll((hs) => hs.map((h) => h.closest(".card").getBoundingClientRect().left));
    assert.ok(mobile.every((l) => Math.abs(l - mobile[0]) < 2), "tiles stack in a single column on mobile");
    console.log("PASS mobile tiles stack without horizontal overflow");

    assert.deepEqual(errors, []);
    console.log("All All-Yogas browser tests passed.");
  } finally {
    await context.close();
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
