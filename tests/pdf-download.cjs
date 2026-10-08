/*
 * HTTP regression checks for free Kundli PDF download and inline preview.
 * Run against a started app: BASE_URL=http://localhost:3000 node tests/pdf-download.cjs
 */
const assert = require("node:assert/strict");

const base = process.env.BASE_URL || "http://localhost:3000";

function verifyPdf(bytes, disposition) {
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-", "Response must contain PDF data");
  assert.match(bytes.subarray(-100).toString(), /%%EOF\s*$/, "PDF must have a complete trailer");
  assert.ok(bytes.byteLength > 100_000, "Full Kundli report must not be empty");
  const text = bytes.toString("latin1");
  assert.ok((text.match(/\/Type\s*\/Page\b/g) || []).length >= 10, "PDF must include the full report pages");
  assert.match(text, /ZODIAC VEDA/, "PDF must include current branding");
  assert.match(disposition || "", /^(?:inline|attachment);/);
}

async function main() {
  const listingResponse = await fetch(`${base}/api/charts`);
  assert.equal(listingResponse.status, 405, "Saved charts must not be publicly enumerable");
  const chartResponse = await fetch(`${base}/api/charts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "PDF regression",
      gender: "male",
      date: "1990-01-01",
      time: "12:00",
      place: "New York, NY",
      lat: 40.7128,
      lon: -74.006,
      tz: "America/New_York",
      style: "north",
    }),
  });
  assert.equal(chartResponse.status, 200, "Birth chart must be generated successfully");
  const { slug } = await chartResponse.json();
  assert.match(slug, /^[a-f0-9]{32}$/, "Chart links must use a 122-bit random token");

  const chartPage = await fetch(`${base}/chart/${encodeURIComponent(slug)}`);
  assert.equal(chartPage.status, 200, "Saved chart page must load");
  assert.equal(chartPage.headers.get("referrer-policy"), "no-referrer", "Private chart tokens must not leak in referrers");
  const html = await chartPage.text();
  assert.equal((html.match(/Download free PDF/g) || []).length, 2, "Both report controls must offer free download");
  assert.doesNotMatch(html, /Preview PDF|pdf\?inline=1/, "Chart UI must not show a preview button");
  assert.doesNotMatch(html, /Purchase PDF report|Pay ₹99|checkout\.razorpay\.com/);

  const downloadResponse = await fetch(`${base}/api/charts/${encodeURIComponent(slug)}/pdf`);
  assert.equal(downloadResponse.status, 200, "Free download must not require payment");
  assert.match(downloadResponse.headers.get("content-type") || "", /application\/pdf/);
  assert.equal(downloadResponse.headers.get("referrer-policy"), "no-referrer");
  const downloadBytes = Buffer.from(await downloadResponse.arrayBuffer());
  const downloadDisposition = downloadResponse.headers.get("content-disposition") || "";
  assert.match(downloadDisposition, /^attachment;/);
  verifyPdf(downloadBytes, downloadDisposition);

  const previewResponse = await fetch(`${base}/api/charts/${encodeURIComponent(slug)}/pdf?inline=1`);
  assert.equal(previewResponse.status, 200, "Inline preview must load");
  const previewBytes = Buffer.from(await previewResponse.arrayBuffer());
  const previewDisposition = previewResponse.headers.get("content-disposition") || "";
  assert.match(previewDisposition, /^inline;/);
  verifyPdf(previewBytes, previewDisposition);
  assert.equal(
    previewDisposition.match(/filename="([^"]+)"/)?.[1],
    downloadDisposition.match(/filename="([^"]+)"/)?.[1],
    "Preview and download must use the same report filename",
  );

  for (const path of [
    `/chart/${encodeURIComponent(slug)}/checkout`,
    `/api/charts/${encodeURIComponent(slug)}/checkout`,
    "/api/webhooks/razorpay",
  ]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 404, `Removed payment route must be unavailable: ${path}`);
  }

  console.log(`PASS free PDF download: ${downloadBytes.byteLength} bytes`);
  console.log("PASS inline preview returns the same complete PDF");
  console.log("PASS checkout and payment webhook routes are removed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
