const assert = require("node:assert/strict");
const base = process.env.BASE_URL || "http://localhost:3000";
const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://zodiacveda.netlify.app").replace(/\/$/, "");
const pages = [
  ["/build", "Vedic Birth Chart Calculator", "Vedic Birth Chart"],
  ["/calculators/western-astrology", "Western Birth Chart Calculator", "Western Birth Chart Calculator"],
  ["/calculators/marriage-matching", "Kundli Matching Calculator", "Marriage Horoscope Matching"],
  ["/calculators/all-yogas", "All Yogas Calculator", "All Yogas Calculator"],
  ["/calculators/all-doshas", "All Doshas Calculator", "All Doshas Calculator"],
  ["/calculators/gemstones", "Gemstone Calculator", "Gemstone Calculator"],
  ["/calculators/divisional-charts", "Divisional Charts Calculator", "All Divisional Charts"],
  ["/calculators/kaal-sarp", "Kaal Sarp Dosha Calculator", "Kaal Sarp Dosha Calculator"],
  ["/calculators/mangal-dosha", "Kuja Dosha Calculator", "Kuja / Mangal Dosha Calculator"],
  ["/calculators/nakshatra-rashi", "Nakshatra Calculator", "Nakshatra &amp; Rashi Calculator"],
  ["/calculators/vimshottari-dasha", "Vimshottari Dasha Calculator", "Vimshottari Dasha Calculator"],
  ["/calculators/sade-sati", "Sade Sati Calculator", "Sade Sati Calculator"],
];
const tag = (html, re) => html.match(re)?.[1] || "";

async function main() {
  const homeRes = await fetch(base);
  assert.equal(homeRes.status, 200);
  const home = await homeRes.text();
  const homeCanonical = tag(home, /<link rel="canonical" href="([^"]+)"/i);
  assert.match(home, /<title>[^<]*Vedic Astrology Calculators/i);
  assert.match(home, /"@type":"WebSite"/);
  assert.match(home, /"@type":"ItemList"/);
  assert.equal(new URL(homeCanonical).origin, siteOrigin);
  assert.equal(new URL(homeCanonical).pathname, "/");
  assert.match(home, /downloadable full birth-chart PDF/i);
  assert.doesNotMatch(home, /₹99/);
  assert.equal((home.match(/<h1/g) || []).length, 1);

  const seenTitles = new Set();
  for (const [path, titlePart, h1] of pages) {
    const res = await fetch(base + path);
    assert.equal(res.status, 200, path);
    const html = await res.text();
    const title = tag(html, /<title>([^<]+)<\/title>/i);
    const description = tag(html, /<meta name="description" content="([^"]+)"/i);
    const canonical = tag(html, /<link rel="canonical" href="([^"]+)"/i);
    assert.match(title, new RegExp(titlePart, "i"), `${path}: title`);
    assert.ok(title.length >= 35 && title.length <= 75, `${path}: title length ${title.length}`);
    assert.ok(description.length >= 110 && description.length <= 180, `${path}: description length ${description.length}`);
    assert.ok(canonical.endsWith(path), `${path}: canonical ${canonical}`);
    assert.equal(seenTitles.has(title), false, `${path}: duplicate title`);
    seenTitles.add(title);
    assert.match(html, new RegExp(`<h1[^>]*>[^<]*(?:<[^>]+>[^<]*)*${h1}`, "i"), `${path}: H1`);
    assert.match(html, /About the .*Calculator|About the .*Matching/i, `${path}: crawlable guide`);
    assert.match(html, /Frequently asked questions/i, `${path}: FAQ content`);
    assert.match(html, /"@type":"SoftwareApplication"/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
    const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    const nodes = structured.flatMap((item) => Array.isArray(item) ? item : item["@graph"] ?? [item]);
    assert.equal(nodes.length, 3, `${path}: expected three JSON-LD entities`);
    assert.deepEqual(nodes.map((item) => item["@type"]), ["SoftwareApplication", "FAQPage", "BreadcrumbList"]);
    assert.equal(nodes[0].url, canonical);
    assert.equal(nodes[1].mainEntity.length, 3);
    assert.doesNotMatch(html, /<meta name="robots" content="noindex/i);
    if (path === "/build") {
      assert.match(description, /downloadable full PDF report/i);
      assert.doesNotMatch(html, /₹99|report is \$?1\.99/i);
      assert.match(html, /Free traditional multi-page Kundli PDF download/i);
    }
  }
  console.log(`PASS ${pages.length} public calculator pages: unique metadata, canonicals, content and JSON-LD`);

  const sitemapRes = await fetch(base + "/sitemap.xml");
  assert.equal(sitemapRes.status, 200);
  const sitemap = await sitemapRes.text();
  assert.match(sitemap, new RegExp(`<loc>${siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>`));
  for (const [path] of pages) assert.ok(sitemap.includes(path), `sitemap missing ${path}`);
  assert.doesNotMatch(sitemap, /\/chart\//);
  assert.doesNotMatch(sitemap, /\/calculators\/[^<]+\/[a-f0-9]{20}/);
  assert.ok(sitemap.includes("/copyright"), "sitemap missing /copyright");
  assert.equal((sitemap.match(/<url>/g) || []).length, pages.length + 2);
  assert.match(sitemap, /2026-10-04/, "Sitemap last-modified reflects the current SEO update");

  const robots = await (await fetch(base + "/robots.txt")).text();
  assert.match(robots, /Sitemap:/);
  assert.ok(robots.includes(`${siteOrigin}/sitemap.xml`), "robots.txt sitemap should use the configured site origin");
  assert.match(robots, /Disallow: \/api\//);
  const manifest = await (await fetch(base + "/manifest.webmanifest")).json();
  assert.equal(manifest.name, "Zodiac Veda — Vedic Astrology Calculators");
  assert.ok(manifest.icons?.length >= 2);
  const social = await fetch(base + "/opengraph-image");
  assert.equal(social.status, 200);
  assert.match(social.headers.get("content-type") || "", /image\/png/);
  assert.ok((await social.arrayBuffer()).byteLength > 10_000, "social image should not be empty");

  const aliases = [
    ["/kuja-dosha-calculator", "/calculators/mangal-dosha"],
    ["/mangal-dosha-calculator", "/calculators/mangal-dosha"],
    ["/kaal-sarp-dosha-calculator", "/calculators/kaal-sarp"],
    ["/kundli-matching", "/calculators/marriage-matching"],
    ["/sade-sati-calculator", "/calculators/sade-sati"],
  ];
  for (const [from, to] of aliases) {
    const res = await fetch(base + from, { redirect: "manual" });
    assert.ok([301, 308].includes(res.status), `${from}: redirect status ${res.status}`);
    assert.ok(new URL(res.headers.get("location"), base).pathname === to, `${from}: location`);
  }

  const chartList = await fetch(base + "/api/charts");
  assert.equal(chartList.status, 405, "Saved-chart list must not be publicly enumerable");
  const api = await fetch(base + "/api/health");
  assert.match(api.headers.get("x-robots-tag") || "", /noindex/);
  console.log("PASS sitemap, robots, permanent aliases, and private/API noindex controls");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
