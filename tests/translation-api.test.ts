import assert from "node:assert/strict";
import { test } from "node:test";
import { GET as getLanguages } from "../src/app/api/translation/languages/route";
import { POST as translate } from "../src/app/api/translation/route";

test("Google Cloud translation API keeps credentials server-side and validates requests", async (t) => {
  const originalKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const originalFetch = globalThis.fetch;
  t.after(() => {
    if (originalKey === undefined) delete process.env.GOOGLE_TRANSLATE_API_KEY;
    else process.env.GOOGLE_TRANSLATE_API_KEY = originalKey;
    globalThis.fetch = originalFetch;
  });

  delete process.env.GOOGLE_TRANSLATE_API_KEY;
  const missingKey = await getLanguages();
  assert.equal(missingKey.status, 503);
  assert.match((await missingKey.json()).error, /GOOGLE_TRANSLATE_API_KEY/);

  process.env.GOOGLE_TRANSLATE_API_KEY = "test-key";
  let providerRequests = 0;
  globalThis.fetch = async (input, init) => {
    providerRequests += 1;
    assert.equal(String(input), "https://translation.googleapis.com/language/translate/v2");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("x-goog-api-key"), "test-key");
    assert.equal(String(input).includes("test-key"), false);
    return Response.json({ data: { translations: [{ translatedText: "Bonjour" }] } });
  };

  const invalidLanguage = await translate(new Request("http://localhost/api/translation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ target: "bad language", texts: ["hello"] }),
  }));
  assert.equal(invalidLanguage.status, 400);
  assert.equal(providerRequests, 0);

  const translated = await translate(new Request("http://localhost/api/translation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ target: "fr", texts: ["hello"] }),
  }));
  assert.equal(translated.status, 200);
  assert.deepEqual((await translated.json()).translations, ["Bonjour"]);
  assert.equal(providerRequests, 1);
});
