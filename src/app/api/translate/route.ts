import { NextResponse } from "next/server";
import { LANGUAGES } from "@/lib/languages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ITEMS = 50;
const MAX_CHARACTERS = 20_000;
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const TRANSLATION_TIMEOUT_MS = 20_000;
const MAX_PARALLEL_TRANSLATIONS = 5;
const requestsByClient = new Map<string, { count: number; resetAt: number }>();
let cachedLanguages: { baseUrl: string; expiresAt: number; codes: Set<string> } | undefined;

type LibreTranslateLanguage = {
  code?: unknown;
  targets?: unknown;
};

function getBaseUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("LIBRETRANSLATE_URL must be an HTTP(S) URL without embedded credentials.");
  }
  return url.toString().replace(/\/+$/, "");
}

async function supportedTargetCodes(baseUrl: string, signal: AbortSignal) {
  if (cachedLanguages?.baseUrl === baseUrl && cachedLanguages.expiresAt > Date.now()) {
    return cachedLanguages.codes;
  }

  const response = await fetch(`${baseUrl}/languages`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`Language catalog returned HTTP ${response.status}.`);

  const languages = await response.json() as LibreTranslateLanguage[];
  if (!Array.isArray(languages)) throw new Error("Language catalog returned an invalid response.");
  const english = languages.find((language) => language.code === "en");
  if (!english || !Array.isArray(english.targets)) {
    throw new Error("Language catalog does not list supported English translation targets.");
  }
  const targets = new Set(english.targets.filter((target): target is string => typeof target === "string"));
  cachedLanguages = { baseUrl, expiresAt: Date.now() + 10 * 60_000, codes: targets };
  return targets;
}

async function translateOne(
  baseUrl: string,
  apiKey: string | undefined,
  text: string,
  target: string,
  signal: AbortSignal,
) {
  const payload: { q: string; source: string; target: string; format: string; api_key?: string } = {
    q: text,
    source: "auto",
    target,
    format: "text",
  };
  if (apiKey) payload.api_key = apiKey;

  const response = await fetch(`${baseUrl}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Translation service returned HTTP ${response.status}.`);

  const result = await response.json() as { translatedText?: unknown };
  if (typeof result.translatedText !== "string") throw new Error("Translation service returned an invalid response.");
  return result.translatedText;
}

async function translateBatch(
  baseUrl: string,
  apiKey: string | undefined,
  texts: string[],
  target: string,
  signal: AbortSignal,
) {
  const translations = new Array<string>(texts.length);
  for (let start = 0; start < texts.length; start += MAX_PARALLEL_TRANSLATIONS) {
    const end = Math.min(start + MAX_PARALLEL_TRANSLATIONS, texts.length);
    const results = await Promise.all(
      texts.slice(start, end).map((text) => translateOne(baseUrl, apiKey, text, target, signal)),
    );
    results.forEach((translation, offset) => {
      translations[start + offset] = translation;
    });
  }
  return translations;
}

function isRateLimited(request: Request) {
  const client =
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const now = Date.now();
  const current = requestsByClient.get(client);
  if (!current || current.resetAt <= now) {
    requestsByClient.set(client, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "Too many translation requests. Wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const configuredUrl = process.env.LIBRETRANSLATE_URL;
  if (!configuredUrl) {
    return NextResponse.json(
      { error: "Automatic translation is not configured. Set LIBRETRANSLATE_URL to your self-hosted translation service." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid translation request." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Send a valid translation request." }, { status: 400 });
  }

  const { target, texts } = body as { target?: unknown; texts?: unknown };
  if (typeof target !== "string" || !LANGUAGES.some((language) => language.code === target)) {
    return NextResponse.json({ error: "Choose a language from the language list." }, { status: 400 });
  }
  if (!Array.isArray(texts) || texts.length === 0 || texts.length > MAX_ITEMS || !texts.every((text) => typeof text === "string")) {
    return NextResponse.json({ error: `Translate between 1 and ${MAX_ITEMS} text segments at a time.` }, { status: 400 });
  }

  const inputs = texts as string[];
  if (inputs.some((text) => text.length > 5_000) || inputs.reduce((sum, text) => sum + text.length, 0) > MAX_CHARACTERS) {
    return NextResponse.json({ error: "This translation batch is too large." }, { status: 413 });
  }

  let baseUrl: string;
  try {
    baseUrl = getBaseUrl(configuredUrl);
  } catch {
    return NextResponse.json({ error: "LIBRETRANSLATE_URL must be a valid HTTP(S) service URL." }, { status: 500 });
  }
  const apiKey = process.env.LIBRETRANSLATE_API_KEY;
  const targetLanguage = target === "zh" ? "zh-Hans" : target;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT_MS);

  try {
    const supportedCodes = await supportedTargetCodes(baseUrl, controller.signal);
    if (!supportedCodes.has(targetLanguage)) {
      return NextResponse.json(
        { error: "Your self-hosted translation service does not support this language. Choose another language or install its language model." },
        { status: 422 },
      );
    }
    return NextResponse.json({
      translations: await translateBatch(baseUrl, apiKey, inputs, targetLanguage, controller.signal),
    });
  } catch (error) {
    console.error("Self-hosted translation request did not complete", {
      errorType: error instanceof Error ? error.name : "UnknownError",
      targetLanguage,
    });
    return NextResponse.json(
      {
        error: error instanceof Error && error.name === "AbortError"
          ? "Translation took too long. Please try again."
          : "The self-hosted translation service is unavailable or could not translate this language.",
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
