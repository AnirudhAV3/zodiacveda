import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { charts, matchReports } from "@/db/schema";
import { computeChart, type ChartData } from "@/lib/astro/calc";
import { buildMatchResult } from "@/lib/matching/report";
import { MatchInputError, validateMatchBirth } from "@/lib/matching/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const slug = () => randomUUID().replace(/-/g, "");

function chartRow(c: ChartData, chartSlug: string) {
  const i = c.input;
  return {
    slug: chartSlug, name: i.name, gender: i.gender, birthDate: i.date, birthTime: i.time,
    place: i.place, latitude: i.lat, longitude: i.lon, timezone: i.tz, chartStyle: i.style, data: c,
  };
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    if (raw.length > 12_000) return NextResponse.json({ error: "Birth details are too large." }, { status: 413 });
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Please submit valid birth details for both people." }, { status: 400 });
    }
    const style = body.style === "south" ? "south" : "north";
    const firstInput = validateMatchBirth(body.first, "Person 1", style);
    const secondInput = validateMatchBirth(body.second, "Person 2", style);
    const first = computeChart(firstInput);
    const second = computeChart(secondInput);
    if ([first, second].some((c) => !Number.isFinite(c.asc.lon) || c.planets.some((p) => !Number.isFinite(p.lon)))) {
      throw new MatchInputError("Positions could not be calculated for these coordinates. Please verify the birth details.");
    }
    const result = buildMatchResult(first, second);
    const reportSlug = slug();
    const firstChartSlug = slug();
    const secondChartSlug = slug();
    await db.transaction(async (tx) => {
      await tx.insert(charts).values([chartRow(first, firstChartSlug), chartRow(second, secondChartSlug)]);
      await tx.insert(matchReports).values({ slug: reportSlug, firstChartSlug, secondChartSlug, data: result });
    });
    return NextResponse.json({ slug: reportSlug, url: `/calculators/marriage-matching/${reportSlug}` }, { status: 201 });
  } catch (error) {
    if (error instanceof MatchInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Marriage matching failed", error);
    return NextResponse.json({ error: "We could not calculate or save this match. Your existing charts are unchanged. Please try again." }, { status: 500 });
  }
}
