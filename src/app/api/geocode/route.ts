import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface OMResult {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error("geocode failed");
    const j = (await r.json()) as { results?: OMResult[] };
    const results = (j.results ?? []).map((x) => ({
      label: [x.name, x.admin1, x.country].filter(Boolean).join(", "),
      lat: x.latitude,
      lon: x.longitude,
      tz: x.timezone ?? "UTC",
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: "Place lookup unavailable. Enter coordinates manually." }, { status: 200 });
  }
}
