/* Run: PLAYWRIGHT_CORE_PATH=/path/to/playwright-core node tests/gemstone-varga.e2e.cjs */
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

async function fillForm(page, name) {
  const group = page.getByRole("group", { name: "Birth details", exact: true });
  await group.getByLabel("Full name", { exact: true }).fill(name);
  await group.getByLabel("Date of birth", { exact: true }).fill("2001-08-31");
  await group.getByLabel("Time of birth", { exact: true }).fill("15:04");
  await group.getByRole("button", { name: "Enter coordinates / time zone manually", exact: true }).click();
  await group.getByLabel("Place of birth", { exact: true }).fill("Nellore");
  await group.getByLabel("Latitude", { exact: true }).fill("14.4499");
  await group.getByLabel("Longitude", { exact: true }).fill("79.987");
  await group.getByLabel("Time zone", { exact: true }).fill("Asia/Kolkata");
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
    assert.deepEqual(headings.slice(0, 6), ["Build Your Horoscope", "Marriage Horoscope Matching", "All Yogas", "All Doshas", "Gemstone Calculator", "All Divisional Charts"]);
    const boxes = await page.locator("#calculators h3").evaluateAll((hs) => hs.map((h) => h.closest(".card").getBoundingClientRect()));
    assert.equal(boxes[0].top, boxes[1].top, "Build and Marriage must share the top row");
    assert.ok(boxes[1].left > boxes[0].left, "Marriage must be right of Build");
    assert.ok(boxes.every((b) => Math.abs(b.width - boxes[0].width) < 2), "tiles must be equal width");
    const available = await page.locator("#calculators a").count();
    const upcoming = await page.locator('#calculators [aria-disabled="true"]').count();
    assert.equal(available + upcoming, headings.length, "all tiles must be available or labelled upcoming");
    assert.ok((await page.locator("#calculators").innerText()).includes(`${available} calculators ready now, ${upcoming} more`));
    console.log(`PASS tiles: Build left, Marriage right, ${available} available / ${upcoming} upcoming, counts match`);

    /* ---------- GEMSTONE ---------- */
    await page.locator("#calculators a", { hasText: "Gemstone Calculator" }).click();
    await page.waitForURL("**/calculators/gemstones");
    await fillForm(page, "Browser Gem Test");
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.getByRole("group", { name: "Birth details", exact: true }).getByLabel("Full name", { exact: true }).inputValue(), "Browser Gem Test");
    console.log("PASS gemstone: draft recovers after reload");

    let res = page.waitForResponse((r) => r.url().endsWith("/api/gemstones") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Find my gemstones →", exact: true }).click();
    let api = await res;
    assert.equal(api.status(), 201, await api.text());
    await page.waitForURL(`**/calculators/gemstones/${(await api.json()).slug}`);
    await page.getByRole("heading", { name: "Browser Gem Test", exact: true }).waitFor();
    await page.getByText("3 recommended", { exact: true }).waitFor();
    console.log("PASS gemstone: real chart calculated and report rendered");

    // Cards open the first entry by default; only click when a card is collapsed.
    const expand = async (card) => { if ((await card.getAttribute("aria-expanded")) !== "true") await card.click(); };
    const firstGem = page.locator('[aria-expanded]').first();
    await expand(firstGem);
    await page.getByText("Lower-cost substitutes (upratna)", { exact: false }).first().waitFor();
    await page.getByText("Mantra", { exact: true }).first().waitFor();
    console.log("PASS gemstone: recommendation expands with mantra, weight and substitutes");

    await page.getByRole("button", { name: "🚫 Stones to avoid", exact: true }).click();
    await page.getByRole("heading", { name: "Stones to avoid", exact: true }).waitFor();
    const avoidCard = page.locator('[aria-expanded]').first();
    await expand(avoidCard);
    // A stone that is advised against must NOT show wearing instructions.
    await page.getByText("Wearing instructions are intentionally not shown", { exact: false }).first().waitFor();
    assert.equal(await page.getByText("Lower-cost substitutes (upratna)", { exact: false }).count(), 0, "an avoided stone must not advertise substitutes to buy");
    console.log("PASS gemstone: avoided stones explain why and hide wearing instructions");

    await page.getByRole("button", { name: "🪔 How to wear", exact: true }).click();
    await page.getByRole("heading", { name: "Before you spend money", exact: true }).waitFor();
    await page.getByRole("button", { name: "📖 Method", exact: true }).click();
    await page.getByText("not medical, financial or legal advice", { exact: false }).waitFor();
    console.log("PASS gemstone: wearing guide and honest limitations render");

    /* ---------- DIVISIONAL CHARTS ---------- */
    await page.goto(base + "/#calculators", { waitUntil: "networkidle" });
    await page.locator("#calculators a", { hasText: "All Divisional Charts" }).click();
    await page.waitForURL("**/calculators/divisional-charts");
    await fillForm(page, "Browser Varga Test");
    res = page.waitForResponse((r) => r.url().endsWith("/api/divisional-charts") && r.request().method() === "POST");
    await page.getByRole("button", { name: "Generate all 16 charts →", exact: true }).click();
    api = await res;
    assert.equal(api.status(), 201, await api.text());
    await page.waitForURL(`**/calculators/divisional-charts/${(await api.json()).slug}`);
    await page.getByRole("heading", { name: "Browser Varga Test", exact: true }).waitFor();
    await page.getByText("16 charts", { exact: true }).waitFor();
    console.log("PASS divisional: real chart calculated and report rendered");

    // Default focus is D9; switching to D60 must redraw a different chart.
    await page.getByRole("heading", { name: /^D9 · Navamsa$/ }).waitFor();
    await page.getByRole("button", { name: "D60", exact: true }).click();
    await page.getByRole("heading", { name: /^D60 · Shashtiamsa$/ }).waitFor();
    await page.getByText("past-life karma", { exact: false }).first().waitFor();
    console.log("PASS divisional: chart selector switches D9 → D60 with its own purpose text");

    await page.getByRole("button", { name: "South Indian", exact: true }).click();
    await page.waitForTimeout(200);
    assert.ok(await page.locator("svg rect[class*='cursor-pointer']").count() > 0, "south chart renders cells");
    await page.getByRole("button", { name: "North Indian", exact: true }).click();
    await page.waitForTimeout(200);
    assert.ok(await page.locator("svg polygon").count() > 0, "north chart renders houses");
    console.log("PASS divisional: North and South Indian styles both render");

    await page.getByRole("button", { name: "🪐 All 16 charts", exact: true }).click();
    await page.waitForTimeout(400);
    const svgCount = await page.locator("section svg").count();
    assert.ok(svgCount >= 16, `all 16 charts must be drawn, found ${svgCount}`);
    console.log(`PASS divisional: all 16 charts drawn on one page (${svgCount} SVGs)`);

    await page.getByRole("button", { name: "📊 Vimsopaka strength", exact: true }).click();
    await page.getByRole("heading", { name: "Vimsopaka Bala", exact: true }).waitFor();
    const rows = await page.locator("table tbody tr").count();
    assert.ok(rows >= 9, "every planet must appear in the strength table");
    await page.getByRole("button", { name: "📖 Method", exact: true }).click();
    await page.getByText("birth-time", { exact: false }).first().waitFor();
    console.log(`PASS divisional: Vimsopaka table (${rows} rows) and limitations render`);

    await page.getByRole("button", { name: "✦ Summary", exact: true }).click();
    const chartLink = page.getByRole("link", { name: "Open the full horoscope for this chart →", exact: true });
    assert.equal((await fetch(base + (await chartLink.getAttribute("href")))).status, 200);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("16 charts", { exact: true }).waitFor();
    console.log("PASS divisional: saved report reloads and links to its full horoscope");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: innerWidth }));
    assert.ok(widths.page <= widths.viewport + 2, `mobile overflow: ${JSON.stringify(widths)}`);
    console.log("PASS mobile: no horizontal overflow");

    assert.deepEqual(errors, []);
    console.log("All Gemstone + Divisional Chart browser tests passed.");
  } finally {
    await context.close();
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
