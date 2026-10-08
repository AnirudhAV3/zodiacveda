import Link from "next/link";

/**
 * Original Zodiac Veda astrolabe crest.
 * Luxury horology-inspired, but deliberately not based on any watchmaker's trademark.
 */
export function LogoMark({ size = 46, className = "" }: { size?: number; className?: string }) {
  const indices = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="zv-dial" cx="36%" cy="29%" r="76%">
          <stop stopColor="#292548" />
          <stop offset=".52" stopColor="#111027" />
          <stop offset="1" stopColor="#070713" />
        </radialGradient>
        <linearGradient id="zv-gold" x1="18" y1="13" x2="78" y2="83" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF4BC" />
          <stop offset=".24" stopColor="#DAB86B" />
          <stop offset=".52" stopColor="#FFF0AA" />
          <stop offset=".78" stopColor="#B6822E" />
          <stop offset="1" stopColor="#F4D98C" />
        </linearGradient>
        <filter id="zv-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity=".55" />
        </filter>
      </defs>

      <circle cx="48" cy="48" r="44" fill="url(#zv-dial)" stroke="#6F5729" strokeWidth="1.2" filter="url(#zv-shadow)" />
      <circle cx="48" cy="48" r="40.5" stroke="url(#zv-gold)" strokeWidth="1.8" />
      <circle cx="48" cy="48" r="35" stroke="#A98B4D" strokeWidth=".7" opacity=".8" />
      <circle cx="48" cy="48" r="27.5" stroke="#D8BA72" strokeWidth=".55" opacity=".42" />

      {/* Twelve zodiac/hour indices. */}
      {indices.map((rotation) => (
        <g key={rotation} transform={`rotate(${rotation} 48 48)`}>
          <path d="M48 8.5 50 12.5 48 16.5 46 12.5Z" fill="url(#zv-gold)" />
          <circle cx="48" cy="19.2" r="1" fill="#E6CC86" opacity=".72" />
        </g>
      ))}

      {/* Astrolabe meridians and ecliptic. */}
      <ellipse cx="48" cy="48" rx="29" ry="12.5" transform="rotate(-23 48 48)" stroke="#D9BB72" strokeWidth=".8" opacity=".48" />
      <ellipse cx="48" cy="48" rx="29" ry="12.5" transform="rotate(67 48 48)" stroke="#D9BB72" strokeWidth=".65" opacity=".28" />
      <path d="M23 48h50M48 23v50" stroke="#CCAC61" strokeWidth=".55" opacity=".28" />

      {/* Original four-point Vedic compass ornament. */}
      <path d="M48 20.5 52 35.5 48 40 44 35.5 48 20.5Z" fill="url(#zv-gold)" opacity=".9" />
      <path d="M75.5 48 60.5 52 56 48 60.5 44 75.5 48Z" fill="url(#zv-gold)" opacity=".72" />
      <path d="M48 75.5 44 60.5 48 56 52 60.5 48 75.5Z" fill="url(#zv-gold)" opacity=".62" />
      <path d="M20.5 48 35.5 44 40 48 35.5 52 20.5 48Z" fill="url(#zv-gold)" opacity=".72" />

      <circle cx="48" cy="48" r="18" fill="#0C0B1C" stroke="url(#zv-gold)" strokeWidth="1.35" />
      <circle cx="48" cy="48" r="15.2" stroke="#80652F" strokeWidth=".55" />

      {/* Custom ZV monogram, drawn as geometry rather than text. */}
      <path d="M34 36h23L38 50h19" stroke="url(#zv-gold)" strokeWidth="3.1" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="m36 43 12 18 12-25" stroke="#FFF0AE" strokeWidth="3.2" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="M37 64c7.2-2.8 14.8-2.8 22 0" stroke="#B99142" strokeWidth="1" strokeLinecap="round" />
      <circle cx="48" cy="48" r="2.25" fill="#F7D982" />
    </svg>
  );
}

export default function BrandLogo({ href = "/", compact = false, className = "" }: { href?: string; compact?: boolean; className?: string }) {
  return (
    <Link href={href} aria-label="Zodiac Veda home" className={`group inline-flex shrink-0 items-center gap-3 ${className}`}>
      <LogoMark size={compact ? 39 : 48} className="transition duration-500 group-hover:rotate-[8deg] group-hover:scale-[1.04]" />
      <span className="flex flex-col leading-none">
        <span className={`${compact ? "text-[1.25rem]" : "text-[1.55rem]"} whitespace-nowrap font-serif font-semibold tracking-[0.035em] text-[#F4D98C]`}>
          Zodiac <span className="text-[#DDD2B0]">Veda</span>
        </span>
        {!compact && <span className="mt-1 whitespace-nowrap text-[0.52rem] font-semibold uppercase tracking-[0.32em] text-slate-500">Vedic Astrology</span>}
      </span>
    </Link>
  );
}
