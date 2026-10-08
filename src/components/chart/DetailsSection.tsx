import type { ChartData } from "@/lib/astro/calc";
import { fmtDeg } from "@/lib/astro/calc";
import { avakhada, lucky } from "@/lib/astro/analysis";

function Item({ k, v, accent }: { k: string; v: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 px-4 py-3">
      <p className="label-caps">{k}</p>
      <p className={`mt-1 font-semibold ${accent ?? "text-slate-100"}`}>{v}</p>
    </div>
  );
}

export default function DetailsSection({ c }: { c: ChartData }) {
  const a = avakhada(c);
  const l = lucky(c);
  const off = c.tzOffsetMin;
  const offStr = `UTC${off >= 0 ? "+" : "-"}${String(Math.floor(Math.abs(off) / 60)).padStart(2, "0")}:${String(Math.abs(off) % 60).padStart(2, "0")}`;
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 font-serif text-2xl text-amber-200">Birth Particulars</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Item k="Name" v={c.input.name} />
          <Item k="Date / Time" v={`${c.input.date.split("-").reverse().join("-")} · ${c.input.time}`} />
          <Item k="Place" v={c.input.place} />
          <Item k="Coordinates" v={`${c.input.lat.toFixed(3)}°, ${c.input.lon.toFixed(3)}°`} />
          <Item k="Time Zone" v={`${c.input.tz} (${offStr})`} />
          <Item k="Ayanamsa (Lahiri)" v={fmtDeg(c.ayanamsa)} />
          <Item k="Sunrise / Sunset" v={`${c.panchang.sunrise ?? "—"} / ${c.panchang.sunset ?? "—"}`} />
          <Item k="Vaar (Vedic day)" v={c.panchang.vaar} />
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-serif text-2xl text-amber-200">Avakhada Chakra — Your Core Identity</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Item k="Lagna (Ascendant)" v={`${a.lagna.sa} (${a.lagna.en})`} accent="text-amber-300" />
          <Item k="Lagna Lord" v={a.lagnaLord} />
          <Item k="Rashi (Moon Sign)" v={`${a.rashi.sa} (${a.rashi.en})`} accent="text-amber-300" />
          <Item k="Rashi Lord" v={a.rashiLord} />
          <Item k="Nakshatra (Star)" v={`${a.nakshatra.name} — Pada ${a.pada}`} accent="text-violet-300" />
          <Item k="Nakshatra Lord" v={a.nakLord} />
          <Item k="Sun Sign (Sidereal)" v={`${a.sunSign.sa} (${a.sunSign.en})`} />
          <Item k="Name Syllable" v={a.syllable} accent="text-pink-300" />
          <Item k="Gana" v={a.gana} />
          <Item k="Varna" v={a.varna} />
          <Item k="Yoni" v={a.yoni} />
          <Item k="Nadi" v={a.nadi} />
          <Item k="Vashya" v={a.vashya} />
          <Item k="Tatva (Element)" v={a.tatva} />
          <Item k="Paya" v={a.paya} />
          <Item k="Nakshatra Deity" v={a.nakDeity} />
          <Item k="Tithi" v={`${c.panchang.paksha} ${c.panchang.tithi}`} />
          <Item k="Nitya Yoga" v={c.panchang.yoga} />
          <Item k="Karana" v={c.panchang.karana} />
          <Item k="Nakshatra Symbol" v={a.nakSymbol} />
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-serif text-2xl text-amber-200">Your Lucky Factors</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Item k="Lucky Days" v={l.days.join(", ")} accent="text-emerald-300" />
          <Item k="Lucky Numbers" v={l.numbers.join(", ")} accent="text-emerald-300" />
          <Item k="Birth / Destiny No." v={`${l.birthNumber} / ${l.destinyNumber}`} />
          <Item k="Lucky Colours" v={l.colors.join(", ")} />
          <Item k="Life Stone (Lagna)" v={l.lifeStone} accent="text-sky-300" />
          <Item k="Lucky Stone (5th)" v={l.luckyStone} accent="text-sky-300" />
          <Item k="Fortune Stone (9th)" v={l.fortuneStone} accent="text-sky-300" />
          <Item k="Lucky Metal" v={l.metal} />
          <Item k="Lucky Direction" v={l.direction} />
          <Item k="Presiding Deity" v={l.deity} accent="text-amber-300" />
          <Item k="Ishta Devata" v={l.ishtaDevata} accent="text-amber-300" />
          <Item k="Fasting Day" v={l.fastingDay} />
          <Item k="Auspicious Letters" v={l.letters} />
          <Item k="Grain to Donate" v={l.grain} />
          <Item k="Ghatak (Avoid) Day" v={l.ghatakDay} accent="text-rose-300" />
          <Item k="Lagna Lord Mantra" v={<span className="text-sm">{l.mantra}</span>} />
        </div>
      </div>
    </div>
  );
}
