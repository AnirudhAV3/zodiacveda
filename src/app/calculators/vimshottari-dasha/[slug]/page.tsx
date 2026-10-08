import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { calculatorReports, charts } from "@/db/schema";
import type { ChartData } from "@/lib/astro/calc";
import type { DashaReport } from "@/lib/dasha/report";
import { Starfield } from "@/components/Cosmos";
import DashaReportView from "@/components/calculators/DashaReportView";
import BrandLogo from "@/components/BrandLogo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Saved Vimshottari Dasha — Zodiac Veda", robots: { index: false, follow: false } };

export default async function Page({params}:{params:Promise<{slug:string}>}){const{slug}=await params;const[saved]=await db.select().from(calculatorReports).where(and(eq(calculatorReports.slug,slug),eq(calculatorReports.kind,"vimshottari-dasha"))).limit(1);if(!saved)notFound();const[chart]=await db.select().from(charts).where(eq(charts.slug,saved.chartSlug)).limit(1);if(!chart)notFound();return <main className="relative min-h-screen px-4 py-6 sm:px-6"><Starfield count={70}/><nav className="mx-auto mb-7 flex max-w-7xl flex-wrap items-center justify-between gap-3"><BrandLogo compact /><Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link></nav><div className="mx-auto max-w-7xl"><DashaReportView report={saved.data as DashaReport} chart={chart.data as ChartData} chartSlug={chart.slug}/></div></main>;
}
