"use client";

import { useMemo, useState } from "react";
import ClickHint from "./ClickHint";
import type { ChartData } from "@/lib/astro/calc";
import { fmtDeg } from "@/lib/astro/calc";
import { BHAVAS, NAKSHATRAS, PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";
import { avasthaPower, baladiAvastha, charaKarakas, devatas, dignityColor, KARAKA_FULL, nodeBehaviour, velocity } from "@/lib/astro/analysis";
import { allPlanetReports } from "@/lib/astro/planetReport";
import ShadbalaSection from "./ShadbalaSection";

const VIEWS = [
  { v: "Positions & Karakas", hint: "Longitudes, nakshatras, Jaimini Chara Karakas and divisional signs" },
  { v: "Strength & Conditions", hint: "Dignity, functional nature, avastha, combustion, Vargottama, verdict" },
  { v: "Shadbala Breakdown", hint: "Six-fold strength per BPHS with graphs and component details" },
  { v: "Velocity & Brightness", hint: "Daily motion vs mean motion, retrogression, visual magnitude" },
  { v: "Rahu & Ketu Behaviour", hint: "Dispositors, conjunctions, aspects and how the nodes act" },
  { v: "Devatas", hint: "Presiding, Adhi and Pratyadhi devatas with nakshatra deities" },
] as const;
type View = (typeof VIEWS)[number]["v"];

const ICONS: Record<View, string> = {
  "Positions & Karakas": "📍",
  "Strength & Conditions": "💪",
  "Shadbala Breakdown": "📊",
  "Velocity & Brightness": "🚀",
  "Rahu & Ketu Behaviour": "☊",
  Devatas: "🕉",
};

function Tabs({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  return (
    <div className="card scroll-thin mb-5 overflow-x-auto p-1.5">
      <div role="tablist" className="grid min-w-[760px] grid-cols-6 gap-1.5">
        {VIEWS.map((x) => {
          const on = x.v === value;
          return (
            <button
              key={x.v}
              type="button"
              role="tab"
              aria-selected={on}
              title={x.hint}
              onClick={() => onChange(x.v)}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-center transition ${on ? "bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 shadow-[0_8px_24px_rgba(249,115,22,0.35)]" : "text-slate-300 hover:bg-white/5 hover:text-amber-200"}`}
            >
              <span className="text-lg leading-none">{ICONS[x.v]}</span>
              <span className="text-[13px] font-semibold uppercase leading-tight tracking-wide">{x.v}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</th>;
const Td = ({ children, cls = "" }: { children: React.ReactNode; cls?: string }) => <td className={`whitespace-nowrap px-3 py-2.5 ${cls}`}>{children}</td>;
const PName = ({ id }: { id: PlanetId }) => (
  <span className="font-bold" style={{ color: PLANET_INFO[id].color }}>
    <span className="glyph mr-1">{PLANET_INFO[id].glyph + "\uFE0E"}</span>
    {id}
  </span>
);

function TableCard({ children }: { children: React.ReactNode }) {
  return <div className="card scroll-thin overflow-x-auto">{children}</div>;
}

function Notes({ title, items }: { title: string; items: { id: PlanetId; text: React.ReactNode }[] }) {
  return (
    <div className="card mt-4 p-5">
      <h4 className="mb-3 font-serif text-xl text-amber-200">{title}</h4>
      <ul className="space-y-2.5 text-sm leading-relaxed text-slate-200">
        {items.map((it) => (
          <li key={it.id} className="flex gap-3">
            <span className="w-20 shrink-0">
              <PName id={it.id} />
            </span>
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const KARAKA_MEANING: Record<string, string> = {
  AK: "the soul's ruler — the main lesson and desire of this life; its dasha is life-defining",
  AmK: "the minister of the soul — career, profession and how you earn status",
  BK: "siblings, courage, co-workers and the guru in Jaimini tradition",
  MK: "mother, home, property, vehicles and emotional comfort",
  PiK: "father, elders, mentors and paternal blessings",
  GK: "cousins, rivals, disease and obstacles you must overcome",
  DK: "the spouse — describes your life partner and business partners",
};

export default function PlanetDetails({ c, initialView }: { c: ChartData; initialView?: string }) {
  const [view, setView] = useState<View>(() => (VIEWS.find((x) => x.v === initialView)?.v ?? "Positions & Karakas"));
  const kar = charaKarakas(c);
  const reports = useMemo(() => allPlanetReports(c), [c]);
  const rep = (id: PlanetId) => reports.find((r) => r.id === id)!;
  const vel = useMemo(() => velocity(c), [c]);
  const nodes = useMemo(() => nodeBehaviour(c), [c]);
  const devs = useMemo(() => devatas(c), [c]);

  let content: React.ReactNode = null;

  if (view === "Positions & Karakas") {
    content = (
      <>
        <TableCard>
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60">
              <tr>
                <Th>Planet</Th>
                <Th>Sign</Th>
                <Th>Degree</Th>
                <Th>Nakshatra</Th>
                <Th>Pada</Th>
                <Th>Nak Lord</Th>
                <Th>House</Th>
                <Th>Karaka</Th>
                <Th>D9</Th>
                <Th>D10</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              <tr className="bg-amber-400/5">
                <Td>
                  <span className="font-bold text-amber-300">Ascendant</span>
                </Td>
                <Td>{SIGNS[c.asc.sign].sa}</Td>
                <Td cls="font-mono">{fmtDeg(c.asc.deg)}</Td>
                <Td>{NAKSHATRAS[c.asc.nak].name}</Td>
                <Td>{c.asc.pada}</Td>
                <Td>{NAKSHATRAS[c.asc.nak].lord}</Td>
                <Td>1</Td>
                <Td>—</Td>
                <Td>{SIGNS[c.asc.d9].sa}</Td>
                <Td>{SIGNS[c.asc.d10].sa}</Td>
              </tr>
              {c.planets.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <Td>
                    <PName id={p.id} /> {p.retro && !["Rahu", "Ketu"].includes(p.id) && <span className="text-xs text-amber-300">(R)</span>}
                  </Td>
                  <Td>{SIGNS[p.sign].sa}</Td>
                  <Td cls="font-mono">{fmtDeg(p.deg)}</Td>
                  <Td>{NAKSHATRAS[p.nak].name}</Td>
                  <Td>{p.pada}</Td>
                  <Td>{NAKSHATRAS[p.nak].lord}</Td>
                  <Td>{p.house}</Td>
                  <Td cls="text-sky-300 font-semibold">{kar[p.id] ?? "—"}</Td>
                  <Td>{SIGNS[p.d9].sa}</Td>
                  <Td>{SIGNS[p.d10].sa}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
        <Notes
          title="Chara Karakas (Jaimini) — what they mean for you"
          items={(Object.keys(kar) as PlanetId[])
            .sort((a, b) => ["AK", "AmK", "BK", "MK", "PiK", "GK", "DK"].indexOf(kar[a]!) - ["AK", "AmK", "BK", "MK", "PiK", "GK", "DK"].indexOf(kar[b]!))
            .map((id) => {
              const p = c.planets.find((x) => x.id === id)!;
              return {
                id,
                text: (
                  <>
                    <b className="text-sky-300">{KARAKA_FULL[kar[id]!]}</b> ({p.deg.toFixed(2)}° — {kar[id] === "AK" ? "highest" : kar[id] === "DK" ? "lowest" : "ranked"} degree): {KARAKA_MEANING[kar[id]!]}. Placed in {SIGNS[p.sign].sa}, house {p.house} ({BHAVAS[p.house - 1].title.toLowerCase()}), Navamsa {SIGNS[p.d9].sa}.
                  </>
                ),
              };
            })}
        />
      </>
    );
  } else if (view === "Strength & Conditions") {
    content = (
      <>
        <TableCard>
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60">
              <tr>
                <Th>Planet</Th>
                <Th>Verdict</Th>
                <Th>Dignity (D1)</Th>
                <Th>Functional</Th>
                <Th>Natural</Th>
                <Th>Owns</Th>
                <Th>Avastha</Th>
                <Th>Retro</Th>
                <Th>Combust</Th>
                <Th>Vargottama</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {c.planets.map((p) => {
                const r = rep(p.id);
                const av = baladiAvastha(p);
                return (
                  <tr key={p.id} className="hover:bg-white/5">
                    <Td>
                      <PName id={p.id} />
                    </Td>
                    <Td cls={r.score >= 62 ? "text-emerald-400 font-semibold" : r.score >= 45 ? "text-amber-300 font-semibold" : "text-rose-400 font-semibold"}>
                      {r.verdict} ({r.score})
                    </Td>
                    <Td cls={dignityColor(r.dignity as never)}>{r.dignity}</Td>
                    <Td cls={r.functional.good ? "text-emerald-400" : "text-rose-400"}>{r.functional.label}</Td>
                    <Td cls={r.natural === "Benefic" ? "text-emerald-400" : "text-rose-400"}>{r.natural}</Td>
                    <Td>{r.owns.join(", ") || "—"}</Td>
                    <Td>
                      {av} <span className="text-xs text-slate-500">{avasthaPower(av)}</span>
                    </Td>
                    <Td>{p.retro ? "Yes" : "No"}</Td>
                    <Td cls={p.combust ? "text-orange-400" : ""}>{p.combust ? "Yes" : "No"}</Td>
                    <Td cls={p.sign === p.d9 ? "text-emerald-400" : ""}>{p.sign === p.d9 ? "Yes" : "No"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableCard>
        <Notes
          title="Strength in plain words"
          items={c.planets.map((p) => {
            const r = rep(p.id);
            return {
              id: p.id,
              text: (
                <>
                  <span className="text-emerald-300">{r.strengths[0]}</span> <span className="text-rose-300">{r.weaknesses[0]}</span>
                </>
              ),
            };
          })}
        />
      </>
    );
  } else if (view === "Shadbala Breakdown") {
    content = <ShadbalaSection c={c} />;
  } else if (view === "Velocity & Brightness") {
    content = (
      <>
        <TableCard>
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60">
              <tr>
                <Th>Planet</Th>
                <Th>Daily Motion</Th>
                <Th>Mean Motion</Th>
                <Th>% of Mean</Th>
                <Th>Status</Th>
                <Th>Magnitude</Th>
                <Th>Brightness</Th>
                <Th>Latitude</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {vel.map((v) => (
                <tr key={v.id} className="hover:bg-white/5">
                  <Td>
                    <PName id={v.id} />
                  </Td>
                  <Td cls="font-mono">
                    {v.speed < 0 ? "-" : ""}
                    {fmtDeg(Math.abs(v.speed))}
                  </Td>
                  <Td cls="font-mono text-slate-400">{fmtDeg(v.mean)}</Td>
                  <Td>{v.pct.toFixed(0)}%</Td>
                  <Td cls={v.status.startsWith("Retro") ? "text-amber-300" : ""}>{v.status}</Td>
                  <Td cls="font-mono">{v.mag !== null ? v.mag.toFixed(2) : "—"}</Td>
                  <Td>
                    {v.bright}
                    {v.combust ? <span className="ml-1 text-xs text-orange-400">(combust)</span> : ""}
                  </Td>
                  <Td cls="font-mono text-slate-400">{v.lat.toFixed(2)}°</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
        <Notes
          title="What the motion means"
          items={vel.map((v) => ({
            id: v.id,
            text: v.status.startsWith("Always")
              ? "The nodes always move backwards through the zodiac; they act through their dispositor and conjunctions."
              : v.status.startsWith("Retro")
                ? `Retrograde — ${v.id} is closest to Earth and brightest; it gains Cheshta Bala and acts intensely, but its results are internalised, repeated or delayed. Past matters of its houses return for resolution.`
                : v.status.startsWith("Stationary")
                  ? `Nearly stationary — ${v.id}'s energy is concentrated and very powerful, like a pause before a turn; its matters become fixed and decisive.`
                  : v.status.startsWith("Slow")
                    ? `Slow-moving — ${v.id} is deliberate and steady; results come gradually but persist.`
                    : v.status.startsWith("Fast") || v.status.startsWith("Swift")
                      ? `Fast-moving — ${v.id} gives quick, active results; opportunities arrive rapidly but may not last unless acted upon.`
                      : `Moving at an average pace — ${v.id} gives balanced, timely results.`,
          }))}
        />
      </>
    );
  } else if (view === "Rahu & Ketu Behaviour") {
    content = (
      <div className="grid gap-4 md:grid-cols-2">
        {nodes.map((n) => (
          <div key={n.id} className="card border-l-4 p-5" style={{ borderLeftColor: PLANET_INFO[n.id].color }}>
            <div className="flex items-center justify-between">
              <PName id={n.id} />
              <span className={n.good ? "text-emerald-400" : "text-amber-300"}>{n.good ? "Well placed (Upachaya)" : "Needs care"}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <span className="text-slate-400">Sign / House</span>
              <span>
                {SIGNS[n.p.sign].sa} · H{n.p.house}
              </span>
              <span className="text-slate-400">Nakshatra</span>
              <span>
                {NAKSHATRAS[n.p.nak].name} ({n.nakLord})
              </span>
              <span className="text-slate-400">Dispositor</span>
              <span>{n.dispositor}</span>
              <span className="text-slate-400">Conjunctions</span>
              <span>{n.conj.join(", ") || "None"}</span>
              <span className="text-slate-400">Aspected by</span>
              <span>{n.aspBy.join(", ") || "None"}</span>
              <span className="text-slate-400">Acts like</span>
              <span className="font-semibold text-sky-300">{n.actsAs}</span>
              <span className="text-slate-400">Axis</span>
              <span>Houses {n.axis}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{n.desc}</p>
            <p className="mt-2 text-sm text-slate-400">
              Remedy: {PLANET_INFO[n.id].remedies[0]}; {PLANET_INFO[n.id].remedies[1]?.toLowerCase()}.
            </p>
          </div>
        ))}
      </div>
    );
  } else {
    content = (
      <>
        <TableCard>
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60">
              <tr>
                <Th>Planet</Th>
                <Th>Graha Devata</Th>
                <Th>Adhidevata</Th>
                <Th>Pratyadhidevata</Th>
                <Th>Nakshatra</Th>
                <Th>Nakshatra Deity</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {devs.map((d) => (
                <tr key={d.id} className="hover:bg-white/5">
                  <Td>
                    <PName id={d.id} />
                  </Td>
                  <Td cls="text-amber-200">{d.deity}</Td>
                  <Td>{d.adhi}</Td>
                  <Td>{d.pratyadhi}</Td>
                  <Td>{d.nak}</Td>
                  <Td cls="text-violet-300">{d.nakDeity}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
        <Notes
          title="Whom to worship for each planet"
          items={devs.map((d) => {
            const r = rep(d.id);
            const weak = r.verdict === "Weak" || r.verdict === "Very Weak";
            return {
              id: d.id,
              text: (
                <>
                  Worship <b className="text-amber-200">{d.deity}</b>
                  {weak ? " — especially recommended since this planet is weak in your chart" : !r.functional.good ? " — to pacify this functional malefic" : ""}. Day: {PLANET_INFO[d.id].day}. Mantra: <i className="text-slate-300">{PLANET_INFO[d.id].mantra}</i>.
                </>
              ),
            };
          })}
        />
      </>
    );
  }

  return (
    <div>
      <ClickHint title="Click a column heading to switch the view">
        Choose between Positions &amp; Karakas, Strength &amp; Conditions, Shadbala Breakdown, Velocity &amp; Brightness, Rahu &amp; Ketu Behaviour and Devatas.
        {view === "Shadbala Breakdown" ? " In Shadbala, click any planet row or planet button for its detailed breakdown." : ""}
      </ClickHint>
      <Tabs value={view} onChange={setView} />
      <p className="-mt-2 mb-4 text-sm text-slate-400">{VIEWS.find((x) => x.v === view)?.hint}</p>
      <div key={view} className="animate-pop">
        {content}
      </div>
    </div>
  );
}
