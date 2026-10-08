import { NextResponse } from "next/server";

type GoogleTranslationResponse = {
  data?: {
    translations?: Array<{ translatedText?: string }>;
  };
  error?: { message?: string };
};

const MAX_REQUEST_BYTES = 40_000;
const MAX_TEXTS = 100;
const MAX_TOTAL_TEXT_LENGTH = 8_000;

function isTranslationTexts(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length > 0
    && value.length <= MAX_TEXTS
    && value.every((text) => typeof text === "string" && text.length <= MAX_TOTAL_TEXT_LENGTH);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Cloud Translation is not configured. Add GOOGLE_TRANSLATE_API_KEY to .env.local and restart the app." },
      { status: 503 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Send translation requests as JSON." }, { status: 415 });
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "The translation request is too large." }, { status: 413 });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "The translation request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Please submit a valid translation request." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Please submit a valid translation request." }, { status: 400 });
  }

  const { target, texts } = body as { target?: unknown; texts?: unknown };
  if (typeof target !== "string" || !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(target) || target.length > 40) {
    return NextResponse.json({ error: "Choose a supported translation language." }, { status: 400 });
  }
  if (!isTranslationTexts(texts)) {
    return NextResponse.json({ error: "The translation text list is invalid." }, { status: 400 });
  }
  const totalLength = texts.reduce((total, text) => total + text.length, 0);
  if (totalLength > MAX_TOTAL_TEXT_LENGTH) {
    return NextResponse.json({ error: "The translation text list is too large." }, { status: 413 });
  }

  try {
    const response = await fetch("https://translation.googleapis.com/language/translate/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({ q: texts, target, format: "text" }),
      cache: "no-store",
    });
    const result = await response.json() as GoogleTranslationResponse;
    if (!response.ok) {
      console.error("Google Cloud translation request failed", response.status, result.error?.message);
      return NextResponse.json(
        { error: "Google Cloud could not translate this page. Check the API key, billing, and language support." },
        { status: response.status === 400 ? 400 : 502 },
      );
    }

    const translations = result.data?.translations?.map((item) => item.translatedText);
    if (!translations || translations.length !== texts.length
      || translations.some((item) => typeof item !== "string")) {
      return NextResponse.json({ error: "Google Cloud returned an incomplete translation." }, { status: 502 });
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Google Cloud translation request failed", error);
    return NextResponse.json({ error: "Google Cloud Translation is temporarily unavailable. Try again shortly." }, { status: 503 });
  }
}
