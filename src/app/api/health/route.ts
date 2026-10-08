import { db } from "@/db";
import { calculatorReports, charts, matchReports, pdfOrders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await Promise.all([
      db.select({ id: charts.id }).from(charts).limit(1),
      db.select({ id: calculatorReports.id }).from(calculatorReports).limit(1),
      db.select({ id: matchReports.id }).from(matchReports).limit(1),
      db.select({ id: pdfOrders.id }).from(pdfOrders).limit(1),
    ]);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Health check failed", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
