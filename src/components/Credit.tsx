export default function Credit({ className = "" }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <p className="font-serif text-base text-slate-300 sm:text-lg">
        <span className="glyph mr-2 text-amber-400">✦</span>
        Personally designed by <span className="text-shimmer font-semibold">Anirudh Vasa</span> with a special interest in astrology
        <span className="glyph ml-2 text-amber-400">✦</span>
      </p>
    </div>
  );
}
