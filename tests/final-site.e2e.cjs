const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || "playwright-core");
const base = process.env.BASE_URL || "http://localhost:3000";

function executable() {
  const root = path.join(os.homedir(), ".cache", "ms-playwright");
  const version = fs.readdirSync(root).find((name) => name.startsWith("chromium_headless_shell"));
  for (const directory of ["chrome-linux", "chrome-linux64"]) {
    const candidate = path.join(root, version, directory, "headless_shell");
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error("Could not find the Playwright Chromium executable.");
}

(async () => {
  const browser = await chromium.launch({ executablePath: executable(), args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.route("**/api/translation/languages", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ languages: [{ code: "en", name: "English" }, { code: "fr", name: "French" }] }),
    }));
    await page.route("**/api/translation", async (route) => {
      const { texts } = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ translations: texts.map((text) => `FR: ${text}`) }),
      });
    });

    await page.goto(base, { waitUntil: "networkidle" });
    const target = await page.locator("#calculators").evaluate((element) => element.getBoundingClientRect().top + scrollY);
    const buildButtons = page.getByRole("button", { name: "Build Chart in English", exact: true });
    assert.equal(await buildButtons.count(), 2);
    for (const button of await buildButtons.all()) {
      await page.evaluate(() => scrollTo(0, 0));
      await button.click();
      await page.waitForTimeout(700);
      let scrollPosition = await page.evaluate(() => scrollY);
      assert.ok(Math.abs(scrollPosition - target) < 200, `${scrollPosition}/${target}`);
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(150);
      await button.click();
      await page.waitForTimeout(700);
      scrollPosition = await page.evaluate(() => scrollY);
      assert.ok(Math.abs(scrollPosition - target) < 200, `repeat ${scrollPosition}/${target}`);
    }
    console.log("PASS both Build Chart controls retain repeat-scroll behavior");

    assert.equal(await page.getByText("Created for curious minds seeking clarity in the stars", { exact: false }).count(), 1);
    assert.equal(await page.getByText(/Anirudh Vasa/i).count(), 0);
    await page.getByRole("link", { name: "Copyright" }).click();
    await page.waitForURL("**/copyright");
    assert.match(await page.locator("main").innerText(), /Copyright © 2026 Zodiac Veda\. All rights reserved\./);
    console.log("PASS generic footer credit and linked 2026 copyright notice");

    await page.goto(base, { waitUntil: "networkidle" });
    const languageButton = page.getByRole("button", { name: /Choose language/ }).first();
    await languageButton.click();
    await page.getByRole("searchbox", { name: "Search languages" }).fill("French");
    await page.getByRole("option", { name: /French/ }).click();
    const consentDialog = page.getByRole("dialog");
    assert.match(await consentDialog.innerText(), /visible page text.*personal details/i);
    await consentDialog.getByRole("button", { name: "Translate page" }).click();
    await page.waitForFunction(() => document.documentElement.lang === "fr");
    await page.waitForFunction(() => document.querySelector("h1")?.textContent?.includes("FR:"));
    assert.match(await page.locator("h1").innerText(), /FR: Decode the sky/);

    await page.getByRole("button", { name: /Choose language/ }).first().click();
    await page.getByRole("searchbox", { name: "Search languages" }).fill("English");
    await page.getByRole("option", { name: /English/ }).click();
    await page.waitForFunction(() => document.documentElement.lang === "en");
    await page.waitForFunction(() => !document.querySelector("h1")?.textContent?.includes("FR:"));
    console.log("PASS searchable language selection, disclosure, page translation, and English restoration");
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
