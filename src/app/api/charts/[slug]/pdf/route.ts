import { eq } from "drizzle-orm";
import { db } from "@/db";
import { charts } from "@/db/schema";
import { computeChart, currentTransits, type ChartData } from "@/lib/astro/calc";
import { detectDoshas, detectYogas } from "@/lib/astro/yogas";
import { buildKundliPdf } from "@/lib/pdf/kundliReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const rows = await db.select().from(charts).where(eq(charts.slug, slug)).limit(1);
    const row = rows[0];
    if (!row) return Response.json({ error: "Chart not found" }, { status: 404 });

    const stored = row.data as ChartData;
    let c: ChartData;
    try {
      c = computeChart(stored.input); // always use the latest calculation engine
    } catch {
      c = stored;
    }
    const now = Date.now();
    const yogas = detectYogas(c, now);
    const doshas = detectDoshas(c, currentTransits(), now);
    const { bytes, filename } = await buildKundliPdf(c, yogas, doshas);

    const inline = new URL(req.url).searchParams.get("inline") === "1";
    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (e) {
    console.error("PDF generation failed", e);
    return Response.json({ error: "Could not generate the PDF report. Please try again." }, { status: 500 });
  }
}
