export default function Credit({ className = "" }: { className?: string }) {
  return (
    <p className={`font-serif text-base text-slate-300 sm:text-lg ${className}`}>
      <span className="glyph mr-2 text-amber-400">✦</span>
      The sky wrote your first chapter. We help you read the rest.
      <span className="glyph ml-2 text-amber-400">✦</span>
    </p>
  );
}
