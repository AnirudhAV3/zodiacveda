import type { ReactNode } from "react";

/** Eye-catching instruction banner shown above every interactive element. */
export default function ClickHint({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-fuchsia-500/10 to-transparent px-4 py-3 ${className}`}>
      <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-lg">
        <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/20" />
        <span className="relative">👆</span>
      </span>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-amber-300">{title}</p>
        <p className="mt-0.5 text-sm text-slate-200">{children}</p>
      </div>
    </div>
  );
}
