import { NextResponse } from "next/server";

type GoogleLanguageResponse = {
  data?: {
    languages?: Array<{ language?: string; name?: string }>;
  };
  error?: { message?: string };
};

export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Cloud Translation is not configured. Add GOOGLE_TRANSLATE_API_KEY to .env.local and restart the app." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch("https://translation.googleapis.com/language/translate/v2/languages?target=en", {
      headers: { "x-goog-api-key": apiKey },
      next: { revalidate: 86_400 },
    });
    const result = await response.json() as GoogleLanguageResponse;
    if (!response.ok) {
      console.error("Google language catalog request failed", response.status, result.error?.message);
      return NextResponse.json(
        { error: "Google Cloud could not load its supported language list. Check the API key and Cloud Translation API configuration." },
        { status: response.status === 401 || response.status === 403 ? 502 : 503 },
      );
    }

    const languages = result.data?.languages
      ?.filter((item): item is { language: string; name: string } =>
        typeof item.language === "string" && typeof item.name === "string",
      )
      .map((item) => ({ code: item.language, name: item.name }))
      .sort((first, second) => first.name.localeCompare(second.name));

    if (!languages?.some((item) => item.code === "en")) {
      return NextResponse.json({ error: "Google Cloud returned an invalid language list." }, { status: 502 });
    }

    return NextResponse.json({ languages }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
  } catch (error) {
    console.error("Google language catalog request failed", error);
    return NextResponse.json({ error: "Google Cloud Translation is temporarily unavailable. Try again shortly." }, { status: 503 });
  }
}
