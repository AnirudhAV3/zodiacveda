import { NextResponse } from "next/server";
import { db } from "@/db";
import { calculatorReports, charts } from "@/db/schema";
import { computeChart } from "@/lib/astro/calc";
import { assertUsableChart, BirthInputError, calculatorSlug, chartRow, validateBirthDetails } from "@/lib/calculators/birth";
import { buildWesternReport } from "@/lib/western/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    if (raw.length > 8_000) return NextResponse.json({ error: "Birth details are too large." }, { status: 413 });
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Please submit valid birth details." }, { status: 400 });
    }
    const input = validateBirthDetails(body.person ?? body, "Birth details", "north");
    const vedic = computeChart(input);
    assertUsableChart(vedic, "Birth details");
    const report = buildWesternReport(input);
    const reportSlug = calculatorSlug();
    const chartSlug = calculatorSlug();
    await db.transaction(async (tx) => {
      await tx.insert(charts).values(chartRow(vedic, chartSlug));
      await tx.insert(calculatorReports).values({ slug: reportSlug, kind: "western-astrology", chartSlug, data: report });
    });
    return NextResponse.json({ slug: reportSlug, url: `/calculators/western-astrology/${reportSlug}` }, { status: 201 });
  } catch (error) {
    if (error instanceof BirthInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Western chart calculation failed", error);
    return NextResponse.json({ error: "We could not calculate or save this Western natal chart. Please try again." }, { status: 500 });
  }
}
