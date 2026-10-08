"use client";

import { useId, useState } from "react";
import { PLANET_INFO, SIGNS, type PlanetId } from "@/lib/astro/data";

export interface Placement {
  id: PlanetId;
  sign: number;
  deg: number;
  retro: boolean;
  tag?: string;
  tagColor?: string;
}

interface Props {
  style: "north" | "south";
  ascSign: number;
  placements: Placement[];
  onHouseClick?: (house: number) => void;
  showDegrees?: boolean;
}

/** Element palette — fire, earth, air, water (sign index % 4). */
export const ELEMENT_COLORS = ["#fb923c", "#4ade80", "#38bdf8", "#a78bfa"];
export const ELEMENT_NAMES = ["Fire", "Earth", "Air", "Water"];

const NP = { TL: [0, 0], TR: [400, 0], BR: [400, 400], BL: [0, 400], MT: [200, 0], MR: [400, 200], MB: [200, 400], ML: [0, 200], C: [200, 200], P1: [100, 100], P2: [300, 100], P3: [300, 300], P4: [100, 300] } as const;
type K = keyof typeof NP;
const NORTH_POLYS: K[][] = [
  ["MT", "P2", "C", "P1"], ["TL", "MT", "P1"], ["TL", "P1", "ML"], ["ML", "P1", "C", "P4"], ["ML", "P4", "BL"], ["BL", "P4", "MB"],
  ["MB", "P4", "C", "P3"], ["MB", "P3", "BR"], ["BR", "P3", "MR"], ["MR", "P3", "C", "P2"], ["MR", "P2", "TR"], ["TR", "P2", "MT"],
];
const NORTH_CENTER: [number, number][] = [[200, 92], [100, 40], [40, 100], [92, 200], [40, 300], [100, 360], [200, 308], [300, 360], [360, 300], [308, 200], [360, 100], [300, 40]];
const NORTH_NUM: [number, number][] = [[200, 172], [100, 84], [84, 100], [172, 200], [84, 300], [100, 316], [200, 228], [300, 316], [316, 300], [228, 200], [316, 100], [300, 84]];
const SOUTH_CELL: [number, number][] = [[1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0]];

function PlanetText({ items, x, y, compact, showDegrees }: { items: Placement[]; x: number; y: number; compact: boolean; showDegrees: boolean }) {
  const cols = items.length > 3 ? 2 : 1;
  const rows = Math.ceil(items.length / cols);
  const lh = compact ? 15 : 17;
  const startY = y - ((rows - 1) * lh) / 2;
  return (
    <g style={{ paintOrder: "stroke" }} stroke="#070a1c" strokeWidth={3} strokeLinejoin="round">
      {items.map((p, i) => {
        const col = cols === 2 ? i % 2 : 0;
        const row = cols === 2 ? Math.floor(i / 2) : i;
        const px = cols === 2 ? x + (col === 0 ? -20 : 20) : x;
        return (
          <text key={p.id} x={px} y={startY + row * lh} textAnchor="middle" dominantBaseline="central" fontSize={compact ? 12 : 13.5} fontWeight={800} fill={PLANET_INFO[p.id].color}>
            {PLANET_INFO[p.id].short}
            {p.retro && !["Rahu", "Ketu"].includes(p.id) ? "ᴿ" : ""}
            {showDegrees && cols === 1 && (
              <tspan fontSize={9} fontWeight={500} fill="#cbd5e1">
                {" "}
                {Math.floor(p.deg)}°
              </tspan>
            )}
            {p.tag && (
              <tspan fontSize={cols === 1 ? 8.5 : 7} fontWeight={700} fill={p.tagColor ?? "#7dd3fc"}>
                {" "}
                {p.tag}
              </tspan>
            )}
          </text>
        );
      })}
    </g>
  );
}

function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <radialGradient id={`bg-${uid}`} cx="50%" cy="45%" r="75%">
        <stop offset="0%" stopColor="#2a1f5c" />
        <stop offset="55%" stopColor="#141238" />
        <stop offset="100%" stopColor="#090a1f" />
      </radialGradient>
      <linearGradient id={`line-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#f472b6" />
      </linearGradient>
      <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {ELEMENT_COLORS.map((col, i) => (
        <radialGradient key={i} id={`el${i}-${uid}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor={col} stopOpacity="0.22" />
          <stop offset="100%" stopColor={col} stopOpacity="0.04" />
        </radialGradient>
      ))}
    </defs>
  );
}

function SignBadge({ x, y, sign }: { x: number; y: number; sign: number }) {
  const col = ELEMENT_COLORS[sign % 4];
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={9} fill={col} fillOpacity={0.22} stroke={col} strokeOpacity={0.7} strokeWidth={0.8} />
      <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill="#f8fafc">
        {sign + 1}
      </text>
    </g>
  );
}

export default function ChartSVG({ style, ascSign, placements, onHouseClick, showDegrees = true }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  const bySign = (s: number) => placements.filter((p) => p.sign === s);
  const line = `url(#line-${uid})`;
  const houseFill = (h: number, sign: number) => (hover === h ? "rgba(251,191,36,0.28)" : `url(#el${sign % 4}-${uid})`);

  if (style === "north") {
    return (
      <svg viewBox="-6 -6 412 412" className="h-auto w-full select-none drop-shadow-[0_10px_30px_rgba(124,58,237,0.25)]">
        <Defs uid={uid} />
        <rect x="-3" y="-3" width="406" height="406" rx="10" fill={`url(#bg-${uid})`} stroke={line} strokeWidth="2.5" filter={`url(#glow-${uid})`} />
        {NORTH_POLYS.map((poly, i) => {
          const h = i + 1;
          const sign = (ascSign + i) % 12;
          const pts = poly.map((k) => NP[k].join(",")).join(" ");
          return (
            <polygon
              key={h}
              points={pts}
              fill={houseFill(h, sign)}
              stroke={line}
              strokeWidth={hover === h ? 2.2 : 1.3}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHover(h)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onHouseClick?.(h)}
            >
              <title>{`House ${h} · ${SIGNS[sign].sa} (${SIGNS[sign].en}) — click for details`}</title>
            </polygon>
          );
        })}
        {NORTH_POLYS.map((_, i) => {
          const h = i + 1;
          const sign = (ascSign + i) % 12;
          const [nx, ny] = NORTH_NUM[i];
          const [cx, cy] = NORTH_CENTER[i];
          const tri = ![1, 4, 7, 10].includes(h);
          return (
            <g key={h} pointerEvents="none">
              <SignBadge x={nx} y={ny} sign={sign} />
              {h === 1 && (
                <text x={200} y={145} textAnchor="middle" fontSize="9" fontWeight={700} fill="#fbbf24" letterSpacing="3">
                  ASC
                </text>
              )}
              <PlanetText items={bySign(sign)} x={cx} y={h === 1 ? 85 : cy} compact={tri} showDegrees={showDegrees} />
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <svg viewBox="-6 -6 412 412" className="h-auto w-full select-none drop-shadow-[0_10px_30px_rgba(124,58,237,0.25)]">
      <Defs uid={uid} />
      <rect x="-3" y="-3" width="406" height="406" rx="10" fill={`url(#bg-${uid})`} stroke={line} strokeWidth="2.5" filter={`url(#glow-${uid})`} />
      {SOUTH_CELL.map(([cx, cy], sign) => {
        const h = ((sign - ascSign + 12) % 12) + 1;
        const x = cx * 100;
        const y = cy * 100;
        const col = ELEMENT_COLORS[sign % 4];
        return (
          <g key={sign}>
            <rect x={x + 2} y={y + 2} width="96" height="96" rx="6" fill={houseFill(h, sign)} stroke={line} strokeWidth={hover === h ? 2.2 : 1.2} className="cursor-pointer transition-all" onMouseEnter={() => setHover(h)} onMouseLeave={() => setHover(null)} onClick={() => onHouseClick?.(h)}>
              <title>{`House ${h} · ${SIGNS[sign].sa} (${SIGNS[sign].en}) — click for details`}</title>
            </rect>
            <g pointerEvents="none">
              <text x={x + 8} y={y + 16} fontSize="10" fontWeight={700} fill={col}>
                {SIGNS[sign].sa}
              </text>
              <text x={x + 92} y={y + 16} fontSize="9" fontWeight={600} fill="#94a3b8" textAnchor="end">
                H{h}
              </text>
              {sign === ascSign && (
                <>
                  <line x1={x + 4} y1={y + 32} x2={x + 32} y2={y + 4} stroke="#fbbf24" strokeWidth="2" />
                  <text x={x + 50} y={y + 90} fontSize="9" fontWeight={700} fill="#fbbf24" textAnchor="middle" letterSpacing="3">
                    ASC
                  </text>
                </>
              )}
              <PlanetText items={bySign(sign)} x={x + 50} y={y + 55} compact showDegrees={showDegrees} />
            </g>
          </g>
        );
      })}
      <rect x="104" y="104" width="192" height="192" rx="8" fill="#0b0d26" fillOpacity="0.85" stroke={line} strokeWidth="1.2" />
      <text x="200" y="192" textAnchor="middle" fontSize="13" fill="#fde68a" fontWeight={700} letterSpacing="2" className="glyph">
        ☉ ☽ ✦
      </text>
      <text x="200" y="214" textAnchor="middle" fontSize="9" fill="#94a3b8" letterSpacing="2">
        RĀŚI CHAKRA
      </text>
    </svg>
  );
}

export function ChartLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-400">
      {ELEMENT_NAMES.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ELEMENT_COLORS[i] }} /> {n}
        </span>
      ))}
      <span>ᴿ Retrograde</span>
      <span>Numbers = sign</span>
    </div>
  );
}
