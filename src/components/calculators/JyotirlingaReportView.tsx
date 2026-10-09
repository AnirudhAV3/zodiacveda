import Link from "next/link";
import type { JyotirlingaReport } from "@/lib/jyotirlinga/report";

const accent = {
  vitality: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  obstacles: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  fortune: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export default function JyotirlingaReportView({ report, chartSlug }: { report: JyotirlingaReport; chartSlug: string }) {
  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-8">
        <p className="label-caps !text-amber-300">Twelve Jyotirlingas · counted from your chart</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-50">{report.name}&apos;s Jyotirlinga Yatra</h1>
        <p className="mt-3 max-w-3xl text-slate-300">Six traditional shrine suggestions: the 1st sign for strength, the 6th for obstacles and the 9th for fortune, counted from both Janma Rashi and Lagna.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
            <p className="label-caps !text-amber-200">Janma Rashi · Moon</p>
            <p className="mt-1 font-serif text-3xl text-slate-50">{report.moonName}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="label-caps">Lagna · Ascendant</p>
            <p className="mt-1 font-serif text-3xl text-slate-50">{report.lagnaName}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          {report.uniqueCount === 6 ? "All six suggestions are different." : `${report.uniqueCount} different shrines fill the six roles; a repeated shrine serves more than one intention.`}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {report.visits.map((visit, index) => (
          <article key={`${visit.from}-${visit.house}`} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="label-caps">{visit.from} · {visit.house}{visit.house === 1 ? "st" : visit.house === 6 ? "th" : "th"} sign</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold text-slate-50">{visit.temple}</h2>
                <p className="text-sm text-slate-400">{visit.formal} · {visit.place}, {visit.state}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${accent[visit.role as keyof typeof accent]}`}>{visit.roleTitle}</span>
            </div>
            <p className="mt-4 text-sm text-amber-100/90">{visit.signName} · {visit.from === "Janma Rashi" ? "Moon-sign" : "Lagna"} reference</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {visit.house === 1
                ? `${visit.temple} is traditionally associated with strengthening the self and supporting steadiness, vitality and purpose.`
                : visit.house === 6
                  ? `${visit.temple} is traditionally associated with meeting the themes of service, debts, opposition and recurring obstacles.`
                  : `${visit.temple} is traditionally associated with dharma, teachers, guidance and opening a path toward fortune.`}
            </p>
            <p className="mt-4 rounded-xl bg-slate-950/40 p-3 text-xs text-slate-400">A simple practice, if you visit: offer a quiet prayer or abhisheka and “Om Namah Shivaya.” No paid package is required.</p>
            <span className="sr-only">Shrine {index + 1}</span>
          </article>
        ))}
      </section>

      <section className="card p-5 text-sm leading-relaxed text-slate-300">
        <h2 className="font-serif text-2xl text-slate-50">How to use these suggestions</h2>
        <p className="mt-2">The count includes the reference sign as house one. The Moon-sign set is traditionally read for the mind and emotional life; the Lagna set is read for the lived path. A pilgrimage is a spiritual support, not a medical, legal or financial remedy.</p>
        <p className="mt-4 text-xs text-slate-500">Astrology is a traditional interpretive system. Use these suggestions for reflection rather than certainty.</p>
        <p className="mt-4 flex flex-wrap gap-4">
          <Link href="/calculators/jyotirlinga" className="text-amber-300 underline">Calculate another chart</Link>
          <Link href={`/chart/${chartSlug}`} className="text-amber-300 underline">Open full birth chart</Link>
        </p>
      </section>
    </div>
  );
}
