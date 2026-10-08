"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { ChartData, DashaPeriod } from "@/lib/astro/calc";
import { PLANET_INFO } from "@/lib/astro/data";
import type { DashaReport } from "@/lib/dasha/report";
import DashaSection, { DashaDetail } from "@/components/chart/DashaSection";

const TABS = [["summary","✦","Summary"],["timeline","⏳","Full timeline"],["five","🔮","Next 5 years"],["method","📖","Method"]] as const;
type Tab=(typeof TABS)[number][0];
const fmt=(ms:number)=>new Date(ms).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"});

export default function DashaReportView({ report:r, chart, chartSlug }:{report:DashaReport;chart:ChartData;chartSlug:string}){
  const [tab,setTab]=useState<Tab>("summary");
  const [level,setLevel]=useState(2);
  const [copied,setCopied]=useState(false);
  const [shareFailed,setShareFailed]=useState(false);
  const share=async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),2500);}catch{setShareFailed(true);}};

  let content:ReactNode;
  if(tab==="summary"){
    const cur=r.current;
    const idx=Math.min(level,(cur?.periods.length??1)-1);
    content=<div className="space-y-6">
      <section className="card p-6"><p className="label-caps !text-violet-300">Balance at birth</p><h2 className="mt-1 font-serif text-3xl font-semibold text-amber-200">{r.balanceAtBirth.text}</h2><p className="mt-2 text-sm text-slate-400">The exact Moon position within {r.chartSummary.moonNakshatra} determined this remaining balance.</p></section>
      {cur ? <section className="card p-5"><div className="mb-4 flex flex-wrap gap-2">{cur.chain.map((lord,i)=><button key={i} type="button" onClick={()=>setLevel(i)} className={`rounded-full border px-4 py-2 text-sm ${idx===i?"border-amber-400 bg-amber-400 text-slate-950":"border-slate-600 text-slate-300"}`}>{["Mahadasha","Antardasha","Pratyantar"][i]}: {lord}</button>)}</div><DashaDetail pred={cur.predictions[idx]} period={cur.periods[idx] as DashaPeriod}/></section>:<p className="card p-6 text-slate-400">No running period found for the saved calculation date.</p>}
      <section className="card p-5"><h2 className="font-serif text-2xl font-semibold text-amber-200">Next transitions</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{r.nextTransitions.map(t=><div key={t.level} className="rounded-xl bg-slate-950/40 p-4"><p className="text-xs text-slate-400">Next {t.level}</p><p className="mt-1 text-xl font-bold" style={{color:PLANET_INFO[t.lord].color}}>{t.lord}</p><p className="text-sm text-slate-300">{fmt(t.date)}</p></div>)}</div></section>
      <section className="card p-5"><h2 className="font-serif text-2xl font-semibold text-amber-200">Mahadasha overview</h2><div className="scroll-thin mt-3 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-800/50"><tr>{["Lord","Start","End","Age","Status"].map(h=><th key={h} className="p-3 text-left text-xs text-slate-400">{h}</th>)}</tr></thead><tbody>{r.mahadashas.map(m=><tr key={`${m.lord}-${m.start}`} className="border-t border-slate-700/40"><td className="p-3 font-bold" style={{color:PLANET_INFO[m.lord].color}}>{m.lord}</td><td className="whitespace-nowrap p-3 text-slate-300">{fmt(m.start)}</td><td className="whitespace-nowrap p-3 text-slate-300">{fmt(m.end)}</td><td className="whitespace-nowrap p-3 text-slate-400">{m.ageStart.toFixed(1)}–{m.ageEnd.toFixed(1)}</td><td className="p-3 capitalize text-slate-300">{m.status}</td></tr>)}</tbody></table></div></section>
      <Link href={`/chart/${chartSlug}`} className="inline-flex text-sm font-semibold text-amber-300 hover:underline">Open the complete horoscope for this chart →</Link>
    </div>;
  }else if(tab==="timeline"){
    content=<div><p className="mb-4 text-sm text-slate-400">Click any Mahadasha, Antardasha or Pratyantar row for benefits, challenges, life areas and remedies.</p><DashaSection c={chart} now={Date.parse(r.calculatedAt)}/></div>;
  }else if(tab==="five"){
    content=<div><h2 className="mb-1 font-serif text-2xl font-semibold text-amber-200">Next five years by Pratyantar period</h2><p className="mb-4 text-sm text-slate-400">Periods are clipped to the five-year window from the saved calculation date. Ratings and text come from the same period-prediction engine as the full horoscope.</p><div className="space-y-3">{r.nextFiveYears.map((p,i)=><details key={`${p.start}-${i}`} className={`card p-4 ${p.rating>=3.5?"border-emerald-500/30":p.rating<2.5?"border-rose-500/30":""}`}><summary className="flex cursor-pointer list-none flex-wrap items-center gap-3"><span className="font-semibold text-slate-100">{p.chain.join(" → ")}</span><span className="text-xs text-slate-400">{fmt(p.start)} – {fmt(p.end)}</span><span className="ml-auto rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-200">{p.rating}/5</span></summary><div className="mt-3 space-y-3 border-t border-slate-700/40 pt-3"><p className="text-sm text-slate-300">{p.summary}</p><div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl bg-emerald-500/5 p-3"><p className="font-semibold text-emerald-300">Benefits</p><ul className="mt-1 list-disc pl-4 text-xs text-slate-300">{p.benefits.map(x=><li key={x}>{x}</li>)}</ul></div><div className="rounded-xl bg-rose-500/5 p-3"><p className="font-semibold text-rose-300">Challenges</p><ul className="mt-1 list-disc pl-4 text-xs text-slate-300">{p.challenges.map(x=><li key={x}>{x}</li>)}</ul></div></div></div></details>)}</div></div>;
  }else{
    content=<section className="card p-5"><h2 className="font-serif text-2xl font-semibold text-amber-200">Method &amp; limitations</h2><p className="mt-1 text-sm text-slate-400">{r.method}</p><ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-slate-300">{r.notes.map(n=><li key={n}>{n}</li>)}</ul><p className="mt-4 text-xs text-slate-500">Engine version {r.version} · calculated {fmt(Date.parse(r.calculatedAt))}</p></section>;
  }

  return <div><header className="card relative mb-6 overflow-hidden p-6 sm:p-8"><div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl"/><p className="label-caps !text-amber-300">Saved Vimshottari Dasha report</p><h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">{r.chartSummary.name}</h1><p className="mt-2 text-sm text-slate-400">{r.chartSummary.date} · {r.chartSummary.time} · {r.chartSummary.place}</p><div className="mt-4 flex flex-wrap gap-3">{r.current&&<span className="rounded-full bg-violet-500/15 px-4 py-2 text-sm font-bold text-violet-200">Running: {r.current.chain.join(" → ")}</span>}<button type="button" onClick={share} className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">{copied?"Link copied ✓":"Share this report"}</button><Link href="/calculators/vimshottari-dasha" className="rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-400/10">New chart</Link></div>{shareFailed&&<p className="mt-2 text-xs text-amber-200">Copy this page’s address from your browser to share it.</p>}</header><nav aria-label="Dasha report sections" className="scroll-thin mb-6 flex gap-2 overflow-x-auto pb-2">{TABS.map(([k,icon,text])=><button key={k} type="button" onClick={()=>setTab(k)} aria-pressed={tab===k} className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm transition ${tab===k?"border-amber-400/60 bg-amber-400/15 font-semibold text-amber-200":"border-slate-700 bg-slate-900/30 text-slate-400 hover:text-slate-200"}`}>{icon} {text}</button>)}</nav><div key={tab} className="animate-pop">{content}</div></div>;
}
