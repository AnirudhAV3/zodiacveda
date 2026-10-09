import Link from "next/link";

interface Tile {
  href?: string;
  icon: string;
  title: string;
  description: string;
  tags: string[];
  action?: string;
  accent: string;
  status: "available" | "soon";
}

/** Tile order is fixed: Build Your Horoscope first, Marriage Horoscope second. */
export const CALCULATOR_TILES: Tile[] = [
  { href: "/build", icon: "🪐", title: "Build Your Horoscope", description: "Your complete Kundli: D1/D9/D10 charts, interactive houses, Vimshottari dashas, predictions, planetary strengths, yogas, doshas and a PDF report.", tags: ["Full birth chart", "PDF report"], action: "Build my chart", accent: "#fbbf24", status: "available" },
  { href: "/calculators/marriage-matching", icon: "💞", title: "Marriage Horoscope Matching", description: "36-point Ashtakoota Guna Milan for two people, with Manglik comparison, Nadi & Bhakoot review, both charts and guidance.", tags: ["8 factors", "Two charts"], action: "Match horoscopes", accent: "#f472b6", status: "available" },
  { href: "/calculators/western-horoscope", icon: "☉", title: "Western Horoscope", description: "A tropical chart with Sun, Moon and Rising signs, planetary houses and major aspects from your birth details.", tags: ["Tropical zodiac", "Major aspects"], action: "Cast Western chart", accent: "#fb923c", status: "available" },
  { href: "/calculators/jyotirlinga", icon: "🕉", title: "Jyotirlingas to Visit", description: "Six traditional shrine suggestions counted from your Moon sign and Lagna for strength, obstacles and fortune.", tags: ["6 shrines", "Moon & Lagna"], action: "Find my Jyotirlingas", accent: "#fcd34d", status: "available" },
  { href: "/calculators/all-yogas", icon: "🔱", title: "All Yogas", description: "Every classical yoga checked on your chart — Raja, Dhana, Mahapurusha, Chandra, Nabhasa and Arishta — with strength, timing and remedies.", tags: ["125 definitions", "Strength & timing"], action: "Find my yogas", accent: "#a78bfa", status: "available" },
  { href: "/calculators/all-doshas", icon: "🛡", title: "All Doshas", description: "Mangal, Kaal Sarp, Pitra, Grahan, Guru Chandal, Kemadruma, Shrapit and Angarak doshas plus Sade Sati — with severity, cancellations, timing and remedies.", tags: ["9 doshas", "Sade Sati dates"], action: "Check my doshas", accent: "#fb7185", status: "available" },
  { href: "/calculators/gemstones", icon: "💎", title: "Gemstone Calculator", description: "Which stones suit your chart and which to avoid, with reasons — plus weight, metal, finger, day, mantra and lower-cost substitutes.", tags: ["All 9 stones", "Avoid list"], action: "Find my gemstones", accent: "#38bdf8", status: "available" },
  { href: "/calculators/divisional-charts", icon: "📜", title: "All Divisional Charts", description: "All 16 Shodashvarga charts from D1 to D60, drawn and explained, with Vimsopaka strength and Vargottama planets.", tags: ["16 charts", "Vimsopaka strength"], action: "Generate all charts", accent: "#2dd4bf", status: "available" },
  { href: "/calculators/kaal-sarp", icon: "🐍", title: "Kaal Sarp Dosha", description: "Full or partial node-axis enclosure, exact type, planet order, boundary distances, affected houses, supportive factors and remedies.", tags: ["12 types", "Axis audit"], action: "Check Kaal Sarp", accent: "#c084fc", status: "available" },
  { href: "/calculators/mangal-dosha", icon: "♂", title: "Kuja / Mangal Dosha", description: "Mars from Lagna, Moon and Venus, all cancellation rules, intensity, Navamsa Mars and full marriage context.", tags: ["3 references", "Cancellations"], action: "Check Mangal Dosha", accent: "#f87171", status: "available" },
  { href: "/calculators/nakshatra-rashi", icon: "⭐", title: "Nakshatra & Rashi", description: "Exact Moon sign, Janma Nakshatra and Pada with Avakhada, Panchang, all four padas, Tara Chakra, lucky factors and interpretation.", tags: ["Exact Moon degree", "Avakhada & Tara"], action: "Find my birth star", accent: "#fcd34d", status: "available" },
  { href: "/calculators/vimshottari-dasha", icon: "⏳", title: "Vimshottari Dasha", description: "Complete 120-year Mahadasha, Antardasha and Pratyantar timeline with current-period analysis, five-year forecast and remedies.", tags: ["3-level timeline", "Period predictions"], action: "Calculate my dashas", accent: "#60a5fa", status: "available" },
  { href: "/calculators/sade-sati", icon: "🪐", title: "Sade Sati", description: "Live Saturn status, exact rising/peak/setting phase dates, Shani Dhaiya, natal Saturn strength, running dasha and remedies.", tags: ["Exact dates", "Dhaiya check"], action: "Check Sade Sati", accent: "#94a3b8", status: "available" },
];

function TileBody({ tile }: { tile: Tile }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: `${tile.accent}22` }}>{tile.icon}</span>
        {tile.status === "available"
            ? <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">Available</span>
          : <span className="rounded-full border border-slate-600/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Coming soon</span>}
      </div>
      <h3 className="mt-4 font-serif text-2xl font-semibold" style={{ color: tile.status === "available" ? tile.accent : "#94a3b8" }}>{tile.title}</h3>
      <p className={`mt-2 flex-1 text-sm leading-relaxed ${tile.status === "available" ? "text-slate-300" : "text-slate-500"}`}>{tile.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">{tile.tags.map((t) => <span key={t} className="rounded-full border border-slate-600/60 px-2.5 py-1 text-[11px] text-slate-400">{t}</span>)}</div>
      {tile.action && <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: tile.accent }}>{tile.action} <span className="transition group-hover:translate-x-1">→</span></p>}
    </>
  );
}

export default function CalculatorDirectory() {
  return (
    <section id="calculators" className="relative z-10 mx-auto max-w-7xl scroll-mt-8 px-6 pb-20">
      <div className="mb-8 text-center">
        <p className="label-caps !text-amber-300">Explore your horoscope</p>
        <h2 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Vedic Astrology Calculators</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-400">{CALCULATOR_TILES.filter((tile) => tile.status === "available").length} calculators ready now. Each uses the same accurate birth-chart engine and explains how its result was reached.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CALCULATOR_TILES.map((tile) =>
          tile.href ? (
            <Link key={tile.title} href={tile.href} className="card group flex min-h-[260px] flex-col p-6 transition hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-[0_18px_50px_rgba(167,139,250,0.14)]">
              <TileBody tile={tile} />
            </Link>
          ) : (
            <div key={tile.title} aria-disabled="true" className="card flex min-h-[260px] cursor-not-allowed flex-col p-6 opacity-70">
              <TileBody tile={tile} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
