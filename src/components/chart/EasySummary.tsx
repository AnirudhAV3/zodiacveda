"use client";

import type { EasyChartSummary, EasyDashaSummary } from "@/lib/astro/easySummary";

function Badge({ children }: { children: string }) {
  return <span className="rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200">{children}</span>;
}

export function ChartEasySummary({ data }: { data: EasyChartSummary }) {
  return (
    <div id="chart-summary" className="mt-8 scroll-mt-24 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge>In simple words</Badge>
          <h3 className="mt-2 font-serif text-3xl font-semibold text-slate-100">{data.headline}</h3>
          <p className="mt-2 max-w-3xl text-slate-300">{data.inShort}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {data.charts.map((ch) => (
          <article key={ch.key} className="card p-5">
            <p className="label-caps !text-amber-300">{ch.key}</p>
            <h4 className="mt-1 font-serif text-2xl text-slate-100">{ch.title}</h4>
            <p className="mt-1 text-sm text-sky-200">Rising · {ch.rising}</p>
            <p className="mt-3 rounded-xl bg-amber-400/10 p-3 text-sm font-medium text-amber-100">{ch.outlook}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
              {ch.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="card p-5">
          <h4 className="font-serif text-2xl text-slate-100">What happens next</h4>
          <p className="mt-1 text-sm text-slate-400">A plain reading of your current and coming life-chapters (Vimshottari periods).</p>
          <div className="mt-4 space-y-3">
            {data.future.map((f) => (
              <div key={f.title} className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                <p className="text-sm font-semibold text-sky-200">{f.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">{f.text}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="card p-5">
          <h4 className="font-serif text-2xl text-slate-100">Planet aspects, simply</h4>
          <p className="mt-1 text-sm text-slate-400">When a planet “looks at” a house, that topic of life feels the planet’s style.</p>
          <div className="mt-4 space-y-3">
            {data.aspects.map((a) => (
              <div key={a.title} className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                <p className="text-sm font-semibold text-violet-200">{a.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">{a.text}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="card border-emerald-500/25 p-5 sm:p-6">
        <h4 className="font-serif text-2xl text-emerald-200">How to invite success</h4>
        <p className="mt-1 text-sm text-slate-400">Small, repeatable acts. Astrology here is a reminder, not a substitute for work, medicine or law.</p>
        <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-slate-200">
          {data.success.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </article>
    </div>
  );
}

export function DashaEasySummary({ data }: { data: EasyDashaSummary }) {
  return (
    <div id="dasha-summary" className="mt-8 scroll-mt-24 space-y-5">
      <Badge>In simple words</Badge>
      <h3 className="font-serif text-3xl font-semibold text-slate-100">Your current life chapter</h3>
      <p className="max-w-3xl text-slate-400">
        Vimshottari Dasha is a clock, not a verdict. A “period” is a weather season for the mind and circumstances. You still choose how to walk in it.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="card p-5">
          <p className="label-caps !text-amber-300">Happening now</p>
          <h4 className="mt-1 font-serif text-2xl text-slate-100">{data.currentTitle}</h4>
          <p className="text-sm text-amber-200">{data.currentDates}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{data.now}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-300">
            {data.happening.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </article>
        <article className="card p-5">
          <p className="label-caps !text-sky-300">What comes after</p>
          <h4 className="mt-1 font-serif text-2xl text-slate-100">{data.nextTitle}</h4>
          <p className="text-sm text-sky-200">{data.nextDates}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{data.next}</p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
          <h4 className="font-semibold text-emerald-300">Do this</h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-emerald-50/90">
            {(data.doThis.length ? data.doThis : ["Keep a steady daily routine and finish one important task before starting another."]).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-5">
          <h4 className="font-semibold text-orange-300">Better to avoid</h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-orange-50/90">
            {data.avoid.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-teal-500/25 bg-teal-500/5 p-5">
          <h4 className="font-semibold text-teal-300">Simple remedies</h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-teal-50/90">
            {data.remedies.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
