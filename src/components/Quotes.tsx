"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  { q: "Millionaires don't use astrology, billionaires do.", a: "J.P. Morgan", note: "attributed" },
  { q: "Astrology is a science in itself and contains an illuminating body of knowledge. It taught me many things, and I am greatly indebted to it.", a: "Albert Einstein", note: "attributed" },
  { q: "We are born at a given moment, in a given place, and like vintage years of wine, we have the qualities of the year and of the season in which we are born.", a: "Carl Jung", note: "psychiatrist" },
  { q: "I have studied the subject, Mr. Halley, you have not.", a: "Sir Isaac Newton", note: "attributed" },
  { q: "The stars incline, they do not compel.", a: "Thomas Aquinas", note: "attributed" },
  { q: "A physician without a knowledge of astrology has no right to call himself a physician.", a: "Hippocrates", note: "attributed" },
  { q: "Astrology is astronomy brought down to earth and applied toward the affairs of men.", a: "Ralph Waldo Emerson", note: "attributed" },
  { q: "It is the stars, the stars above us, govern our conditions.", a: "William Shakespeare", note: "King Lear" },
];

export default function Quotes() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % QUOTES.length), 6500);
    return () => clearInterval(t);
  }, []);
  const q = QUOTES[i];
  return (
    <div className="card relative mx-auto max-w-3xl overflow-hidden p-8 text-center sm:p-10">
      <div className="pointer-events-none absolute -top-6 left-4 font-serif text-[120px] leading-none text-amber-400/15">“</div>
      <div key={i} className="animate-fade-up">
        <p className="font-serif text-2xl leading-snug text-slate-100 sm:text-3xl">“{q.q}”</p>
        <p className="mt-5 text-sm uppercase tracking-[0.2em] text-amber-300">
          — {q.a} <span className="normal-case tracking-normal text-slate-500">({q.note})</span>
        </p>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {QUOTES.map((_, k) => (
          <button key={k} aria-label={`Quote ${k + 1}`} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-amber-400" : "w-2 bg-slate-600 hover:bg-slate-400"}`} />
        ))}
      </div>
    </div>
  );
}
