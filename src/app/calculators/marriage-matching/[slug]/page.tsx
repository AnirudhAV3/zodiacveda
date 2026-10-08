import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { charts, matchReports } from "@/db/schema";
import type { ChartData } from "@/lib/astro/calc";
import type { MatchResult } from "@/lib/matching/report";
import { Starfield } from "@/components/Cosmos";
import MatchingReport from "@/components/calculators/MatchingReport";
import BrandLogo from "@/components/BrandLogo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Saved Marriage Compatibility — Zodiac Veda", robots: { index: false, follow: false } };

export default async function MatchingResultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [saved] = await db.select().from(matchReports).where(eq(matchReports.slug, slug)).limit(1);
  if (!saved) notFound();
  const people = await db.select().from(charts).where(or(eq(charts.slug, saved.firstChartSlug), eq(charts.slug, saved.secondChartSlug)));
  const a = people.find((c) => c.slug === saved.firstChartSlug);
  const b = people.find((c) => c.slug === saved.secondChartSlug);
  if (!a || !b) notFound();
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={70} />
      <nav className="mx-auto mb-7 flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <BrandLogo compact />
        <Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link>
      </nav>
      <div className="mx-auto max-w-7xl"><MatchingReport result={saved.data as MatchResult} first={a.data as ChartData} second={b.data as ChartData} firstChartSlug={a.slug} secondChartSlug={b.slug} /></div>

    </main>
  );
}
