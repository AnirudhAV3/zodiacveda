import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { charts } from "@/db/schema";
import { computeChart, currentTransits, type ChartData } from "@/lib/astro/calc";
import ChartReport from "@/components/chart/ChartReport";
import { Starfield } from "@/components/Cosmos";

export const metadata: Metadata = { title: "Private Saved Kundli", robots: { index: false, follow: false, noarchive: true } };

export const dynamic = "force-dynamic";

export default async function ChartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await db.select().from(charts).where(eq(charts.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) notFound();
  const stored = row.data as ChartData;
  let data: ChartData;
  try {
    // always recompute with the latest engine so accuracy fixes apply to saved charts
    data = computeChart(stored.input);
  } catch {
    data = stored;
  }
  const transits = currentTransits();
  return (
    <>
      <Starfield count={70} />
      {/* eslint-disable-next-line react-hooks/purity -- Transit predictions need a request-time clock. */}
      <ChartReport c={data} transits={transits} now={Date.now()} slug={slug} />
    </>
  );
}
