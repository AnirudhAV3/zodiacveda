import Link from "next/link";
import { Starfield } from "@/components/Cosmos";
import SingleBirthForm from "@/components/calculators/SingleBirthForm";
import CalculatorSeoContent from "@/components/seo/CalculatorSeoContent";
import { calculatorMetadata } from "@/lib/seo/catalog";
import BrandLogo from "@/components/BrandLogo";

export const metadata = calculatorMetadata("vimshottari-dasha");

export default function VimshottariDashaPage() {
  return (
    <main className="relative min-h-screen px-4 py-6 sm:px-6">
      <Starfield count={55} />
      <nav className="mx-auto mb-8 flex max-w-5xl flex-wrap items-center justify-between gap-3"><BrandLogo compact /><Link href="/#calculators" className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-amber-400">← Calculators</Link></nav>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center"><span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 text-3xl">⏳</span><p className="label-caps !text-amber-300">Calculator 08 · 120-year cycle</p><h1 className="mt-2 font-serif text-4xl font-semibold text-slate-100 sm:text-5xl">Vimshottari Dasha Calculator</h1><p className="mx-auto mt-3 max-w-2xl text-slate-400">Your complete Mahadasha → Antardasha → Pratyantar timeline, current-period analysis, next transitions, predictions and remedies.</p></header>
        <SingleBirthForm endpoint="/api/vimshottari-dasha" draftKey="jyotisha:vimshottari-dasha:draft-v1" submitLabel="Calculate my dasha timeline →" busyLabel="Building the 120-year timeline…" intro="The sequence starts from your Moon's birth Nakshatra lord. The exact Moon position determines the balance remaining at birth. Every period uses your real natal houses, lordships, dignity and planetary condition for its interpretation." showStyle={false} />
      </div>
      <CalculatorSeoContent slug="vimshottari-dasha" /><footer className="mx-auto mt-12 max-w-5xl border-t border-slate-800 py-6"></footer>
    </main>
  );
}
