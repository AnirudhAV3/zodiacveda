import Link from "next/link";
import type { WesternReport } from "@/lib/western/report";

const TONE: Record<string, string> = {
  easy: "border-emerald-400/20 bg-emerald-400/5",
  tense: "border-rose-400/20 bg-rose-400/5",
  fusion: "border-violet-400/20 bg-violet-400/5",
};

function degree(value: number) {
  const d = Math.floor(value);
  const m = Math.floor((value - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}'`;
}

export default function WesternReportView({ report, chartSlug }: { report: WesternReport; chartSlug: string }) {
  const sun = report.bodies.find((body) => body.id === "Sun");
  const moon = report.bodies.find((body) => body.id === "Moon");
  const rising = report.signs[report.ascendantSign];

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-8">
        <p className="label-caps !text-amber-300">Tropical zodiac · equal-sign houses</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-slate-50">{report.name}&apos;s Western Horoscope</h1>
        <p className="mt-3 max-w-3xl text-slate-300">A snapshot of the tropical planetary placements, houses and major aspects for your recorded birth details.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Sun", item: sun },
            { label: "Moon", item: moon },
            { label: "Rising", item: null },
          ].map(({ label, item }) => (
            <div key={label} className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="label-caps !text-amber-200">{label}</p>
              <p className="mt-1 font-serif text-2xl text-slate-50">{item ? report.signs[item.sign] : rising}</p>
              {item && <p className="mt-1 text-xs text-slate-400">{degree(item.degree)} · House {item.house}</p>}
              {!item && <p className="mt-1 text-xs text-slate-400">{degree(report.ascendant % 30)} · Ascendant</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-700/60 px-5 py-4">
          <h2 className="font-serif text-2xl font-semibold text-slate-100">Planetary placements</h2>
          <p className="mt-1 text-sm text-slate-400">Tropical sign, equal-sign house and apparent retrograde status.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Body</th><th className="px-5 py-3">Sign</th><th className="px-5 py-3">Position</th><th className="px-5 py-3">House</th><th className="px-5 py-3">Motion</th></tr></thead>
            <tbody>
              {report.bodies.map((body) => (
                <tr key={body.id} className="border-t border-slate-700/40">
                  <td className="px-5 py-3 font-medium text-slate-100">{body.glyph} {body.id}</td>
                  <td className="px-5 py-3 text-slate-300">{report.signs[body.sign]}</td>
                  <td className="px-5 py-3 text-slate-300">{degree(body.degree)}</td>
                  <td className="px-5 py-3 text-slate-300">{body.house}</td>
                  <td className="px-5 py-3 text-slate-400">{body.retrograde ? "Retrograde" : "Direct"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-serif text-2xl font-semibold text-slate-100">Major aspects</h2>
        <p className="mt-1 text-sm text-slate-400">Aspects are sorted by orb; a smaller orb is closer to the exact angle.</p>
        {report.aspects.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {report.aspects.slice(0, 24).map((aspect, index) => (
              <li key={`${aspect.a}-${aspect.b}-${aspect.name}-${index}`} className={`rounded-xl border p-3 text-sm text-slate-200 ${TONE[aspect.tone]}`}>
                <span className="font-semibold">{aspect.a} {aspect.name} {aspect.b}</span>
                <span className="ml-2 text-xs text-slate-400">{aspect.orb.toFixed(1)}° orb</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 text-sm text-slate-400">No major aspects fell within the selected orbs.</p>}
      </section>

      <section className="card p-5 text-sm leading-relaxed text-slate-300">
        <p>This report uses tropical ecliptic positions and whole-sign equal houses. Astrology is a traditional interpretive system; use the chart for reflection, not as a substitute for professional advice.</p>
        <p className="mt-4 flex flex-wrap gap-4">
          <Link href="/calculators/western-horoscope" className="text-amber-300 underline">Calculate another horoscope</Link>
          <Link href={`/chart/${chartSlug}`} className="text-amber-300 underline">Open Vedic birth chart</Link>
        </p>
      </section>
    </div>
  );
}
