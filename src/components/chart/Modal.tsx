"use client";

import { useEffect, type ReactNode } from "react";

export default function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#05040f]/80 p-3 backdrop-blur-md sm:items-center sm:p-6" onClick={onClose}>
      <div
        className={`animate-pop scroll-thin relative max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-amber-300/20 bg-gradient-to-b from-[#1c1846] via-[#121534] to-[#0a0c22] shadow-[0_0_0_1px_rgba(167,139,250,0.15),0_30px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(124,58,237,0.25)] ${wide ? "max-w-5xl" : "max-w-3xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="sticky right-4 top-4 z-20 float-right mr-4 mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-2xl text-slate-200 backdrop-blur hover:bg-rose-500/80 hover:text-white">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export function Row({ k, v, vClass = "text-slate-100" }: { k: string; v: ReactNode; vClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-700/40 py-2.5">
      <span className="label-caps pt-0.5">{k}</span>
      <span className={`text-right font-semibold ${vClass}`}>{v}</span>
    </div>
  );
}
