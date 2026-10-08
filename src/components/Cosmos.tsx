import { SIGNS } from "@/lib/astro/data";

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function Starfield({ count = 80 }: { count?: number }) {
  const r = rng(42);
  const stars = Array.from({ length: count }, () => ({ x: r() * 100, y: r() * 100, s: r() * 2 + 0.5, d: r() * 5 + 2, delay: r() * 5 }));
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {stars.map((s, i) => (
        <span key={i} className="animate-twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDuration: `${s.d}s`, animationDelay: `${s.delay}s` }} />
      ))}
      <span className="shooting-star" style={{ top: "8%", left: "90%" }} />
      <span className="shooting-star" style={{ top: "25%", left: "70%", animationDelay: "4s" }} />
      <span className="shooting-star" style={{ top: "2%", left: "50%", animationDelay: "7s" }} />
      <div className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[120px]" />
      <div className="absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-fuchsia-700/15 blur-[120px]" />
    </div>
  );
}

const ORBITS = [
  { name: "Mercury", size: 150, dur: 8, planet: 10, color: "radial-gradient(circle at 30% 30%, #d1fae5, #22c55e)", glyph: "☿" },
  { name: "Venus", size: 210, dur: 14, planet: 14, color: "radial-gradient(circle at 30% 30%, #fce7f3, #ec4899)", glyph: "♀" },
  { name: "Moon", size: 270, dur: 20, planet: 13, color: "radial-gradient(circle at 30% 30%, #ffffff, #94a3b8)", glyph: "☽" },
  { name: "Mars", size: 330, dur: 28, planet: 12, color: "radial-gradient(circle at 30% 30%, #fecaca, #dc2626)", glyph: "♂" },
  { name: "Jupiter", size: 410, dur: 42, planet: 24, color: "radial-gradient(circle at 30% 30%, #fef3c7, #d97706 60%, #92400e)", glyph: "♃" },
  { name: "Saturn", size: 490, dur: 60, planet: 20, color: "radial-gradient(circle at 30% 30%, #dbeafe, #3b82f6 60%, #1e3a8a)", glyph: "♄", ring: true },
];

export function SolarSystem() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" aria-hidden>
      {/* zodiac wheel */}
      <div className="animate-orbit absolute inset-0" style={{ animationDuration: "180s" }}>
        <svg viewBox="0 0 560 560" className="h-full w-full">
          <defs>
            <linearGradient id="zg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="1" stopColor="#a78bfa" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <circle cx="280" cy="280" r="275" fill="none" stroke="url(#zg)" strokeWidth="1.2" />
          <circle cx="280" cy="280" r="240" fill="none" stroke="url(#zg)" strokeWidth="0.6" strokeDasharray="2 6" />
          {SIGNS.map((s, i) => {
            const a = ((i * 30 - 90 + 15) * Math.PI) / 180;
            const a2 = ((i * 30 - 90) * Math.PI) / 180;
            return (
              <g key={s.en}>
                <line x1={280 + 240 * Math.cos(a2)} y1={280 + 240 * Math.sin(a2)} x2={280 + 275 * Math.cos(a2)} y2={280 + 275 * Math.sin(a2)} stroke="#f59e0b" strokeOpacity="0.5" />
                <text x={280 + 258 * Math.cos(a)} y={280 + 258 * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fontSize="18" fill="#fde68a" className="glyph" transform={`rotate(${i * 30 + 15} ${280 + 258 * Math.cos(a)} ${280 + 258 * Math.sin(a)})`}>
                  {s.glyph + "\uFE0E"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* orbits */}
      {ORBITS.map((o) => (
        <div key={o.name} className="absolute left-1/2 top-1/2" style={{ width: `${(o.size / 560) * 100}%`, height: `${(o.size / 560) * 100}%`, transform: "translate(-50%, -50%)" }}>
          <div className="absolute inset-0 rounded-full border border-slate-400/15" />
          <div className="animate-orbit absolute inset-0" style={{ animationDuration: `${o.dur}s` }}>
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <div className="animate-counter relative flex items-center justify-center" style={{ animationDuration: `${o.dur}s` }}>
                <div className="rounded-full shadow-[0_0_18px_rgba(255,255,255,0.35)]" style={{ width: o.planet, height: o.planet, background: o.color }} />
                {o.ring && <div className="absolute h-[8px] w-[40px] rounded-[50%] border-2 border-sky-200/70" style={{ transform: "rotate(-20deg)" }} />}
                <span className="glyph absolute -bottom-5 text-[11px] text-slate-300/80">{o.glyph + "\uFE0E"}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* sun */}
      <div className="animate-sun absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #fff7ed, #fbbf24 40%, #f97316 75%, #c2410c)" }}>
        <span className="glyph text-3xl text-orange-900/60">☉{"\uFE0E"}</span>
      </div>
    </div>
  );
}

export function FloatingGlyphs() {
  const r = rng(7);
  const items = [...SIGNS.map((s) => s.glyph), "☉", "☽", "♂", "☿", "♃", "♀", "♄", "☊", "☋", "ॐ"].map((g) => ({ g, x: r() * 95, y: r() * 95, d: 6 + r() * 8, delay: r() * 6, size: 14 + r() * 22 }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {items.map((it, i) => (
        <span key={i} className="glyph animate-floaty absolute text-amber-200/15" style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: it.size, animationDuration: `${it.d}s`, animationDelay: `${it.delay}s` }}>
          {it.g + "\uFE0E"}
        </span>
      ))}
    </div>
  );
}
